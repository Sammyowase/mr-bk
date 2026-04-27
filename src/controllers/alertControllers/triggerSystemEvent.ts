import { Request, Response } from "express";
import { container } from "tsyringe";
import AlertService from "../../services/alert.service";
import sendResponse from "../../utils/http/sendResponse";
import { AnySystemEvent } from "../../types/alert";
import { logger } from "../../utils/logger/logger";

export const triggerSystemEvent = async (req: Request, res: Response) => {
  try {
    // User ID is available from req.user?.id if needed in the future
    const eventData = req.body as AnySystemEvent;

    // Add timestamp if not provided
    if (!eventData.timestamp) {
      eventData.timestamp = new Date();
    }

    const service = container.resolve(AlertService);

    await service.triggerSystemEvent(eventData);

    sendResponse(res, 200, "System event triggered successfully", {
      eventType: eventData.type,
      timestamp: eventData.timestamp,
    });
  } catch (error) {
    logger.error("Error triggering system event", error);
    sendResponse(res, 500, "Failed to trigger system event", null);
  }
};

export default triggerSystemEvent;
