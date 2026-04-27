import { Request, Response } from "express";
import AccessControlService from "../../services/access-control.service";
import sendResponse from "../../utils/http/sendResponse";
import { container } from "../../utils/handler/container";

export const deleteAccessPoint = async (req: Request, res: Response) => {
  const { accesspointId } = req.params;

  const service = container.resolve(AccessControlService);

  await service.deleteAccessPoint(req, accesspointId);

  sendResponse(res, 200, "Access point deleted successfully");
  return;
};
