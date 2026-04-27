import { Response } from "express";
import sendResponse from "../../utils/http/sendResponse";
import { JwtPayload } from "jsonwebtoken";
import MeterService from "../../services/meter.service";
import { container } from "../../utils/handler/container";

export const getAllMeters = async (req: JwtPayload, res: Response) => {
  const service = container.resolve(MeterService);

  const meters = await service.getAllMetersWithDetails();

  sendResponse(res, 200, "Meters fetched successfully", meters);
  return;
};

export default getAllMeters;
