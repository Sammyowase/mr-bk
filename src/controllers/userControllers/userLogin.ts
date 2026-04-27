import { Request, Response } from "express";
import sendResponse from "../../utils/http/sendResponse";
import { LoginDto } from "../../types/admin";
import UserService from "../../services/user.service";
import { container } from "../../utils/handler/container";

export const userLogin = async (req: Request, res: Response): Promise<void> => {
  const dto: LoginDto = req.body;

  const service = container.resolve(UserService);

  const responseData = await service.login(req, dto);

  sendResponse(res, 200, "Login successful", responseData);
};
