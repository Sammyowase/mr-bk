import "reflect-metadata";
import { Request } from "express";
import crypto from "crypto";
import { Transaction, TrxnStatus } from "../../../prisma/generated/prisma";
import TransactionRepository from "../../repository/transaction.repository";
import {
  BadRequestException,
  NotFoundException,
} from "../../utils/exceptions/customException";
import { calculateTariff } from "../../utils/service/calculateTariff";
import { buyPower } from "../../utils/service/meterServices/buyPower";
import { CreatePaymentSplitDto } from "../../types/payment";
import { createTestContainer } from "../utils/test-container";
import PaymentService from "../../services/payment.service";
import TransactionService from "../../services/transaction.service";
import PropertyRepository from "../../repository/property.repository";
import PaymentRepository from "../../repository/payment.repository";
import VendingService from "../../services/vending.service";
import UserRepository from "../../repository/user.repository";
import NotificationService from "../../services/notification.service";

jest.mock("crypto");
jest.mock("axios");
jest.mock("../../utils/service/calculateTariff", () => ({
  calculateTariff: jest.fn(),
}));
jest.mock("../../repository/payment.repository");
jest.mock("../../repository/property.repository");
jest.mock("../../utils/service/meterServices/buyPower", () => ({
  buyPower: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockRequest = (body: any, headers: any): Request =>
  ({
    body,
    headers,
  }) as unknown as Request;

const mockReq = { user: { id: "admin" } } as unknown as Request;
describe("PaymentService", () => {
  let container: ReturnType<typeof createTestContainer>;
  const mockNotifyService = {
    notify: jest.fn(),
  } as unknown as NotificationService;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  afterAll(() => {
    container.clearInstances();
  });

  describe("paystackWebhook", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should throw BadRequestException for invalid signature", async () => {
      const req = mockRequest(
        { data: {} },
        { "x-paystack-signature": "invalid" },
      );
      (crypto.createHmac as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue("valid_signature"),
      });

      container = createTestContainer();

      const service = container.resolve(PaymentService);

      await expect(service.paystackWebhook(req)).rejects.toThrow(
        new BadRequestException("Invalid signature"),
      );
    });

    it("should throw NotFoundException if transaction is not found", async () => {
      const req = mockRequest(
        { data: { reference: "test_ref", status: "success" } },
        { "x-paystack-signature": "valid_signature" },
      );
      (crypto.createHmac as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue("valid_signature"),
      });

      const mockTransactionService = {
        getTransactionByTrxnRef: jest.fn().mockResolvedValue(null),
      } as unknown as TransactionService;

      container = createTestContainer((c) => {
        c.registerInstance(TransactionService, mockTransactionService);
      });

      const service = container.resolve(PaymentService);

      await expect(service.paystackWebhook(req)).rejects.toThrow(
        new NotFoundException("Transaction not found"),
      );
    });

    it("should log and return if transaction status is not success", async () => {
      const req = mockRequest(
        { data: { reference: "test_ref", status: "failed" } },
        { "x-paystack-signature": "valid_signature" },
      );
      (crypto.createHmac as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue("valid_signature"),
      });
      container = createTestContainer();

      const service = container.resolve(PaymentService);

      await service.paystackWebhook(req);
    });

    it("should update transaction if vending succeeds", async () => {
      const req = mockRequest(
        { data: { reference: "test_ref", status: "success" } },
        { "x-paystack-signature": "valid_signature" },
      );
      const mockTransaction = {
        id: "test_id",
        amount: 1000,
        meterNumber: "12345",
        userId: "user_1",
        status: TrxnStatus.pending,
      };
      const mockBuyToken = {
        result_code: 0,
        result: { token: "test_token", total_unit: 50 },
      };

      (crypto.createHmac as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue("valid_signature"),
      });

      const mockTransactionRepo = {
        findTransactionByTrxnRef: jest.fn().mockResolvedValue(mockTransaction),
        updateById: jest.fn().mockResolvedValue(mockTransaction),
      } as unknown as TransactionRepository;

      const mockUserRepo = {
        findById: jest.fn(),
      } as unknown as UserRepository;

      container = createTestContainer((c) => {
        c.registerInstance(TransactionRepository, mockTransactionRepo);
        c.registerInstance(UserRepository, mockUserRepo);
        c.registerInstance(NotificationService, mockNotifyService);
      });

      const service = container.resolve(PaymentService);

      (calculateTariff as jest.Mock).mockResolvedValue(50);
      (buyPower as jest.Mock).mockResolvedValue(mockBuyToken);

      await service.paystackWebhook(req);

      expect(mockTransactionRepo.updateById).toHaveBeenCalledWith(
        mockTransaction.id,
        {
          token: "test_token",
          status: TrxnStatus.success,
          tokenPayload: JSON.stringify(mockBuyToken),
          units: "50",
        },
      );
    });

    it("should update transaction and log failure if vending fails", async () => {
      const req = mockRequest(
        { data: { reference: "test_ref", status: "success" } },
        { "x-paystack-signature": "valid_signature" },
      );
      const mockTransaction = {
        id: "test_id",
        amount: 1000,
        meterNumber: "12345",
        userId: "user_1",
        status: TrxnStatus.pending,
      };
      const mockBuyToken = { result_code: 1 };

      (crypto.createHmac as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue("valid_signature"),
      });
      (calculateTariff as jest.Mock).mockResolvedValue(50);
      (buyPower as jest.Mock).mockResolvedValue(mockBuyToken);

      const mockTransactionRepo = {
        findTransactionByTrxnRef: jest.fn().mockResolvedValue(mockTransaction),
        updateById: jest.fn().mockResolvedValue(mockTransaction),
      } as unknown as TransactionRepository;

      const mockUserRepo = {
        findById: jest.fn(),
      } as unknown as UserRepository;

      container = createTestContainer((c) => {
        c.registerInstance(TransactionRepository, mockTransactionRepo);
        c.registerInstance(UserRepository, mockUserRepo);
      });

      const service = container.resolve(PaymentService);

      await service.paystackWebhook(req);

      expect(mockTransactionRepo.updateById).toHaveBeenCalledWith(
        mockTransaction.id,
        {
          status: TrxnStatus.failed,
          remark: "Vending failed",
        },
      );
    });

    it("should call the processTokenPurchase if category is electricity", async () => {
      const req = mockRequest(
        { data: { reference: "test_ref", status: "success" } },
        { "x-paystack-signature": "valid_signature" },
      );
      const mockTransaction = {
        id: "test_id",
        amount: 1000,
        meterNumber: "12345",
        userId: "user_1",
        status: TrxnStatus.pending,
        category: "electricity",
      } as Transaction;

      (crypto.createHmac as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue("valid_signature"),
      });

      const mockTransactionRepo = {
        getTransactionByTrxnRef: jest.fn().mockResolvedValue(mockTransaction),
      } as unknown as TransactionRepository;

      const mockTransactionService = {
        getTransactionByTrxnRef: jest.fn().mockResolvedValue(mockTransaction),
      } as unknown as TransactionService;

      container = createTestContainer((c) => {
        c.registerInstance(TransactionRepository, mockTransactionRepo);
        c.registerInstance(TransactionService, mockTransactionService);
      });

      const service = container.resolve(PaymentService);

      const spy = jest
        .spyOn(service, "processTokenPurchase")
        .mockResolvedValue();

      await service.paystackWebhook(req);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(mockTransaction);
    });

    it("should call the processBillPurchase if category is bill", async () => {
      const req = mockRequest(
        { data: { reference: "test_ref", status: "success" } },
        { "x-paystack-signature": "valid_signature" },
      );
      const mockTransaction = {
        id: "test_id",
        amount: 1000,
        meterNumber: "12345",
        userId: "user_1",
        status: TrxnStatus.pending,
        category: "bill",
      } as Transaction;

      (crypto.createHmac as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue("valid_signature"),
      });

      const mockTransactionService = {
        getTransactionByTrxnRef: jest.fn().mockResolvedValue(mockTransaction),
      } as unknown as TransactionService;

      container = createTestContainer((c) => {
        c.registerInstance(TransactionService, mockTransactionService);
        c.registerInstance(NotificationService, mockNotifyService);
      });

      const service = container.resolve(PaymentService);

      const spy = jest
        .spyOn(service, "processBillPurchase")
        .mockResolvedValue();

      await service.paystackWebhook(req);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(mockTransaction);
    });
  });

  describe("resolvePendingTransactions", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    it("should return message if no pending transactions", async () => {
      const mockTransactionRepo = {
        getPendingTransactions: jest.fn().mockResolvedValue([]),
      } as unknown as TransactionRepository;

      container = createTestContainer((c) => {
        c.registerInstance(TransactionRepository, mockTransactionRepo);
      });

      const service = container.resolve(PaymentService);

      const result = await service.resolvePendingTransactions(mockReq);

      expect(result).toEqual(
        "Pending transactions resolved: Total: 0 Success: 0, Failed: 0, Abandoned: 0",
      );
    });

    it("should resolve pending transactions and log results", async () => {
      const mockTransactions = [
        {
          id: "1",
          trxnRef: "ref1",
          userId: "user1",
          status: TrxnStatus.pending,
        },
        {
          id: "2",
          trxnRef: "ref2",
          userId: "user2",
          status: TrxnStatus.pending,
        },
      ];

      const mockTransactionRepo = {
        getPendingTransactions: jest.fn().mockResolvedValue(mockTransactions),
      } as unknown as TransactionRepository;

      container = createTestContainer((c) => {
        c.registerInstance(TransactionRepository, mockTransactionRepo);
      });

      const service = container.resolve(PaymentService);

      jest.spyOn(service, "confirmPayment").mockResolvedValue({
        status: "success",
        reason: "OK",
      });

      jest.spyOn(service, "purchaseToken").mockResolvedValue(true);

      const result = await service.resolvePendingTransactions(mockReq);
      expect(result).toContain("Pending transactions resolved");
      expect(service.purchaseToken).toHaveBeenCalledTimes(2);
    });

    it("should resolve pending transactions and ignore the success or failed ones", async () => {
      const mockTransactions = [
        {
          id: "1",
          trxnRef: "ref1",
          userId: "user1",
          status: TrxnStatus.pending,
        },
        {
          id: "2",
          trxnRef: "ref2",
          userId: "user2",
          status: TrxnStatus.success,
        },
        {
          id: "3",
          trxnRef: "ref3",
          userId: "user3",
          status: TrxnStatus.failed,
        },
      ];

      const mockTransactionRepo = {
        getPendingTransactions: jest.fn().mockResolvedValue(mockTransactions),
      } as unknown as TransactionRepository;

      container = createTestContainer((c) => {
        c.registerInstance(TransactionRepository, mockTransactionRepo);
      });

      const service = container.resolve(PaymentService);

      jest.spyOn(service, "confirmPayment").mockResolvedValue({
        status: "success",
        reason: "OK",
      });

      const spy = jest.spyOn(service, "purchaseToken").mockResolvedValue(true);

      const result = await service.resolvePendingTransactions(mockReq);
      expect(result).toContain("Pending transactions resolved");
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe("addPaymentSplit", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    const mockDto: CreatePaymentSplitDto = {
      name: "Test Split",
      propertyId: "property_1",
      split_code: "equal",
    };

    it("should throw BadRequestException if property does not exist", async () => {
      const mockPropertyRepo = {
        findById: jest.fn().mockResolvedValue(null),
      } as unknown as PropertyRepository;

      container = createTestContainer((c) => {
        c.registerInstance(PropertyRepository, mockPropertyRepo);
      });

      const service = container.resolve(PaymentService);

      await expect(service.addPaymentSplit(mockReq, mockDto)).rejects.toThrow(
        new BadRequestException("Invalid property ID"),
      );
    });

    it("should create and return payment split if property exists", async () => {
      const mockProperty = { id: "property_1", name: "Test Property" };
      const mockSplit = { id: "split_1", ...mockDto };

      const mockPropertyRepo = {
        findById: jest.fn().mockResolvedValue(mockProperty),
      } as unknown as PropertyRepository;

      const mockPaymentRepo = {
        createPaymentSplit: jest.fn().mockResolvedValue(mockSplit),
      } as unknown as PaymentRepository;

      container = createTestContainer((c) => {
        c.registerInstance(PropertyRepository, mockPropertyRepo);
        c.registerInstance(PaymentRepository, mockPaymentRepo);
      });

      const service = container.resolve(PaymentService);

      const result = await service.addPaymentSplit(mockReq, mockDto);

      expect(mockPropertyRepo.findById).toHaveBeenCalledWith(
        mockDto.propertyId,
      );
      expect(mockPaymentRepo.createPaymentSplit).toHaveBeenCalledWith(mockDto);
      expect(result).toEqual(mockSplit);
    });
  });

  describe("processBillPurchase", () => {
    it("should throw BadRequestException (Transaction has no trxn reference) if no trnx ref is found", async () => {
      const mockTxn = {
        id: "1",
        userId: "user1",
        status: TrxnStatus.pending,
      } as Transaction;

      container = createTestContainer();

      const service = container.resolve(PaymentService);

      await expect(service.processBillPurchase(mockTxn)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should call the payBill method on Vending service for valid transaction parameter", async () => {
      const mockTxn = {
        id: "1",
        trxnRef: "ref1",
        userId: "user1",
        status: TrxnStatus.pending,
      } as Transaction;

      const paybillResponse = {
        id: 384324,
        amountGenerated: 100,
      };

      const mockVendingService = {
        payBill: jest.fn().mockResolvedValue(paybillResponse),
      } as unknown as VendingService;

      const mockUserRepo = {
        findById: jest.fn().mockResolvedValue({
          id: "user1",
          firstName: "John",
          lastName: "Doe",
        }),
      } as unknown as UserRepository;

      const mockTransactionRepo = {
        updateById: jest.fn().mockResolvedValue(mockTxn),
      } as unknown as TransactionRepository;

      container = createTestContainer((c) => {
        c.registerInstance(VendingService, mockVendingService);
        c.registerInstance(UserRepository, mockUserRepo);
        c.registerInstance(TransactionRepository, mockTransactionRepo);
        c.registerInstance(NotificationService, mockNotifyService);
      });

      const service = container.resolve(PaymentService);

      await service.processBillPurchase(mockTxn);

      expect(mockVendingService.payBill).toHaveBeenCalledWith(
        mockTxn.trxnRef,
        mockTxn.userId,
      );

      expect(mockVendingService.payBill).toHaveBeenCalledTimes(1);
    });

    it("should update the transaction status to success if vending is successful", async () => {
      const mockTxn = {
        id: "1",
        trxnRef: "ref1",
        userId: "user1",
        status: TrxnStatus.pending,
      } as Transaction;

      const updatedTxn = {
        ...mockTxn,
        status: TrxnStatus.success,
      };

      const paybillResponse = {
        id: 384324,
        amountGenerated: 100,
      };

      const mockVendingService = {
        payBill: jest.fn().mockResolvedValue(paybillResponse),
      } as unknown as VendingService;

      const mockTransactionRepo = {
        updateById: jest.fn().mockResolvedValue(updatedTxn),
      } as unknown as TransactionRepository;

      const mockUserRepo = {
        findById: jest.fn().mockResolvedValue({
          id: "user1",
          firstName: "John",
          lastName: "Doe",
        }),
      } as unknown as UserRepository;

      container = createTestContainer((c) => {
        c.registerInstance(VendingService, mockVendingService);
        c.registerInstance(TransactionRepository, mockTransactionRepo);
        c.registerInstance(UserRepository, mockUserRepo);
        c.registerInstance(NotificationService, mockNotifyService);
      });

      const service = container.resolve(PaymentService);

      await service.processBillPurchase(mockTxn);

      expect(mockTransactionRepo.updateById).toHaveBeenCalledWith(mockTxn.id, {
        status: TrxnStatus.success,
      });

      expect(mockTransactionRepo.updateById).toHaveBeenCalledTimes(1);
    });

    it("should update the transaction status to failed if vending is unsuccessful", async () => {
      const mockTxn = {
        id: "1",
        trxnRef: "ref1",
        userId: "user1",
        status: TrxnStatus.pending,
      } as Transaction;

      const updatedTxn = {
        ...mockTxn,
        status: TrxnStatus.failed,
      };
      const mockVendingService = {
        payBill: jest.fn().mockResolvedValue(null),
      } as unknown as VendingService;

      const mockTransactionRepo = {
        updateById: jest.fn().mockResolvedValue(updatedTxn),
      } as unknown as TransactionRepository;

      const mockUserRepo = {
        findById: jest.fn().mockResolvedValue({
          id: "user1",
          firstName: "John",
          lastName: "Doe",
        }),
      } as unknown as UserRepository;

      container = createTestContainer((c) => {
        c.registerInstance(VendingService, mockVendingService);
        c.registerInstance(TransactionRepository, mockTransactionRepo);
        c.registerInstance(UserRepository, mockUserRepo);
      });

      const service = container.resolve(PaymentService);

      (mockTransactionRepo.updateById as jest.Mock).mockResolvedValue(
        updatedTxn,
      );

      await service.processBillPurchase(mockTxn);

      expect(mockTransactionRepo.updateById).toHaveBeenCalledWith(mockTxn.id, {
        status: TrxnStatus.failed,
        remark: "Bill purchase failed",
      });

      expect(mockTransactionRepo.updateById).toHaveBeenCalledTimes(1);
    });
  });
});
