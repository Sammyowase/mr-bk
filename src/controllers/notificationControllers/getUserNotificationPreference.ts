import { Request, Response } from "express";
import sendResponse from "../../utils/http/sendResponse";
import { container } from "tsyringe";
import NotificationService from "../../services/notification.service";

export const getNotificationPreference = async (
  req: Request,
  res: Response,
) => {
  const userId = req.user?.id;

  const service = container.resolve(NotificationService);

  const notifications = await service.getNotificationPreference(userId);

  sendResponse(
    res,
    200,
    "User notification preference retrieved successfully",
    notifications,
  );
  return;
};

export default getNotificationPreference;
