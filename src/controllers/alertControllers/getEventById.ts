import { Request, Response } from "express";
import { container } from "tsyringe";
import AlertService from "../../services/alert.service";
import sendResponse from "../../utils/http/sendResponse";
import { logger } from "../../utils/logger/logger";

export const getEventById = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;

    if (!eventId) {
      return sendResponse(res, 400, "Event ID is required", null);
    }

    const service = container.resolve(AlertService);
    const event = await service.getEventById(eventId);

    sendResponse(res, 200, "Event retrieved successfully", event);
  } catch (error) {
    logger.error(`Error retrieving event by ID: ${req.params.eventId}`, error);

    if (error instanceof Error && error.message === "Event not found") {
      return sendResponse(res, 404, "Event not found", null);
    }

    sendResponse(res, 500, "Failed to retrieve event", null);
  }
};

export default getEventById;
