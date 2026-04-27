import {
  AdminRegisterDto,
  AdminRegisterResponse,
  LoginDto,
  LoginResponse,
  Overview,
} from "../types/admin";
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from "../utils/exceptions/customException";
import { hashPassword, verifyPassword } from "../utils/service/password";
import { generateRefreshToken, generateToken } from "../utils/service/token";
import UserRepository from "../repository/user.repository";
import { CreateUserDto } from "../types/user";
import { Role } from "../../prisma/generated/prisma";
import PropertyRepository from "../repository/property.repository";
import TransactionRepository from "../repository/transaction.repository";
import AuditLogService from "./audit.service";
import { Request } from "express";
import { UserPermissionService } from "./userpermission.service";
import PaymentRepository from "../repository/payment.repository";
import { transactionsWhere } from "../utils/constants/transaction";
import { injectable } from "tsyringe";

/**
 * Service class providing administrative authentication and registration functionalities.
 *
 * @remarks
 * This service handles admin login and registration processes, including user lookup,
 * password verification, token generation, and new admin creation.
 *
 * @example
 * // Login as admin
 * const response = await service.login({ identifier: 'admin@example.com', password: 'password123' });
 *
 * // Register a new admin
 * const newAdmin = await service.register({ firstName: 'John', lastName: 'Doe', userName: 'johndoe', email: 'john@example.com', phone: '1234567890', password: 'securePass' });
 */
@injectable()
class AdminService {
  constructor(
    private userRepo: UserRepository,
    private paymentRepo: PaymentRepository,
    private propertyRepo: PropertyRepository,
    private transactionRepo: TransactionRepository,
    private auditService: AuditLogService,
    private permissionService: UserPermissionService,
  ) {}

  /**
   * login
   * @param dto - The login data transfer object containing identifier and password.
   * @returns A promise that resolves to an object containing user details and tokens.
   * @throws BadRequestException if the user is not found or the password is incorrect.
   */
  public async login(req: Request, dto: LoginDto): Promise<LoginResponse> {
    // Check if the user exists
    const user = await this.userRepo.findByEmailOrUserNameOrPhone(
      dto.identifier,
      dto.identifier,
      dto.identifier,
    );

    if (!user) {
      throw new BadRequestException("Admin not found");
    }

    // Log attempt
    await this.auditService.logAudit({
      action: "login",
      model: "user",
      userId: user.id,
      description: `New login attempt from ${user.email}`,
      metadata: {
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      },
    });

    // Check for restriction
    const blocked = await this.permissionService.hasRestriction(
      user.id,
      "suspend_login",
    );
    if (blocked) {
      throw new ForbiddenException("Login denied, your account is suspended");
    }

    // Verify the password
    const passwordValid = await verifyPassword(dto.password, user.password);

    if (!passwordValid) {
      throw new BadRequestException("Incorrect password");
    }
    // Generate tokens
    const token = generateToken({
      id: user.id,
      role: user.role,
      email: user.email,
    });
    const refreshToken = generateRefreshToken({ id: user.id, role: user.role });

    // Attach tokens to the response
    const responseData = {
      user,
      token,
      refreshToken,
    };

    return responseData;
  }

  /**
   * register
   * @param dto - The registration data transfer object containing user details.
   * @returns A promise that resolves to an object containing the newly created admin's details.
   * @throws BadRequestException if the admin already exists.
   */
  public async register(dto: AdminRegisterDto): Promise<AdminRegisterResponse> {
    const user = await this.userRepo.findByEmailOrUserNameOrPhone(
      dto.email,
      dto.userName,
      dto.phone,
    );
    // Check if the user already exists
    if (user) {
      throw new ConflictException("Admin already exists");
    }

    const hashedPassword = await hashPassword(dto.password);

    const newUserData: CreateUserDto = {
      firstName: dto.firstName,
      lastName: dto.lastName,
      userName: dto.userName,
      password: hashedPassword,
      email: dto.email,
      phone: dto.phone,
      role: Role.admin,
    };

    const newAdmin = await this.userRepo.createUser(newUserData);

    // Log registration
    await this.auditService.logAudit({
      action: "create",
      model: "user",
      userId: newAdmin.id,
      description: `New admin registration - ${newAdmin.email}`,
    });

    return newAdmin;
  }

