import { Response } from "express";
import sendResponse from "../../utils/http/sendResponse";
import { JwtPayload } from "jsonwebtoken";
import { UserPermissionService } from "../../services/userpermission.service";
import { container } from "tsyringe";

export const removeUserRestrictions = async (
  req: JwtPayload,
  res: Response,
) => {
  const { userId } = req.params;

  const service = container.resolve(UserPermissionService);

  await service.removeUserRestrictions(req, userId);

  sendResponse(res, 200, "All user restrictions removed successfully");
  return;
};
