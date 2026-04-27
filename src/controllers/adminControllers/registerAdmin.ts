import { Request, Response } from "express";
import sendResponse from "../../utils/http/sendResponse";
import { AdminRegisterDto } from "../../types/admin";
import AdminService from "../../services/admin.service";
import { container } from "../../utils/handler/container";

export const registerAdmin = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const body: AdminRegisterDto = req.body;

  const service = container.resolve(AdminService);

  const data = await service.register(body);

  sendResponse(res, 200, "Admin registered successfully", data);
  return;
};
