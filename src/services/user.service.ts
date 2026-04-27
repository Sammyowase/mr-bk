import { LoginDto, LoginResponse } from "../types/admin";
import {
  AddUserMeterDto,
  CreateUserDto,
  RegisterDto,
  RegisterResponse,
  ResidentDetailsResponse,
  VerifyEmailDto,
} from "../types/user";
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "../utils/exceptions/customException";
import { addMeter } from "../utils/service/addMeter";
import { previewMeter } from "../utils/service/meterServices/previewMeter";
import { generateOtp } from "../utils/service/otp";
import { hashPassword, verifyPassword } from "../utils/service/password";
import { generateRefreshToken, generateToken } from "../utils/service/token";
import UserRepository from "../repository/user.repository";
import OtpRepository from "../repository/otp.repository";
import MeterRepository from "../repository/meter.repository";
import HouseRepository from "../repository/house.repository";
import { Role, User } from "../../prisma/generated/prisma";
import AuditLogService from "./audit.service";
import { Request, Response } from "express";
import { UserPermissionService } from "./userpermission.service";
import { logger } from "../utils/logger/logger";
import { SortOrder } from "../types/misc";
import {
  allowedUserSortBy,
  userFilter,
  userSortBy,
} from "../utils/constants/user";
import config from "../configs/app/env";
import { CompleteRegDto, InviteUserDto } from "../types/auth";
import PropertyRepository from "../repository/property.repository";
import { customAlphabet } from "nanoid";
import SecurityAssignmentRepository from "../repository/security.repository";
import NotificationService from "./notification.service";
import { injectable } from "tsyringe";
import CacheService from "./cache.service";
import SpreadSheet from "./spreadsheet.service";
import { exportExcel } from "../utils/helper/exportExcel";

/**
 * Provides user-related services such as authentication, registration, email verification,
 * and meter management.
 *
 * @remarks
 * This service includes methods for user login, registration with OTP email verification,
 * and associating meters with users. It handles user credential validation, password hashing,
 * token generation, and ensures data integrity during registration and meter assignment.
 *
 * @example
 * ```typescript
 * // Logging in a user
 * const response = await UserService.login({ identifier: 'user@example.com', password: 'password123' });
 *
 * // Registering a new user
 * await UserService.register({ firstName: 'John', lastName: 'Doe', email: 'john@example.com', ... });
 *
 * // Verifying user email with OTP
 * const user = await UserService.verifyEmail({ email: 'john@example.com', otp: '123456' });
 *
 * // Adding a meter to a user
 * await UserService.addUserMeter({ email: 'john@example.com', number: 'METER123', ... });
 * ```
 */

@injectable()
class UserService {
  constructor(
    private cacheService: CacheService,
    private notificationService: NotificationService,
    private auditService: AuditLogService,
    private permissionService: UserPermissionService,
    private userRepo: UserRepository,
    private otpRepo: OtpRepository,
    private meterRepo: MeterRepository,
    private propertyRepo: PropertyRepository,
    private securityRepo: SecurityAssignmentRepository,
    private houseRepo: HouseRepository,
  ) {}

