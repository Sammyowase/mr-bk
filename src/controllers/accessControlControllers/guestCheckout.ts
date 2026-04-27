import { Request, Response } from "express";
import AccessControlService from "../../services/access-control.service";
import sendResponse from "../../utils/http/sendResponse";
import { ExitVerifyDto } from "../../types/access-control";
import { container } from "../../utils/handler/container";

export const guestCheckout = async (req: Request, res: Response) => {
  const { id } = req.params;

  const data: ExitVerifyDto = req.body;

  const userId = req.user?.id;

  const service = container.resolve(AccessControlService);

  const dto: ExitVerifyDto = {
    checked: data.checked,
    exitTime: data.exitTime,
    guestLogId: id,
    userId,
  };
  const accessPoint = await service.exitRequest(dto);

  sendResponse(res, 200, "Guest checked out successfully", accessPoint);
  return;
};
