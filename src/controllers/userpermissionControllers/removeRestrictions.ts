import { Response } from "express";
import sendResponse from "../../utils/http/sendResponse";
import { JwtPayload } from "jsonwebtoken";
import { UserPermissionService } from "../../services/userpermission.service";
import { container } from "tsyringe";

export const removeRestrictions = async (req: JwtPayload, res: Response) => {
  const { restrictionId } = req.params;

  const service = container.resolve(UserPermissionService);

  await service.removeRestrictions(req, restrictionId);

  sendResponse(res, 200, "Restrictions removed successfully");
  return;
};