  /**
   * Logs in a user using their phone number, email, or username.
   * @param dto - The login credentials containing identifier and password.
   * @returns A promise that resolves to the login response containing user details and tokens.
   * @throws BadRequestException if the credentials are invalid or the password is incorrect.
   */
  public async login(req: Request, dto: LoginDto): Promise<LoginResponse> {
    // Find user by phone, email, or username
    const user = await this.userRepo.findByEmailOrUserNameOrPhone(
      dto.identifier,
      dto.identifier,
      dto.identifier,
    );

    if (!user || user.deletedAt) {
      throw new BadRequestException("Invalid credentials");
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

    // Verify password
    const isPasswordValid = await verifyPassword(dto.password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException("Incorrect password");
    }

    // Generate tokens
    const data = { id: user.id, role: user.role, email: user.email };
    const token = generateToken(data);
    const refreshToken = generateRefreshToken(data);

    // Attach tokens to the response
    const responseData = {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        userName: user.userName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      token,
      refreshToken,
    };
    return responseData;
  }

  /**
   * Registers a new user and sends an OTP to their email for verification.
   * @param dto - The registration details containing user information.
   * @returns A promise that resolves when the OTP is sent successfully.
   * @throws BadRequestException if the user already exists.
   */
  public async register(dto: RegisterDto): Promise<void> {
    // Check if user already exists
    const existingUser = await this.userRepo.findByEmailOrUserNameOrPhone(
      dto.email,
      dto.userName,
      dto.phone,
    );

    if (existingUser) {
      throw new BadRequestException("User already exists");
    }

    const otp = generateOtp();

    await this.otpRepo.createOtp({
      otp: String(otp),
      email: dto.email,
      data: JSON.stringify(dto),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });

    await this.notificationService.sendDirectEmail("registration", dto.email, {
      firstName: dto.firstName,
      lastName: dto.lastName,
      otp,
      expiresIn: 15,
    });
    return;
  }

  /**
   * Verifies the email address of a user using the OTP sent to their email.
   * @param dto - The verification details containing the OTP and email.
   * @returns A promise that resolves to the created user object.
   * @throws BadRequestException if the OTP is invalid or expired.
   */
  public async verifyEmail(dto: VerifyEmailDto): Promise<RegisterResponse> {
    // Check if OTP exists and is valid
    const otpExists = await this.otpRepo.findByOtpOrEmail(dto);
    if (!otpExists) {
      throw new BadRequestException("Invalid OTP or email");
    }
    const currentTime = new Date();
    const expiresAt = otpExists.expiresAt;
    // Check if OTP has expired
    if (currentTime > expiresAt) {
      throw new BadRequestException("OTP has expired");
    }
    const data = otpExists.data && JSON.parse(otpExists.data);
    await this.otpRepo.deleteOtp(otpExists.id);
    // Hash the password
    const hashedPassword = await hashPassword(data.password);
    // Create the user
    const newUser = await this.userRepo.createUser({
      firstName: data.firstName,
      lastName: data.lastName,
      userName: data.userName,
      password: hashedPassword,
      email: data.email,
      phone: data.phone,
      role: data.role || Role.user,
    });

    // Create notification preference
    await this.notificationService.createNotifyPreference(newUser.id);

    // Log registration
    await this.auditService.logAudit({
      action: "create",
      model: "user",
      userId: newUser.id,
      description: `New user registration - ${newUser.email}`,
    });

    // Send Welcome Email
    await this.notificationService.sendDirectEmail("welcome", dto.email, {
      firstName: newUser.firstName,
    });

    return newUser;
  }

  /**
   * Adds a meter to a user based on the provided details.
   * @param dto - The details of the meter to be added, including propertyId, houseId, email, and number.
   * @returns A promise that resolves to the created or updated meter object.
   * @throws BadRequestException if the user does not exist or if there is an error adding the meter.
   * @throws NotFoundException if the meter is not found or if there is an error adding the meter to the user.
   */
  public async addUserMeter(dto: AddUserMeterDto) {
    // Check if the user exists
    const user = await this.userRepo.findByEmail(dto.email);
    if (!user) {
      throw new BadRequestException("User does not exist");
    }
    // Get ownerId from the user
    const ownerId = user.id;

    // Check if house has a meter already
    const house = await this.meterRepo.findMeterByHouseId(dto.houseId);
    if (house) {
      throw new BadRequestException("This house already has a meter");
    }

    // Check if the meter is attached to another house or another user already
    const existingMeter = await this.meterRepo.findByNumber(dto.number);
    if (existingMeter) {
      if (existingMeter.houseId !== dto.houseId && existingMeter.houseId) {
        throw new BadRequestException(
          "This meter is already attached to another house",
        );
      }

      if (existingMeter.ownerId !== ownerId && existingMeter.ownerId) {
        throw new BadRequestException(
          "This meter is already assigned to another user",
        );
      }
    }

    // Verify the meter number from the external service
    const verifyMeter = await previewMeter(dto.number);
    if (!verifyMeter) {
      logger.error(`Meter not found on the vending platform:  ${dto.number}`);
      throw new NotFoundException("Meter not found");
    }

    // Setup the meter data
    const name = verifyMeter?.customer_name;
    const meterData = {
      propertyId: dto.propertyId,
      houseId: dto.houseId,
      ownerId,
      name,
      number: dto.number,
    };

    // Create meter if it doesn't exist
    if (!existingMeter) {
      const createUserMeter = await addMeter(meterData);
      if (typeof createUserMeter === "string" || !createUserMeter) {
        throw new NotFoundException(
          `${!createUserMeter ? "Error adding meter to user" : createUserMeter}`,
        );
      }
      return createUserMeter;
    } else {
      const updatedMeter = await this.meterRepo.updateMeterByNumber(
        dto.number,
        {
          propertyId: dto.propertyId,
          houseId: dto.houseId,
          ownerId,
        },
      );

      // Log meter update
      await this.auditService.logAudit({
        action: "update",
        model: "meter",
        userId: ownerId,
        description: `Meter ${updatedMeter.name} updated by (${dto.email})`,
        propertyId: updatedMeter.propertyId ?? undefined,
      });

      return updatedMeter;
    }
  }

  /**
   * Updates user details based on the provided ID and data transfer object (DTO).
   * @param id - The ID of the user to be updated.
   * @param dto - The data transfer object containing the updated user details.
   * @returns A promise that resolves to the updated user object.
   * @throws BadRequestException if the user does not exist or if there is an error updating the user.
   */
  public async updateUser(
    req: Request,
    id: string,
    dto: Partial<CreateUserDto>,
  ) {
    // Check if user exists
    const user = await this.userRepo.findById(id);
    if (!user || user.deletedAt) {
      throw new BadRequestException("User does not exist");
    }
    // Hash the password if it is provided
    if (dto.password) {
      dto.password = await hashPassword(dto.password);
    }
    // Update the user
    const updatedUser = await this.userRepo.updateUserByEmail(user.email, dto);

    if (req.user) {
      // Log update user details
      await this.auditService.logAudit({
        action: "update",
        model: "user",
        userId: req.user.id,
        description: `${user.email} details updated`,
        metadata: {
          cols: [Object.keys(dto)],
        },
      });
    }
    return updatedUser;
  }

  /**
   * Retrieves all users as a paginated with sorting and search options.
   *
   * @param res - The response object for file download.
   * @param page - The page number for pagination (defaults to 1 if not provided or invalid).
   * @param size - The number of items per page for pagination (defaults to 10 if not provided or invalid).
   * @param sortBy - The field to sort the results by (defaults to "firstName" if not provided).
   * @param order - The sort order, either "asc" for ascending or "desc" for descending (defaults to descending).
   * @param search - A search string to filter users.
   * @param startDate - An optional start date (ISO string) to filter users from this date.
   * @param endDate - An optional end date (ISO string) to filter users up to this date.
   * @param role - An optional role to filter users by their role.
   * @param download - If specified as "true", triggers export of users to Excel.
   * @returns A promise that resolves to an object containing paginated data and metadata, or void when downloading.
   * @throws {BadRequestException} If the provided sort field is not allowed.
   */
  public async getAllUsers(
    res: Response,
    page: string,
    size: string,
    sortBy: string,
    order: string,
    search: string,
    startDate: string,
    endDate: string,
    role?: string,
    download?: string,
  ) {
    const pageNumber = parseInt(page) || 1;
    const pageSize = parseInt(size) || 10;
    const sortByField = sortBy || "firstName";
    const sortOrder = order === "desc" ? SortOrder.DESC : SortOrder.ASC;

    const filter = userFilter(search, startDate, endDate, role);

    if (!allowedUserSortBy.includes(sortByField)) {
      throw new BadRequestException("Invalid sort field");
    }

    // If Download specified
    if (download === "true") {
      const sheetname = "Users";
      const filename = `users`;

      const sp = new SpreadSheet(`${sheetname} List`);

      // Retrieve all users for export (without pagination)
      const allUsers = await this.userRepo.getAllUsersPaginated(
        filter,
        1,
        999999, // Get all users
        userSortBy(sortByField, sortOrder),
      );

      if (allUsers.users.length) {
        // Prepare the data - only essential information
        const data = allUsers.users.map((user) => {
          return {
            firstName: user.firstName || "N/A",
            lastName: user.lastName || "N/A",
            email: user.email || "N/A",
            phone: user.phone || "N/A",
            role: user.role || "N/A",
          };
        });

        // Define columns for export - only essentials
        const userExportCol = [
          { header: "First Name", key: "firstName", width: 20 },
          { header: "Last Name", key: "lastName", width: 20 },
          { header: "Email", key: "email", width: 35 },
          { header: "Phone", key: "phone", width: 20 },
          { header: "Role", key: "role", width: 15 },
        ];

        // Write to a file
        const filePath = await sp.writeExcel(
          filename,
          sheetname,
          userExportCol,
          data,
        );

        // Export the file
        return exportExcel(res, filename, filePath);
      }
    }

    const result = await this.userRepo.getAllUsersPaginated(
      filter,
      pageNumber,
      pageSize,
      userSortBy(sortByField, sortOrder),
    );

    return {
      data: result.users,
      metadata: {
        total: result.total,
        page: pageNumber,
        size: pageSize,
      },
    };
  }

  public async inviteUser(dto: InviteUserDto): Promise<string> {
    const property = await this.propertyRepo.findById(dto.propertyId);
    if (!property) {
      throw new NotFoundException("Property not found");
    }

    const user = await this.userRepo.findByEmail(dto.email);
    if (user) {
      throw new BadRequestException("User already exists");
    }

    const expiresIn = 30; // 30 minutes
    const otp = await this.generateInvitationCode(
      `${dto.email}:${dto.propertyId}`,
      7,
      expiresIn * 60 * 1000,
    );

    await this.notificationService.sendDirectEmail("invite", dto.email, {
      url: `${config.client_url}/invite?code=${otp}`,
      expiresIn: `${expiresIn} minutes`,
    });

    return otp;
  }

  public async completeRegistration(
    dto: CompleteRegDto,
  ): Promise<RegisterResponse> {
    // Verify token exists
    const data = await this.cacheService.get<string>(dto.token);
    if (!data) {
      throw new BadRequestException("Invalid or expired code provided");
    }

    const [email, propertyId] = data.split(":");

    if (!email || !propertyId) {
      throw new BadRequestException("Invalid code provided");
    }

    // Check if user already exist
    const user = await this.userRepo.findByEmail(email);
    if (user) {
      throw new BadRequestException("User already exists");
    }

    // Hash the password
    const hashedPassword = await hashPassword(dto.password);

    // Create the user
    const newUser = await this.userRepo.createUser({
      firstName: dto.firstName,
      lastName: dto.lastName,
      userName: `${dto.firstName}@${dto.lastName}`,
      password: hashedPassword,
      email: email as string,
      phone: dto.phone,
      role: dto.role ?? Role.security,
    });

    // Assign to property
    await this.securityRepo.assignGuardToProperty(newUser.id, propertyId);

    // Log registration
    await this.auditService.logAudit({
      action: "create",
      model: "user",
      userId: newUser.id,
      description: `New user registration - ${newUser.email}`,
    });

    // Send Welcome Email
    await this.notificationService.sendDirectEmail("welcome", newUser.email, {
      firstName: newUser.firstName,
    });

    // Delete token
    await this.cacheService.delete(dto.token);

    return newUser;
  }

  public async getUserDetails(userId: string): Promise<Omit<User, "password">> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }

