import { Request, Response } from "express";
import sendResponse from "../../utils/http/sendResponse";
import AdminService from "../../services/admin.service";
import { LoginDto } from "../../types/admin";
import { container } from "../../utils/handler/container";

export const loginAdmin = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const body: LoginDto = req.body;

  const service = container.resolve(AdminService);

  const responseData = await service.login(req, body);

  sendResponse(res, 200, "Login successful", responseData);
  return;
};
