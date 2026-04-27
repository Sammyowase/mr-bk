import { Request, Response } from "express";
import sendResponse from "../../utils/http/sendResponse";
import { UpdateNotifyPrefDto } from "../../types/notification";
import { container } from "tsyringe";
import NotificationService from "../../services/notification.service";

const updateNotificationPreference = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  const dto: Partial<UpdateNotifyPrefDto> = req.body;

  const service = container.resolve(NotificationService);

  const updatePreference = await service.updateNotifyPreference(userId, dto);

  sendResponse(
    res,
    200,
    "Notification preference updated successfully",
    updatePreference,
  );
  return;
};

export default updateNotificationPreference;
