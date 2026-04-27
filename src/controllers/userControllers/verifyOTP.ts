import { Request, Response } from "express";
import sendResponse from "../../utils/http/sendResponse";
import { VerifyEmailDto } from "../../types/user";
import UserService from "../../services/user.service";
import { container } from "../../utils/handler/container";

export const verifyOTP = async (req: Request, res: Response) => {
  const dto: VerifyEmailDto = req.body;

  const service = container.resolve(UserService);

  const newUser = await service.verifyEmail(dto);

  sendResponse(res, 200, "OTP verified successfully", newUser);
};
