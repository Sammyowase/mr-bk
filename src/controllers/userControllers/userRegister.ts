import { Request, Response } from "express";
import sendResponse from "../../utils/http/sendResponse";
import { RegisterDto } from "../../types/user";
import UserService from "../../services/user.service";
import { container } from "../../utils/handler/container";

export const registerUser = async (req: Request, res: Response) => {
  const dto: RegisterDto = req.body;

  const service = container.resolve(UserService);

  await service.register(dto);

  sendResponse(res, 200, "OTP sent successfully");
};
