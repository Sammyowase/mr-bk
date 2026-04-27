import { Response } from "express";
import sendResponse from "../../utils/http/sendResponse";
import { JwtPayload } from "jsonwebtoken";
import MeterService from "../../services/meter.service";
import { container } from "../../utils/handler/container";

export const getUserMeter = async (req: JwtPayload, res: Response) => {
  const userId = req.user.id;

  const service = container.resolve(MeterService);

  const meterNumber = await service.getUserMeter(userId);

  sendResponse(res, 200, "Meter number fetched successfully", meterNumber);
  return;
};

export default getUserMeter;
