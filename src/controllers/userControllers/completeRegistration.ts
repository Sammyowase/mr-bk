import { Request, Response } from "express";
import sendResponse from "../../utils/http/sendResponse";
import UserService from "../../services/user.service";
import { CompleteRegDto } from "../../types/auth";
import { container } from "../../utils/handler/container";

export const completeRegistration = async (req: Request, res: Response) => {
  const dto: CompleteRegDto = req.body;

  const service = container.resolve(UserService);

  const data = await service.completeRegistration(dto);

  sendResponse(res, 201, "Registration completed successfully", data);
};
