import { Request, Response } from "express";
import { container } from "tsyringe";
import AlertService from "../../services/alert.service";
import sendResponse from "../../utils/http/sendResponse";

export const markAlertAsRead = async (req: Request, res: Response) => {
  const alertId = req.params.id;
  const userId = req.user?.id;

  const service = container.resolve(AlertService);

  await service.markAlertAsRead(alertId, userId);

  sendResponse(res, 200, "Alert marked as read successfully");
};

export default markAlertAsRead;
