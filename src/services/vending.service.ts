import axios from "axios";
import {
  InitBillPaymentDto,
  MakePaymentDto,
  PaystackPaymentResponse,
  PaystackPaymentResponseData,
  VendReqDto,
  VendResponseData,
} from "../types/vending";
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  NotImplementedException,
} from "../utils/exceptions/customException";
import discordLogger from "../utils/logger/discordLogger";
import TransactionRepository from "../repository/transaction.repository";
import PropertyRepository from "../repository/property.repository";
import UserRepository from "../repository/user.repository";
import MeterRepository from "../repository/meter.repository";
import { CreateTransactionDto } from "../types/transaction";
import { TrxnChannel, TrxnStatus } from "../../prisma/generated/prisma";
import PaymentRepository from "../repository/payment.repository";
import { UserPermissionService } from "./userpermission.service";
import { billService } from "./bills.service";
import { nanoid } from "nanoid";
import config from "../configs/app/env";
import { injectable } from "tsyringe";

/**
 * Provides services related to vending operations such as purchasing tokens and initiating payments.
 *
 * @remarks
 * The `VendingService` class contains methods to handle token purchases and payment processing
 * for vending operations. It interacts with transactions, properties, meters, and users, and integrates
 * with external payment providers (e.g., Paystack).
 *
 * @example
 * ```typescript
 * const tokenData = await VendingService.buyToken('transactionRef', 123);
 * const paymentResponse = await VendingService.makePayment(paymentDto, 'userId');
 * ```
 */
@injectable()
class VendingService {
  constructor(
    private permissionService: UserPermissionService,
    private transactionRepo: TransactionRepository,
    private propertyRepo: PropertyRepository,
    private meterRepo: MeterRepository,
    private userRepo: UserRepository,
    private paymentRepo: PaymentRepository,
  ) {}

  /**
   * Retrieves the token information for a given transaction reference and user ID.
   *
   * @param trxnRef - The transaction reference for the token purchase.
   * @param userId - The ID of the user who made the purchase.
   * @returns An object containing token details if the transaction is successful.
   * @throws NotFoundException if the transaction is not found.
   * @throws BadRequestException if the transaction is still processing.
   */
  public async buyToken(trxnRef: string, userId: string) {
    // Check if the transaction exist
    const transaction =
      await this.transactionRepo.findTransactionByUserIdAndTrxnRef(
        userId,
        trxnRef,
      );
    let facility;
    if (transaction?.propertyId) {
      const property = await this.propertyRepo.findById(transaction.propertyId);
      facility = property;
    }

    if (!transaction) {
      throw new NotFoundException("Transaction not found");
    }

    if (transaction.status === TrxnStatus.success) {
      const tokenInfo =
        transaction.tokenPayload && JSON.parse(transaction.tokenPayload);
      const data = {
        token: transaction.token,
        meterNumber: transaction.meterNumber,
        amount: transaction.amount,
        date: transaction.updatedAt,
        units: `${transaction.units} kwh`,
        address: tokenInfo.result.customer_addr,
        name: tokenInfo.result.customer_name,
        facility,
      };

      return data;
    } else if (transaction.status === TrxnStatus.failed) {
      return null;
    }

    throw new BadRequestException("Transaction processing");
  }

  /**
   * Initiates a payment for a given meter number and user ID.
   *
   * @param dto - The data transfer object containing payment details.
   * @param userId - The ID of the user making the payment.
   * @returns The response from the payment provider.
   * @throws BadRequestException if unable to initiate payment.
   */
  public async makePayment(dto: MakePaymentDto, userId: string) {
    const userMeter = await this.meterRepo.findByNumber(dto.meterNumber);
    // Throw error if meter number is not found
    if (!userMeter) {
      throw new NotFoundException("Meter number not found");
    }

    // Check for restriction
    const blocked = await this.permissionService.hasRestriction(
      userMeter.ownerId ?? userId,
      "block_vend",
    );
    if (blocked) {
      throw new ForbiddenException(
        "Vending denied, your account is restricted.",
      );
    }

    // Throw error if meter does not have property id
    if (!userMeter.propertyId || !userMeter.houseId) {
      throw new BadRequestException(
        "No estate or house assigned to this meter, kindly contact support with your meter, house and estate name to rectify",
      );
    }

    const property = await this.propertyRepo.findById(userMeter.propertyId);

    // Check if vending is suspended for the estate
    if (property && property.isVendingSuspended) {
      throw new ForbiddenException(
        "Vending is currently suspended for this estate. Please contact your estate manager for more information.",
      );
    }

    // Check if vending amount is within min and max vending range for the estate
    if (property && (property?.minVend || property?.maxVend)) {
      if (property.minVend && dto.amount < property.minVend) {
        throw new BadRequestException(
          `Amount is too low, your facility limit is #${property.minVend}`,
        );
      } else if (property.maxVend && dto.amount > property.maxVend) {
        throw new BadRequestException(
          `Amount is too high, your facility limit is #${property.maxVend}`,
        );
      }
    }

    // Retrieve the payment split code for the property
    const paymentSplit = await this.paymentRepo.findByPropertyId(
      userMeter.propertyId,
    );

    const user = await this.userRepo.findById(userId);

    const email = user?.email;

    // Set up the request body for the payment with and without payment split
    // If payment split is not found, use the body without payment split
    const bodyWithoutPaymentSplit = {
      email,
      amount: dto.amount * 100,
      currency: "NGN",
      callback_url: dto.callback_url,
      channels: ["card", "bank", "ussd", "bank_transfer"],
    };

    const bodyWithPaymentSplit = {
      ...bodyWithoutPaymentSplit,
      split_code: paymentSplit?.split_code,
    };

    const params = paymentSplit
      ? JSON.stringify(bodyWithPaymentSplit)
      : JSON.stringify(bodyWithoutPaymentSplit);

    const endpoint = "https://api.paystack.co/transaction/initialize";
    const headers = {
      Authorization: `Bearer ${config.paystack_secret}`,
      "Content-Type": "application/json",
    };
    const payment = await axios.post(endpoint, params, { headers });

    if (payment.status !== 200) {
      await discordLogger.logPayment(
        `Unable to initiate payment:  ${payment.data?.message}`,
      );
      throw new BadRequestException("Unable to initiate payment");
    }

    const data: CreateTransactionDto = {
      userId,
      meterNumber: dto.meterNumber,
      amount: dto.amount,
      propertyId: userMeter.propertyId,
      trxnRef: payment.data.data.reference,
      trxnPayload: JSON.stringify(payment.data),
      status: TrxnStatus.pending,
      channel: TrxnChannel.paystack,
      houseId: userMeter.houseId,
    };
    // Create a new transaction in the database
    await this.transactionRepo.createTransaction(data);
    // Log the payment initiation to Discord
    await discordLogger.logPayment(
      `Payment initiated for ${user?.email} with reference ${payment.data.data.reference}`,
    );
    return payment.data;
  }

