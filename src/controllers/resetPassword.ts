import { Request, Response } from "express";
import sendResponse from "../utils/http/sendResponse";
import AuthService from "../services/auth.service";
import { ResetPasswordDto } from "../types/auth";
import { container } from "../utils/handler/container";

export const resetPassword = async (req: Request, res: Response) => {
  const dto: ResetPasswordDto = req.body;

  const service = container.resolve(AuthService);

  await service.resetPassword(dto);

  sendResponse(res, 200, "Password reset successfully.");
  return;
};
