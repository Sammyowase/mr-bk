import { Request, Response } from "express";
import { UserPermissionService } from "../../services/userpermission.service";
import sendResponse from "../../utils/http/sendResponse";
import { container } from "tsyringe";

export const getAllRestrictions = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const service = container.resolve(UserPermissionService);

  const result = await service.getAllRestrictions();

  sendResponse(res, 200, "All restricted users retrieved successfully", result);

  return;
};
