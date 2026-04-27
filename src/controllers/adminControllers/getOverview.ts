import { Request, Response } from "express";
import sendResponse from "../../utils/http/sendResponse";
import AdminService from "../../services/admin.service";
import { container } from "../../utils/handler/container";

export const getOverview = async (req: Request, res: Response) => {
  const service = container.resolve(AdminService);

  const overview = await service.getOverview();

  sendResponse(res, 200, "Admin overview retrieved successfully", overview);
  return;
};
