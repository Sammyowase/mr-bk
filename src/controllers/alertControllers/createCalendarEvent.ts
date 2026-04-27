import { Request, Response } from "express";
import { container } from "tsyringe";
import AlertService from "../../services/alert.service";
import sendResponse from "../../utils/http/sendResponse";
import { EventCalendarEvent, SystemEventType } from "../../types/alert";
import { logger } from "../../utils/logger/logger";

export const createCalendarEvent = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const eventData = req.body as Omit<EventCalendarEvent, "timestamp">;

    // Set the event type to EVENT_CREATED
    eventData.type = SystemEventType.EVENT_CREATED;

    // Set the creator if not provided
    if (!eventData.createdBy && userId) {
      eventData.createdBy = userId;
    }

    const service = container.resolve(AlertService);
    await service.createCalendarEvent(eventData);

    sendResponse(res, 201, "Event calendar event created successfully", {
      eventId: eventData.eventId,
      title: eventData.title,
      startsAt: eventData.startsAt,
    });
  } catch (error) {
    logger.error("Error creating event calendar event", error);
    sendResponse(res, 500, "Failed to create event calendar event", null);
  }
};

export default createCalendarEvent;
