import { Request, Response } from "express";
import AccessControlService from "../../services/access-control.service";
import sendResponse from "../../utils/http/sendResponse";
import { container } from "../../utils/handler/container";

export const verifyAccessCode = async (req: Request, res: Response) => {
  const { token } = req.params;

  const service = container.resolve(AccessControlService);

  const result = await service.getAccessCodeDetails(token);

  sendResponse(res, 200, "Access code retrieved successfully", result);
  return;
};
