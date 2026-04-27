import { Response } from "express";
import sendResponse from "../../utils/http/sendResponse";
import { JwtPayload } from "jsonwebtoken";
import { UserPermissionService } from "../../services/userpermission.service";
import { RemoveRestrictionDto } from "../../types/permission";
import { container } from "tsyringe";

export const removeRestriction = async (req: JwtPayload, res: Response) => {
  let dto: RemoveRestrictionDto = req.body;

  const service = container.resolve(UserPermissionService);

  const newProperty = await service.removeRestriction(
    req,
    dto.userId,
    dto.restrictionType,
  );

  sendResponse(res, 200, "Restriction(s) removed successfully", newProperty);
  return;
};
