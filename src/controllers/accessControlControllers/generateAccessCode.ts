import { Request, Response } from "express";
import AccessControlService from "../../services/access-control.service";
import sendResponse from "../../utils/http/sendResponse";
import { GenerateAccessCodeDto } from "../../types/access-control";
import { container } from "../../utils/handler/container";

export const generateAccessCode = async (req: Request, res: Response) => {
  const dto: GenerateAccessCodeDto = req.body;

  const service = container.resolve(AccessControlService);

  const accessToken = await service.generateAccessCode(req, dto);

  sendResponse(res, 201, "Access code generated successfully", accessToken);
  return;
};
