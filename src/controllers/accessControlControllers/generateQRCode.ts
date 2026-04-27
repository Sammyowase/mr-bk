import { Request, Response } from "express";
import AccessControlService from "../../services/access-control.service";
import sendResponse from "../../utils/http/sendResponse";
import { GenerateQRCodeDto } from "../../types/access-control";
import { container } from "../../utils/handler/container";

export const generateQRCode = async (req: Request, res: Response) => {
  const dto: GenerateQRCodeDto = req.body;

  const service = container.resolve(AccessControlService);

  const qrCodeData = await service.generateQRCode(req, dto);

  sendResponse(res, 201, "QR code generated successfully", qrCodeData);
  return;
};
