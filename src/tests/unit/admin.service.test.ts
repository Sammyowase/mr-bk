import "reflect-metadata";
import PaymentRepository from "../../repository/payment.repository";
import UserRepository from "../../repository/user.repository";
import PropertyRepository from "../../repository/property.repository";
import TransactionRepository from "../../repository/transaction.repository";
import { BadRequestException } from "../../utils/exceptions/customException";
import { createTestContainer } from "../utils/test-container";
import AdminService from "../../services/admin.service";

jest.mock("../../utils/constants/transaction", () => ({
  transactionsWhere: jest.fn(() => ({})),
}));

jest.mock("../../models/redis", () => ({
  redisConnection: {
    on: jest.fn(),
    quit: jest.fn(),
    set: jest.fn(),
  },
}));

const mockFee = { rate: 10 };
const mockCounts = {
  totalUsers: 100,
  totalWeekUsers: 10,
  totalMonthUsers: 20,
  totalWeekProperties: 5,
  totalMonthProperties: 8,
  totalProperties: 50,
  totalPropertyManager: 30,
  totalPropertyWithoutManager: 20,
  totalTurnover: 10000,
  totalMonthTurnover: 4000,
  totalWeekTurnover: 2000,
  totalDailyTurnovers: [
    {
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      _sum: { amount: 100 },
    },
    {
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      _sum: { amount: 200 },
    },
    {
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      _sum: { amount: 300 },
    },
    {
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      _sum: { amount: 400 },
    },
    {
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      _sum: { amount: 500 },
    },
    {
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      _sum: { amount: 600 },
    },
    {
      createdAt: new Date(),
      _sum: { amount: 700 },
    },
  ],
  totalTransactions: 50,
  totalMonthTransactions: 20,
  totalWeekTransactions: 10,
  totalTransactionsToday: 2,
};

describe("AdminService.getOverview", () => {
  let container: ReturnType<typeof createTestContainer>;

  afterAll(() => {
    container.clearInstances();
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock Dependencies
    const mockPropertyRepo = {
      findById: jest.fn().mockResolvedValue({ name: "Test Property" }),
      getNewWeekPropertiesCount: jest
        .fn()
        .mockResolvedValue(mockCounts.totalWeekProperties),
      getNewPropertiesCount: jest
        .fn()
        .mockResolvedValue(mockCounts.totalMonthProperties),
      getAllPropertiesCount: jest
        .fn()
        .mockResolvedValue(mockCounts.totalProperties),
      getAllPropertiesWithManagerCount: jest
        .fn()
        .mockResolvedValue(mockCounts.totalPropertyManager),
      getAllPropertiesWithoutManagerCount: jest
        .fn()
        .mockResolvedValue(mockCounts.totalPropertyWithoutManager),
    } as unknown as PropertyRepository;

    const mockPaymentRepo = {
      findFeeByType: jest.fn().mockResolvedValue(mockFee),
    } as unknown as PaymentRepository;

    const mockTransactionRepo = {
      getTotalTurnover: jest.fn().mockResolvedValue(mockCounts.totalTurnover),
      getTotalTurnoverThisMonth: jest
        .fn()
        .mockResolvedValue(mockCounts.totalMonthTurnover),
      getTotalTurnoverThisWeek: jest
        .fn()
        .mockResolvedValue(mockCounts.totalWeekTurnover),
      getTotalTurnoverEachDayThisWeek: jest
        .fn()
        .mockResolvedValue(mockCounts.totalDailyTurnovers),
      getTotalTransactions: jest
        .fn()
        .mockResolvedValue(mockCounts.totalTransactions),
    } as unknown as TransactionRepository;

    const mockUserRepo = {
      getAllUsersCount: jest.fn().mockResolvedValue(mockCounts.totalUsers),
      getNewWeekUsersCount: jest
        .fn()
        .mockResolvedValue(mockCounts.totalWeekUsers),
      getNewMonthUsersCount: jest
        .fn()
        .mockResolvedValue(mockCounts.totalMonthUsers),
    } as unknown as UserRepository;

    container = createTestContainer((c) => {
      c.registerInstance(PaymentRepository, mockPaymentRepo);
      c.registerInstance(UserRepository, mockUserRepo);
      c.registerInstance(PropertyRepository, mockPropertyRepo);
      c.registerInstance(TransactionRepository, mockTransactionRepo);
    });
  });

  it("should return overview data with correct calculations", async () => {
    const service = container.resolve(AdminService);

    const overview = await service.getOverview();

    expect(overview.totalUsers).toBe(mockCounts.totalUsers);
    expect(overview.totalWeekProperties).toBe(mockCounts.totalWeekProperties);
    expect(overview.totalMonthProperties).toBe(mockCounts.totalMonthProperties);
    expect(overview.totalMonthTurnover).toBe(mockCounts.totalMonthTurnover);
    expect(overview.totalMonthUsers).toBe(mockCounts.totalMonthUsers);
    expect(overview.totalWeekUsers).toBe(mockCounts.totalWeekUsers);
    expect(overview.totalProperties).toBe(mockCounts.totalProperties);
    expect(overview.totalPropertyManager).toBe(mockCounts.totalPropertyManager);
    expect(overview.totalPropertyWithoutManager).toBe(
      mockCounts.totalPropertyWithoutManager,
    );
    expect(overview.totalTurnover).toBe(mockCounts.totalTurnover);
    expect(overview.totalWeekTurnover).toBe(mockCounts.totalWeekTurnover);

    // Revenue calculations
    const profitRate = mockFee.rate * 0.01;
    expect(overview.totalRevenue).toBeCloseTo(
      mockCounts.totalTurnover * profitRate,
    );
    expect(overview.totalMonthRevenue).toBeCloseTo(
      mockCounts.totalMonthTurnover * profitRate,
    );
    expect(overview.totalWeekRevenue).toBeCloseTo(
      mockCounts.totalWeekTurnover * profitRate,
    );

    // Transactions
    expect(overview.totalTransactions).toBe(mockCounts.totalTransactions);

    // Percentages and averages
    expect(overview.percentage.revenueThisWeek).toBeCloseTo(
      ((mockCounts.totalWeekTurnover * profitRate) /
        (mockCounts.totalMonthTurnover * profitRate)) *
        100,
    );
    expect(overview.percentage.turnoverThisWeek).toBeCloseTo(
      (mockCounts.totalWeekTurnover / mockCounts.totalMonthTurnover) * 100,
    );
    expect(overview.averageTransaction).toBeCloseTo(
      mockCounts.totalTurnover / mockCounts.totalTransactions,
    );

    // Daily data arrays
    expect(Array.isArray(overview.dailyData.turnovers)).toBe(true);
    expect(Array.isArray(overview.dailyData.revenues)).toBe(true);
    expect(overview.dailyData.turnovers.length).toBe(7);
    expect(overview.dailyData.revenues.length).toBe(7);
  });

  it("should throw BadRequestException if vending fee is not set", async () => {
    // Clear previous registrations
    container.clearInstances();

    container.registerInstance(PaymentRepository, {
      findFeeByType: jest.fn().mockResolvedValue(null),
    } as unknown as PaymentRepository);

    const service = container.resolve(AdminService);

    await expect(service.getOverview()).rejects.toThrow(BadRequestException);
  });
});
