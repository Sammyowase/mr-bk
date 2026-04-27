import { Request, Response } from "express";
import { container } from "tsyringe";
import AlertService from "../../services/alert.service";
import sendResponse from "../../utils/http/sendResponse";
import { logger } from "../../utils/logger/logger";

export const cancelCalendarEvent = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const { title, description, audienceType, audienceIds } = req.body;

    if (!eventId || !title || !audienceType || !audienceIds) {
      return sendResponse(res, 400, "Missing required fields", null);
    }

    const service = container.resolve(AlertService);
    await service.cancelCalendarEvent({
      eventId,
      title,
      description,
      audienceType,
      audienceIds,
    });

    sendResponse(res, 200, "Event calendar event cancelled successfully", {
      eventId,
      title,
    });
  } catch (error) {
    logger.error("Error cancelling event calendar event", error);
    sendResponse(res, 500, "Failed to cancel event calendar event", null);
  }
};

export default cancelCalendarEvent;
