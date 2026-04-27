import { Request, Response } from "express";
import { container } from "tsyringe";
import AlertService from "../../services/alert.service";
import sendResponse from "../../utils/http/sendResponse";
import { EventCalendarEvent } from "../../types/alert";
import { logger } from "../../utils/logger/logger";

export const updateCalendarEvent = async (req: Request, res: Response) => {
  try {
    const eventData = req.body as Omit<EventCalendarEvent, "timestamp">;

    const service = container.resolve(AlertService);
    await service.updateCalendarEvent(eventData);

    sendResponse(res, 200, "Event calendar event updated successfully", {
      eventId: eventData.eventId,
      title: eventData.title,
      startsAt: eventData.startsAt,
    });
  } catch (error) {
    logger.error("Error updating event calendar event", error);
    sendResponse(res, 500, "Failed to update event calendar event", null);
  }
};

export default updateCalendarEvent;
