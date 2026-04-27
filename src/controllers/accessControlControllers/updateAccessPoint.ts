import { Request, Response } from "express";
import AccessControlService from "../../services/access-control.service";
import sendResponse from "../../utils/http/sendResponse";
import { UpdateAccessPointDto } from "../../types/access-control";
import { container } from "../../utils/handler/container";

export const updateAccessPoint = async (req: Request, res: Response) => {
  const { accesspointId } = req.params;
  const dto: UpdateAccessPointDto = req.body;

  const service = container.resolve(AccessControlService);

  const accessPoint = await service.updateAccessPoint(req, accesspointId, dto);

  sendResponse(res, 200, "Access point updated successfully", accessPoint);
  return;
};
