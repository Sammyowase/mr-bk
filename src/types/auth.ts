import { Role } from "../../prisma/generated/prisma";

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  email: string;
  token: string;
  newPassword: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
}

export interface CreateOtpDto {
  id?: string;
  otp: string;
  email: string;
  data: string | null;
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ChangePasswordDto {
  password: string;
}

export interface InviteUserDto {
  email: string;
  propertyId: string;
}

export interface CompleteRegDto {
  firstName: string;
  lastName: string;
  password: string;
  phone: string;
  role: Role;
  token: string;
}
