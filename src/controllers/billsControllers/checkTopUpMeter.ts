import { Request, Response } from "express";
import sendResponse from "../../utils/http/sendResponse";
import { billService } from "../../services/bills.service";

export const checkTopUpMeter = async (req: Request, res: Response) => {
  const { meterNumber, disco, vendType, vertical } = req.query;

  const result = await billService.checkTopUpMeter(
    meterNumber as string,
    disco as string,
    vendType as string,
    vertical as string,
  );

  sendResponse(res, 200, "BP meter status retrieved successfully", result);
  return;
};