  /**
   * getOverview
   * @returns A promise that resolves to an overview object containing user and property counts, turnover, and revenue statistics.
   */
  public async getOverview(): Promise<Overview> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Week
    const startOfWeek = new Date(today);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - (day === 0 ? 0 : day); // Sunday as start of the week
    startOfWeek.setDate(diff);

    // Month
    const startOfMonth = new Date(today);
    startOfMonth.setDate(1);

    const fee = await this.paymentRepo.findFeeByType("Vending");
    if (!fee) {
      throw new BadRequestException("Vending fee not set");
    }

    const [
      totalUsers,
      totalWeekUsers,
      totalMonthUsers,
      totalWeekProperties,
      totalMonthProperties,
      totalProperties,
      totalPropertyManager,
      totalPropertyWithoutManager,
      totalTurnover,
      totalMonthTurnover,
      totalWeekTurnover,
      totalDailyTurnovers,
      totalTransactions,
      totalMonthTransactions,
      totalWeekTransactions,
      totalTransactionsToday,
    ] = await Promise.all([
      this.userRepo.getAllUsersCount(),
      this.userRepo.getNewWeekUsersCount(startOfWeek),
      this.userRepo.getNewMonthUsersCount(),
      this.propertyRepo.getNewWeekPropertiesCount(startOfWeek),
      this.propertyRepo.getNewPropertiesCount(),
      this.propertyRepo.getAllPropertiesCount(),
      this.propertyRepo.getAllPropertiesWithManagerCount(),
      this.propertyRepo.getAllPropertiesWithoutManagerCount(),
      this.transactionRepo.getTotalTurnover(),
      this.transactionRepo.getTotalTurnoverThisMonth(),
      this.transactionRepo.getTotalTurnoverThisWeek(startOfWeek),
      this.transactionRepo.getTotalTurnoverEachDayThisWeek(startOfWeek),
      this.transactionRepo.getTotalTransactions(),
      this.transactionRepo.getTotalTransactions(
        transactionsWhere(startOfMonth.toISOString()),
      ),
      this.transactionRepo.getTotalTransactions(
        transactionsWhere(startOfWeek.toISOString()),
      ),
      this.transactionRepo.getTotalTransactions(
        transactionsWhere(today.toISOString()),
      ),
    ]);

    const profitRate = fee.rate * 0.01;

    // Group by date (YYYY-MM-DD)
    const dailyTotals: Record<string, number> = {};
    totalDailyTurnovers.forEach((item) => {
      const date = item.createdAt.toISOString().split("T")[0];
      dailyTotals[date] = (dailyTotals[date] || 0) + (item._sum.amount || 0);
    });
    // Fill in all days of the week
    const days: {
      revenues: number[];
      turnovers: number[];
    } = {
      revenues: [],
      turnovers: [],
    };
    for (let i = 2; i <= 8; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + (i === 8 ? 1 : i));
      const dateStr = date.toISOString().split("T")[0];
      days.turnovers.push(dailyTotals[dateStr] || 0);
      days.revenues.push((dailyTotals[dateStr] || 0) * profitRate);
    }

    // Calculate the revenues
    const totalRevenue = totalTurnover * profitRate;
    const totalMonthRevenue = totalMonthTurnover * profitRate;
    const totalWeekRevenue = totalWeekTurnover * profitRate;

    // Calculate the precentages
    const revenueThisWeek = (totalWeekRevenue / totalMonthRevenue) * 100;
    const turnoverThisWeek = (totalWeekTurnover / totalMonthTurnover) * 100;

    // Calculate the averages
    const avgTransactionThisWeek =
      totalWeekTransactions > 0 ? totalWeekTurnover / totalWeekTransactions : 0;
    const averageTransaction =
      totalTransactions > 0 ? totalTurnover / totalTransactions : 0;

    return {
      totalUsers,
      totalWeekProperties,
      totalMonthProperties,
      totalMonthTurnover,
      totalMonthUsers,
      totalWeekUsers,
      totalProperties,
      totalPropertyManager,
      totalPropertyWithoutManager,
      totalTurnover,
      totalWeekTurnover,
      totalRevenue,
      totalMonthRevenue,
      totalWeekRevenue,
      dailyData: days,
      totalTransactions,
      totalMonthTransactions,
      totalWeekTransactions,
      totalTransactionsToday,
      percentage: {
        avgTransactionThisWeek,
        revenueThisWeek,
        turnoverThisWeek,
      },
      averageTransaction,
    };
  }
}

export default AdminService;
