import crypto from "crypto";
import { Request } from "express";
import TransactionService from "./transaction.service";
import {
  BadRequestException,
  NotFoundException,
} from "../utils/exceptions/customException";
import { calculateTariff } from "../utils/service/calculateTariff";
import { buyPower } from "../utils/service/meterServices/buyPower";
import discordLogger from "../utils/logger/discordLogger";
import TransactionRepository from "../repository/transaction.repository";
import {
  Fee,
  NotificationType,
  Transaction,
  TrxnCategory,
  TrxnStatus,
} from "../../prisma/generated/prisma";
import axios from "axios";
import {
  CreateFeeDto,
  CreatePaymentSplitDto,
  ResolvePendingResponse,
  UpdateFeeDto,
} from "../types/payment";
import PaymentRepository from "../repository/payment.repository";
import AuditLogService from "./audit.service";
import { JwtPayload } from "jsonwebtoken";
import VendingService from "./vending.service";
import config from "../configs/app/env";
import { CreateNotifyDto } from "../types/notification";
import UserRepository from "../repository/user.repository";
import { injectable } from "tsyringe";
import NotificationService from "./notification.service";
import PropertyRepository from "../repository/property.repository";

/**
 * Service class for handling payment-related operations.
 *
 * @remarks
 * The `PaymentService` class provides methods to process payment webhooks,
 * specifically handling Paystack webhook events. It verifies the webhook signature,
 * processes the transaction, updates the transaction status, handles vending logic,
 * and logs relevant events to Discord for monitoring and auditing.
 *
 * @method paystackWebhook
 * Handles incoming Paystack webhook requests. Verifies the request signature,
 * checks transaction status, updates the transaction record, attempts vending,
 * and logs all relevant events. Throws exceptions for invalid signatures or
 * missing transactions.
 *
 * @param req - The Express request object containing the webhook payload and headers.
 * @returns A promise that resolves when the webhook is processed.
 * @throws NotFoundException if the transaction reference is not found.
 * @throws BadRequestException if the webhook signature is invalid.
 */
@injectable()
class PaymentService {
  constructor(
    private notificationService: NotificationService,
    private transactionService: TransactionService,
    private vendingService: VendingService,
    private auditService: AuditLogService,
    private transactionRepo: TransactionRepository,
    private paymentRepo: PaymentRepository,
    private propertyRepo: PropertyRepository,
    private userRepo: UserRepository,
  ) {}

