import { Request, Response } from "express";
import sendResponse from "../utils/http/sendResponse";
import { ForgotPasswordDto } from "../types/auth";
import AuthService from "../services/auth.service";
import { container } from "../utils/handler/container";

export const forgetPassword = async (req: Request, res: Response) => {
  const dto: ForgotPasswordDto = req.body;

  const service = container.resolve(AuthService);

  await service.forgotPassword(dto);

  sendResponse(res, 200, "Password reset otp sent");
  return;
};
