import { Request, Response } from "express";
import { MeterService } from "../../services/meter.service";
import { container } from "../../utils/handler/container";
import sendResponse from "../../utils/http/sendResponse";

/**
 * Controller to get all meters associated with a specific property
 *
 * @param req - Express request object with propertyId as a parameter
 * @param res - Express response object
 */
export const getMetersByPropertyId = async (req: Request, res: Response) => {
  const { propertyId } = req.params;

  if (!propertyId) {
    return sendResponse(res, 400, "Property ID is required", null);
  }

  const meterService = container.resolve(MeterService);
  const meters = await meterService.getMetersByPropertyId(propertyId);

  return sendResponse(res, 200, "Meters retrieved successfully", meters);
};
