import { Request, Response } from "express";
import AccessControlService from "../../services/access-control.service";
import sendResponse from "../../utils/http/sendResponse";
import { container } from "../../utils/handler/container";

export const revokeAccessCode = async (req: Request, res: Response) => {
  const { accesscodeId } = req.params;

  const service = container.resolve(AccessControlService);

  const revokedToken = await service.revokeAccessCode(req, accesscodeId);

  sendResponse(res, 200, "Access code revoked successfully", revokedToken);
  return;
};
