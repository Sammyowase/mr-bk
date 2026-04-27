import { Request, Response } from "express";
import sendResponse from "../../utils/http/sendResponse";
import { SendUpdateEmailDto } from "../../types/admin";
import { container } from "../../utils/handler/container";
import { EmailService } from "../../services/email.service";

export const sendUpdateMail = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const dto: SendUpdateEmailDto = req.body;

  const service = container.resolve(EmailService);

  const response = await service.sendToAllUsers("feature-update", dto);

  sendResponse(res, 200, "Feature update email sent successfully", response);

  return;
};