  /**
   * Get resident details including user, property, house, and meter information
   * @param userId - The ID of the resident user
   * @returns A promise that resolves to an object containing user, property, house, and meter details
   * @throws NotFoundException if the user is not found
   */
  public async getResidentDetails(
    userId: string,
  ): Promise<ResidentDetailsResponse> {
    // Get user details
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    // Get meter details for the user
    const meter = await this.meterRepo.findMeterByOwnerId(userId);

    // If meter exists, get house and property details
    let house = null;
    let property = null;

    if (meter) {
      if (meter.houseId) {
        house = await this.houseRepo.findById(meter.houseId);
      }

      if (meter.propertyId) {
        property = await this.propertyRepo.findById(meter.propertyId);
      }
    }

    return {
      user,
      property,
      house,
      meter,
    };
  }

  public async deleteUser(req: Request, userId: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (user.deletedAt) {
      throw new BadRequestException("User already deleted");
    }

    const deletedUser = await this.userRepo.deleteUser(userId);

    // Log user delete
    await this.auditService.logAudit({
      action: "delete",
      model: "user",
      userId: req.user!.id,
      description: `User ${user.email} account deleted by (${req.user!.email})`,
    });

    return deletedUser;
  }

  public async restoreUser(req: Request, userId: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    const restoredUser = await this.userRepo.restoreUser(userId);

    // Log user restore
    await this.auditService.logAudit({
      action: "update",
      model: "user",
      userId: req.user!.id,
      description: `User ${user.email} account restored by (${req.user!.email})`,
    });

    return restoredUser;
  }

  public async generateInvitationCode(
    value: string,
    length: number = 6,
    ttl?: number,
  ): Promise<string> {
    // Generate a token, Store it in cache
    const generateCode = customAlphabet(
      "0123456789abcdefghijklmnopqrstuvwxyz",
      length,
    );

    const code = generateCode();

    await this.cacheService.set(code, value, ttl);
    return code;
  }
}

export default UserService;
