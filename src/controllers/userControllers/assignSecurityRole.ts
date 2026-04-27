import { Request, Response } from "express";
import AccessControlService from "../../services/access-control.service";
import sendResponse from "../../utils/http/sendResponse";
import { AssignSecurityRoleDto } from "../../types/access-control";
import { container } from "../../utils/handler/container";

export const assignSecurityRole = async (req: Request, res: Response) => {
  const dto: AssignSecurityRoleDto = req.body;

  const service = container.resolve(AccessControlService);

  const updatedUser = await service.assignSecurityRole(req, dto);

  sendResponse(res, 200, "Security role assigned successfully", updatedUser);
  return;
};
