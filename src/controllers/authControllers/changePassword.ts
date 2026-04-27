import { Request, Response } from "express";
import AuthService from "../../services/auth.service";
import { ChangePasswordDto } from "../../types/auth";
import sendResponse from "../../utils/http/sendResponse";
import { container } from "../../utils/handler/container";

export const changePassword = async (req: Request, res: Response) => {
  const dto: ChangePasswordDto = req.body;

  const email = req.user && req.user.email;

  const service = container.resolve(AuthService);

  await service.changePassword(email, dto.password);

  sendResponse(res, 200, "Password changed successfully.");
  return;
};
