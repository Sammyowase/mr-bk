import {
  ForgotPasswordDto,
  RefreshTokenDto,
  RefreshTokenResponse,
  ResetPasswordDto,
} from "../types/auth";
import {
  BadRequestException,
  NotFoundException,
} from "../utils/exceptions/customException";
import { generateOtp } from "../utils/service/otp";
import { hashPassword } from "../utils/service/password";
import {
  generateRefreshToken,
  generateToken,
  verifyToken,
} from "../utils/service/token";
import UserRepository from "../repository/user.repository";
import OtpRepository from "../repository/otp.repository";
import AuditLogService from "./audit.service";
import { injectable } from "tsyringe";
import NotificationService from "./notification.service";

/**
 * Service class for handling authentication-related operations.
 *
 * @remarks
 * This class provides methods for user authentication workflows, including password reset (via OTP),
 * password update, and token refresh functionality.
 *
 * @method forgotPassword
 * Initiates the password reset process by generating and emailing a one-time password (OTP) to the user.
 * Throws a NotFoundException if the user is not found.
 *
 * @method resetPassword
 * Resets the user's password using a valid OTP token. Throws a BadRequestException if the token is invalid or expired.
 *
 * @method refreshToken
 * Generates a new access token and refresh token pair using a valid refresh token.
 * Throws a BadRequestException if the token is invalid, expired, or the user is not found.
 */
@injectable()
class AuthService {
  constructor(
    private notificationService: NotificationService,
    private auditService: AuditLogService,
    private repo: UserRepository,
    private otpRepo: OtpRepository,
  ) {}
  /**
   * Initiates the password reset process by generating and emailing a one-time password (OTP) to the user.
   * Throws a NotFoundException if the user is not found.
   *
   * @param dto - The data transfer object containing the user's email address.
   */
  public async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.repo.findByEmail(dto.email);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    // Generate a reset token
    const resetotp = generateOtp();
    const resetotpExpiry = new Date(Date.now() + 15 * 60 * 1000); // Token valid for 1 hour

    await this.otpRepo.createOtp({
      otp: String(resetotp),
      email: dto.email,
      data: "",
      expiresAt: resetotpExpiry,
    });

    // Log Otp sent
    await this.auditService.logAudit({
      action: "create",
      model: "otp",
      userId: user.id,
      description: `${user.email} requested for otp to reset password`,
    });

    await this.notificationService.sendDirectEmail("reset-otp", dto.email, {
      name: user.firstName,
      otp: resetotp,
      expiresIn: 15,
    });
    return;
  }

  /**
   * Resets the user's password using a valid OTP token.
   * Throws a BadRequestException if the token is invalid or expired.
   *
   * @param dto - The data transfer object containing the user's email address, OTP token, and new password.
   */
  public async resetPassword(dto: ResetPasswordDto) {
    const tokenExist = await this.otpRepo.findByOtpOrEmail({
      email: dto.email,
      otp: dto.token,
    });
    if (!tokenExist) {
      throw new BadRequestException("Incorrect token.");
    }
    const currentTime = new Date();
    if (currentTime > tokenExist.expiresAt) {
      throw new BadRequestException("Token has expired.");
    }
    const hashedPassword = await hashPassword(dto.newPassword);

    const user = await this.repo.updateUserByEmail(dto.email, {
      password: hashedPassword,
    });

    // Log Password change
    await this.auditService.logAudit({
      action: "update",
      model: "user",
      userId: user.id,
      description: `${user.email} changes password`,
    });

    return;
  }

  /**
   * Generates a new access token and refresh token pair using a valid refresh token.
   * Throws a BadRequestException if the token is invalid, expired, or the user is not found.
   *
   * @param dto - The data transfer object containing the refresh token.
   * @returns A promise that resolves to an object containing the new access token and refresh token.
   */
  public async refreshToken(
    dto: RefreshTokenDto,
  ): Promise<RefreshTokenResponse> {
    let decoded;
    try {
      decoded = verifyToken(dto.refreshToken);
    } catch {
      throw new BadRequestException("Invalid or expired token");
    }

    if (typeof decoded !== "object" || !("id" in decoded)) {
      throw new BadRequestException("Invalid token payload");
    }
    const user = await this.repo.findById(decoded.id);
    if (!user) {
      throw new BadRequestException("User not found");
    }
    const data = { id: user.id, role: user.role, email: user.email };
    const token = generateToken(data);
    const newRefreshToken = generateRefreshToken(data);

    return {
      token,
      refreshToken: newRefreshToken,
    };
  }

  public async changePassword(email: string, password: string) {
    if (!email) {
      throw new BadRequestException("Email is required");
    }

    const hashedPassword = await hashPassword(password);

    const user = await this.repo.updateUserByEmail(email, {
      password: hashedPassword,
    });

    // Log Password change
    await this.auditService.logAudit({
      action: "update",
      model: "user",
      userId: user.id,
      description: `${user.email} changes password`,
    });

    return;
  }
}

export default AuthService;
