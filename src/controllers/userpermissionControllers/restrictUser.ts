import { Response } from "express";
import sendResponse from "../../utils/http/sendResponse";
import { JwtPayload } from "jsonwebtoken";
import { UserPermissionService } from "../../services/userpermission.service";
import { RestrictUserDto } from "../../types/permission";
import { container } from "tsyringe";

export const restrictUser = async (req: JwtPayload, res: Response) => {
  let dto: RestrictUserDto = req.body;

  const service = container.resolve(UserPermissionService);

  const result = await service.restrictUser(req, dto);

  sendResponse(res, 200, "User restricted successfully", result);
  return;
};