  /**
   * Handles incoming Paystack webhook requests.
   *
   * @param req - The Express request object containing the webhook payload and headers.
   * @returns A promise that resolves when the webhook is processed.
   * @throws NotFoundException if the transaction reference is not found.
   * @throws BadRequestException if the webhook signature is invalid.
   */
  public async paystackWebhook(req: Request) {
    // Verify the webhook signature
    // Paystack sends a signature in the headers, which we can use to verify the request
    const hash = crypto
      .createHmac("sha512", config.paystack_secret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    // Check if the signature matches
    if (hash == req.headers["x-paystack-signature"]) {
      const { data } = req.body;
      const { reference: trxnRef, status } = data;
      // Check if transaction wasn't successful
      if (status !== "success") {
        // Log the transaction details to Discord
        await discordLogger.logTransaction(
          `Payment unsuccessful Status: ${status}, TxnRef: ${trxnRef}`,
        );
        return;
      }
      // Check if the transaction reference exists in the database
      const transaction =
        await this.transactionService.getTransactionByTrxnRef(trxnRef);
      if (!transaction) {
        throw new NotFoundException("Transaction not found");
      }
      // Check if the transaction has already been processed
      if (transaction.status === TrxnStatus.success) {
        return true;
      }

      // Process the transaction
      switch (transaction.category) {
        case TrxnCategory.electricity:
          await this.processTokenPurchase(transaction);
          break;
        case TrxnCategory.bill:
          await this.processBillPurchase(transaction);
          break;
        default:
          await this.processTokenPurchase(transaction);
      }
      // Send a 200 OK response to acknowledge receipt of the webhook
      return;
    }
    await discordLogger.logSecurity(
      `Malicious request from ${req.ip}, ${req.headers["user-agent"]}, ${req.body}`,
    );
    throw new BadRequestException("Invalid signature");
  }

  /**
   * Resolves pending transactions by checking their status and updating them accordingly.
   *
   * @returns A message indicating the result of the operation.
   */
  public async resolvePendingTransactions(req: Request): Promise<string> {
    const { total, success, failed, abandoned } = await this.resolvePending();

    if (req.user) {
      // Log Pending Txn Resolve
      await this.auditService.logAudit({
        action: "update",
        model: "transaction",
        userId: req.user.id,
        description: `${req.user.email} resolved pending transactions`,
        metadata: {
          total,
          success,
          failed,
          abandoned,
        },
      });
    }
    const message = `Pending transactions resolved: Total: ${total} Success: ${success}, Failed: ${failed}, Abandoned: ${abandoned}`;
    return message;
  }

  /**
   * Resolves all pending payment transactions by confirming their payment status and updating their records accordingly.
   *
   * - Retrieves all transactions with a pending status.
   * - For each transaction:
   *   - Checks if the transaction reference exists; logs and skips if missing.
   *   - Confirms the payment status using the transaction reference.
   *   - If the status is "abandoned" or "failed", updates the transaction as failed and logs the event.
   *   - If the status is "success", attempts to complete the token purchase for the transaction.
   * - Tracks and returns the total number of processed transactions, as well as counts for successful, failed, and abandoned transactions.
   *
   * @returns {Promise<ResolvePendingResponse>}
   *   An object summarizing the results of the resolution process, or a string if there are no pending transactions.
   */
  public async resolvePending(): Promise<ResolvePendingResponse> {
    // Get all pending transactions
    const pendingTransactions =
      await this.transactionRepo.getPendingTransactions();
    if (!pendingTransactions.length) {
      return { total: 0, success: 0, failed: 0, abandoned: 0 };
    }

    let success = 0;
    let failed = 0;
    let abandoned = 0;
    // Iterate through each pending transaction
    for (const transaction of pendingTransactions) {
      // Check if the transaction is still pending
      if (transaction.status === TrxnStatus.pending) {
        // Attempt to resolve the transaction
        const { trxnRef, userId } = transaction;
        if (!trxnRef) {
          await discordLogger.logDebug(
            `Transaction reference not found for User ID: ${userId}`,
          );
          continue;
        }
        // Call the functions with the provided arguments
        const { status, reason } = await this.confirmPayment(trxnRef);
        if (status === "abandoned" || status === "failed") {
          // If the transaction is abandoned or failed, update the status
          abandoned = status === "abandoned" ? abandoned + 1 : abandoned;
          failed = status === "failed" ? failed + 1 : failed;

          await this.transactionRepo.updateById(transaction.id, {
            status: TrxnStatus.failed,
            remark:
              status === "abandoned" ? "Payment abandoned" : "Payment failed",
          });

          await discordLogger.logDebug(
            `Payment abandoned or failed for User ID: ${userId}, \nTxnRef: ${trxnRef}, \nStatus: ${status}, \nReason: ${reason}`,
          );
          continue;
        }

        // Any other status is considered unsuccessful
        if (status !== "success") {
          continue;
        }
        // If the transaction is successful, update the transaction status
        // Proceed to buy token
        const completed = await this.purchaseToken(transaction.id);
        success = completed ? success + 1 : success;
      }
    }

    return {
      total: pendingTransactions.length,
      success,
      failed,
      abandoned,
    };
  }

  /**
   * Confirms the payment status for a given transaction reference.
   *
   * @param trxnRef - The transaction reference.
   * @returns A promise that resolves with the payment status and reason.
   * @throws Error if the payment confirmation fails.
   */
  public async confirmPayment(
    trxnRef: string,
  ): Promise<{ status: string; reason: string }> {
    const endpoint = `https://api.paystack.co/transaction/verify/${trxnRef}`;
    const headers = {
      Authorization: `Bearer ${config.paystack_secret}`,
    };
    const paymentResponse = await axios.get(endpoint, { headers });
    return {
      status: paymentResponse.data.data.status,
      reason: paymentResponse.data.data.gateway_response,
    };
  }

  /**
   * Buys a token for a given transaction reference.
   *
   * @param trxnRef - The transaction reference.
   * @param userId - The user ID associated with the transaction.
   * @returns A promise that resolves when the token is purchased.
   */
  public async purchaseToken(id: string) {
    // Check if the transaction reference exists in the database
    const transaction = await this.transactionRepo.findTransactionById(id);
    if (!transaction) {
      return false;
    }
    // Check if the transaction has already been processed
    if (transaction.status === TrxnStatus.success) {
      return true;
    }

    // Vend if transaction is found and not completed
    const tokenAmount = await calculateTariff(transaction.amount);
    const buyToken = await buyPower(transaction.meterNumber, tokenAmount);
    if (!buyToken.result_code) {
      // If the transaction was successful, update the transaction status
      await this.transactionRepo.updateById(transaction.id, {
        token: buyToken.result.token,
        status: TrxnStatus.success,
        tokenPayload: JSON.stringify(buyToken),
        units: buyToken.result.total_unit.toString(),
      });

      // Send notification to the user
      const notifyInfo: CreateNotifyDto = {
        title: "Token Generated",
        message: "Your electricity token has been generated successfully",
        recipientIds: [transaction.userId],
        status: "pending",
        type: [NotificationType.inapp, NotificationType.email],
        data: {
          template: "token-purchase",
          channel: transaction.userId,
        },
      };

      await this.notificationService.notify(notifyInfo);
    } else {
      // If the vending failed, update the transaction status
      await this.transactionRepo.updateById(transaction.id, {
        status: TrxnStatus.failed,
        remark: "Vending failed",
      });
      // Log the vending failure to Discord
      await discordLogger.logTransaction(
        `Payment successful but vending failed for ${transaction.userId}, ${transaction.trxnRef}, ${transaction.amount}`,
      );
    }
    return true;
  }

  /**
   * Adds a payment split.
   *
   * @param dto - The payment split data.
   * @returns A promise that resolves when the payment split is added.
   */
  public async addPaymentSplit(req: Request, dto: CreatePaymentSplitDto) {
    // Check if the property ID exists in the database
    const property = await this.propertyRepo.findById(dto.propertyId);
    if (!property) {
      throw new BadRequestException("Invalid property ID");
    }

    // Create the payment split
    const data = await this.paymentRepo.createPaymentSplit(dto);

    if (req.user) {
      // Log payment split addition
      await this.auditService.logAudit({
        action: "create",
        model: "payment-split",
        userId: req.user.id,
        description: `Payment split added for ${property.name} by ${req.user.email}`,
      });
    }

    return data;
  }

  /**
   * Updates a payment split.
   *
   * @param id - The ID of the payment split to update.
   * @param dto - The updated payment split data.
   * @returns A promise that resolves when the payment split is updated.
   */
  public async updatePaymentSplit(
    req: Request,
    id: string,
    dto: Partial<CreatePaymentSplitDto>,
  ) {
    // Check if the payment split ID exists in the database
    const paymentSplit = await this.paymentRepo.findById(id);
    if (!paymentSplit) {
      throw new NotFoundException("Payment split not found");
    }

    // Update the payment split
    const data = await this.paymentRepo.updatePaymentSplitById(id, dto);

    if (req.user) {
      // Log payment split addition
      await this.auditService.logAudit({
        action: "create",
        model: "payment-split",
        userId: req.user.id,
        description: `Payment split updated by ${req.user.email}`,
      });
    }

    return data;
  }

  public async getAllFees(): Promise<Fee[]> {
    return await this.paymentRepo.getAllFees();
  }

  public async updateFee(
    req: JwtPayload,
    id: string,
    dto: UpdateFeeDto,
  ): Promise<Fee> {
    const fee = await this.paymentRepo.findFeeById(id);
    if (!fee) {
      throw new BadRequestException("Fee not found");
    }

    const updatedFee = await this.paymentRepo.updateFee(id, dto);

    // Audit
    if (req.user) {
      // Log fee update
      await this.auditService.logAudit({
        action: "update",
        model: "fee",
        userId: req.user.id,
        description: `Payment fee (${updatedFee.type}) updated`,
      });
    }

    return updatedFee;
  }

  public async createFee(req: JwtPayload, dto: CreateFeeDto): Promise<Fee> {
    const newFee = await this.paymentRepo.createFee(dto);

    // Audit
    if (req.user) {
      // Log fee create
      await this.auditService.logAudit({
        action: "create",
        model: "fee",
        userId: req.user.id,
        description: `New payment fee added (${newFee.type})`,
      });
    }

    return newFee;
  }

  public async deleteFee(req: JwtPayload, id: string): Promise<void> {
    const fee = await this.paymentRepo.findFeeById(id);
    if (!fee) {
      throw new BadRequestException("Fee not found");
    }

    const deletedFee = await this.paymentRepo.deleteFee(id);

    // Audit
    if (req.user) {
      // Log fee delete
      await this.auditService.logAudit({
        action: "delete",
        model: "fee",
        userId: req.user.id,
        description: `Payment fee deleted (${deletedFee.type})`,
      });
    }

    return;
  }

  /**
   * Processes a token purchase by calculating the token amount based on the transaction amount
   * and facility tariff, vending the token, and updating the transaction status.
   *
   * @param transaction - The transaction to be processed.
   * @throws BadRequestException If the transaction does not exist or is not pending.
   * @throws NotFoundException If the property or user associated with the transaction does not exist.
   * @throws InternalServerErrorException If there is an error vending the token.
   */
  async processTokenPurchase(transaction: Transaction) {
    // Calculate the token amount based on the transaction amount
    // and the facility's tariff
    const tokenAmount = await calculateTariff(transaction.amount);
    // Buy power using the token amount and the meter number
    const buyToken = await buyPower(transaction.meterNumber, tokenAmount);
    const userId = transaction.userId;

    // Get user firstname
    const user = await this.userRepo.findById(userId);

    if (!buyToken.result_code) {
      // If the transaction was successful, update the transaction status
      await this.transactionRepo.updateById(transaction.id, {
        token: buyToken.result.token,
        status: TrxnStatus.success,
        tokenPayload: JSON.stringify(buyToken),
        units: buyToken.result.total_unit.toString(),
      });

      // Log successful vending
      await this.auditService.logAudit({
        action: "create",
        model: "transaction",
        userId: userId,
        propertyId: transaction.propertyId || undefined,
        description: `Purchase power worth ${transaction.amount}`,
        metadata: {
          units: buyToken.result.total_unit.toString(),
        },
      });

      // Send notification to the user
      const notifyInfo: CreateNotifyDto = {
        title: "Token Generated",
        message: "Your electricity token has been generated successfully",
        recipientIds: [userId],
        status: "pending",
        type: [NotificationType.inapp, NotificationType.email],
        data: {
          template: "token-purchase",
          channel: userId,
          templateData: {
            customerName: user?.firstName,
            token: buyToken.result.token,
            amount: transaction.amount,
            meterNumber: transaction.meterNumber,
          },
        },
      };

      await this.notificationService.notify(notifyInfo);

      // Log the transaction details to Discord
      await discordLogger.logTransaction(
        `Payment successful and vended for User ID: ${userId}, TxnRef: ${transaction.trxnRef}, Amount: ${transaction.amount}`,
      );
    } else {
      // If the vending failed, update the transaction status
      await this.transactionRepo.updateById(transaction.id, {
        status: TrxnStatus.failed,
        remark: "Vending failed",
      });
      // Log the vending failure to Discord
      await discordLogger.logTransaction(
        `Payment successful but vending failed for ${userId}, ${transaction.trxnRef}, ${transaction.amount}`,
      );
    }
  }

  /**
   * Processes a bill purchase for a given transaction.
   *
   * This function checks if the transaction has a valid transaction reference
   * and attempts to pay the bill (e.g., Airtime, Data, or Cable) using the
   * provided transaction details. It updates the transaction status based on the
   * success or failure of the bill payment and logs the transaction details to the
   * audit log and Discord.
   *
   * @param transaction - The transaction object containing details of the bill purchase.
   * @throws BadRequestException if the transaction lacks a transaction reference.
   */
  async processBillPurchase(transaction: Transaction) {
    // Check if transaction has a trxn reference
    if (!transaction.trxnRef) {
      throw new BadRequestException("Transaction has no trxn reference");
    }

    // Pay the bill i.e Airtime, Data, Electricity or Cable
    const result = await this.vendingService.payBill(
      transaction.trxnRef,
      transaction.userId,
    );
    const userId = transaction.userId;

    // Get user firstname
    const user = await this.userRepo.findById(userId);

    if (result) {
      // If the transaction was successful, update the transaction status
      await this.transactionRepo.updateById(transaction.id, {
        status: TrxnStatus.success,
      });

      // Log successful vending
      await this.auditService.logAudit({
        action: "create",
        model: "transaction",
        userId: userId,
        propertyId: transaction.propertyId || undefined,
        description: `Purchase ${transaction.type} worth ${transaction.amount}`,
        metadata: {
          ...result,
        },
      });

      // Send notification to the user
      const notifyInfo: CreateNotifyDto = {
        title: "Successful bill purchase",
        message:
          "Your bill payment has been successfully processed — thank you for your purchase!",
        recipientIds: [userId],
        status: "pending",
        type: [NotificationType.inapp, NotificationType.email],
        data: {
          template: "bill-purchase",
          channel: userId,
          templateData: {
            customerName: user?.firstName,
            billType: transaction.type,
            referenceNumber: transaction.trxnRef,
            amount: transaction.amount,
            companyName: "Miraton Rose Africa",
          },
        },
      };

      await this.notificationService.notify(notifyInfo);

      // Log the transaction details to Discord
      await discordLogger.logTransaction(
        `Payment successful and bill purchased for User ID: ${userId}, TxnRef: ${transaction.trxnRef}, Amount: ${transaction.amount}`,
      );
    } else {
      // If the vending failed, update the transaction status
      await this.transactionRepo.updateById(transaction.id, {
        status: TrxnStatus.failed,
        remark: "Bill purchase failed",
      });
      // Log the vending failure to Discord
      await discordLogger.logTransaction(
        `Payment successful but bill purchase failed for ${userId}, ${transaction.trxnRef}, ${transaction.amount}`,
      );
    }
  }
}

export default PaymentService;
