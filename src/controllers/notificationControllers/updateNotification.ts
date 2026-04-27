import { Request, Response } from "express";
import sendResponse from "../../utils/http/sendResponse";
import { container } from "tsyringe";
import NotificationService from "../../services/notification.service";
import { UpdateNotifyStatus } from "../../types/notification";

const updateNotification = async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const id = req.params.id;

  const dto: UpdateNotifyStatus = req.body;

  const service = container.resolve(NotificationService);

  const updatePreference = await service.updateNotification(id, dto, userId);

  sendResponse(res, 200, "Notification updated successfully", updatePreference);
  return;
};

export default updateNotification;
