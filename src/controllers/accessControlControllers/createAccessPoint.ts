import { Request, Response } from "express";
import AccessControlService from "../../services/access-control.service";
import sendResponse from "../../utils/http/sendResponse";
import { CreateAccessPointDto } from "../../types/access-control";
import { container } from "../../utils/handler/container";

export const createAccessPoint = async (req: Request, res: Response) => {
  const dto: CreateAccessPointDto = req.body;

  const service = container.resolve(AccessControlService);

  const accessPoint = await service.createAccessPoint(req, dto);

  sendResponse(res, 201, "Access point created successfully", accessPoint);
  return;
};