  /**
   * Purchase a bill.
   *
   * @param trxnRef - The transaction reference for the token purchase.
   * @returns An object containing token details if the transaction is successful.
   * @throws NotFoundException if the transaction is not found.
   */
  public async payBill(
    trxnRef: string,
    userId: string,
  ): Promise<VendResponseData | null> {
    // Check if the transaction exist
    const transaction =
      await this.transactionRepo.findTransactionByUserIdAndTrxnRef(
        userId,
        trxnRef,
      );

    // Throw error if transaction not found
    if (!transaction) {
      throw new NotFoundException("Transaction not found");
    }

    // Check if the transaction is still pending
    if (transaction.status === TrxnStatus.pending) {
      const billDto: VendReqDto =
        transaction.tokenPayload && JSON.parse(transaction.tokenPayload);

      // Process the bill
      const data = await billService.vendBill(billDto);

      return data.data;
    } else {
      return null;
    }
  }

  /**
   * Initiates a bills payment for a given user ID.
   *
   * @param dto - The data transfer object containing payment details.
   * @param userId - The ID of the user making the payment.
   * @returns The response from the payment provider i.e payment link.
   * @throws BadRequestException if unable to initiate payment.
   */
  public async initBillPayment(
    dto: InitBillPaymentDto,
    userId: string,
  ): Promise<PaystackPaymentResponseData> {
    // Direct to payment provider
    let payment;
    if (dto.channel === TrxnChannel.shanono) {
      this.payWithShanono();
    } else {
      payment = await this.payWithPaystack(
        dto.email,
        Number(dto.amount),
        dto.callback_url,
      );
    }

    // Set up the bill payload
    const billPayload: VendReqDto = {
      meter: dto.meter,
      disco: dto.disco,
      phone: dto.phone,
      paymentType: dto.paymentType,
      vendType: dto.vendType,
      vertical: dto.vertical,
      amount: dto.amount,
      email: dto.email,
      name: dto.name,
      orderId: nanoid(15),
      tariffClass: dto.tariffClass,
    };

    if (payment) {
      // Set up the transaction data
      const data: CreateTransactionDto = {
        userId,
        propertyId: undefined, // Empty string to accomodate for non-resident users
        meterNumber: dto.meter,
        amount: Number(dto.amount),
        trxnRef: payment.data.reference,
        trxnPayload: JSON.stringify(payment),
        tokenPayload: JSON.stringify(billPayload), // Store the bill payload, to be retrieved later
        status: TrxnStatus.pending,
        channel: dto.channel,
      };
      // Create a new transaction in the database
      await this.transactionRepo.createTransaction(data);

      return payment.data;
    }
    throw new BadRequestException("Unable to initiate payment");
  }

  /**
   * Initiates a payment request on Paystack.
   *
   * @param email - The customer's email address.
   * @param amount - The amount to be charged in NGN.
   * @param callback_url - The URL to redirect to after payment (optional).
   * @returns A promise that resolves with the payment response from Paystack.
   * @throws BadRequestException if the payment cannot be initiated.
   */
  private async payWithPaystack(
    email: string,
    amount: number,
    callback_url?: string,
  ): Promise<PaystackPaymentResponse> {
    // Set up the request body for the payment
    const body = {
      email,
      amount: amount * 100,
      currency: "NGN",
      callback_url,
      channels: ["card", "bank", "ussd", "bank_transfer"],
    };

    const params = JSON.stringify(body);

    const endpoint = "https://api.paystack.co/transaction/initialize";
    const headers = {
      Authorization: `Bearer ${config.paystack_secret}`,
      "Content-Type": "application/json",
    };
    const payment = await axios.post(endpoint, params, { headers });

    if (!payment.status) {
      await discordLogger.logPayment(
        `Unable to initiate payment:  ${payment.data?.message}`,
      );
      throw new BadRequestException("Unable to initiate payment");
    }

    return payment.data;
  }

  /**
   * Initiates a payment request on Shanono.
   *
   * @throws NotImplementedException because this method is not implemented.
   */
  private payWithShanono() {
    throw new NotImplementedException();
  }
}

export default VendingService;
