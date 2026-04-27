import { Request, Response } from "express";
import { MeterService } from "../../services/meter.service";
import { container } from "../../utils/handler/container";
import sendResponse from "../../utils/http/sendResponse";

/**
 * Controller to search for meters based on user, property, or house information
 *
 * @param req - Express request object with query parameter 'q' containing the search term
 * @param res - Express response object
 */
export const searchMeters = async (req: Request, res: Response) => {
  const searchTerm = req.query.q as string;

  if (!searchTerm || searchTerm.trim() === "") {
    sendResponse(res, 400, "Search term is required");
    return;
  }

  const meterService = container.resolve(MeterService);
  const meters = await meterService.searchMeters(searchTerm);

  sendResponse(res, 200, "Meters retrieved successfully", meters);
};
