import { Request, Response } from "express";
import { container } from "tsyringe";
import AlertService from "../../services/alert.service";
import sendResponse from "../../utils/http/sendResponse";
import { logger } from "../../utils/logger/logger";

export const getUpcomingEvents = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return sendResponse(res, 401, "Unauthorized", null);
    }

    // Get limit from query params, default to 10
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

    const service = container.resolve(AlertService);
    const events = await service.getUpcomingEvents(userId, limit);

    sendResponse(res, 200, "Upcoming events retrieved successfully", events);
  } catch (error) {
    logger.error("Error retrieving upcoming events", error);
    sendResponse(res, 500, "Failed to retrieve upcoming events", null);
  }
};

export default getUpcomingEvents;
