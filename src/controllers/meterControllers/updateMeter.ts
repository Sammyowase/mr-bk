import { Request, Response } from "express";
import { container } from "tsyringe";
import MeterService from "../../services/meter.service";
import { UpdateMeterDto } from "../../types/vending";
import sendResponse from "../../utils/http/sendResponse";

/**
 * Updates a meter by its ID.
 *
 * @param req - Express request object containing meter ID and update data
 * @param res - Express response object
 * @returns A response with the updated meter data
 */
export const updateMeter = async (req: Request, res: Response) => {
  const meterId = req.params.meterId;
  const updateData: UpdateMeterDto = req.body;
  const userId = req.user?.id as string;

  const meterService = container.resolve(MeterService);
  const updatedMeter = await meterService.updateMeter(
    meterId,
    updateData,
    userId,
  );

  return sendResponse(res, 200, "Meter updated successfully", updatedMeter);
};
