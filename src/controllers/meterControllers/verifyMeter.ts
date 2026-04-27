import { Request, Response } from "express";
import sendResponse from "../../utils/http/sendResponse";
import MeterService from "../../services/meter.service";
import { BadRequestException } from "../../utils/exceptions/customException";
import { VerifyMeterDto } from "../../types/vending";
import { container } from "../../utils/handler/container";

export const verifyMeter = async (req: Request, res: Response) => {
  const dto: VerifyMeterDto = req.body;

  const service = container.resolve(MeterService);

  const verifyMeter = await service.verifyMeter(dto.meterNumber);

  if (verifyMeter) {
    sendResponse(res, 200, "The meter number is valid", verifyMeter);
    return;
  } else {
    throw new BadRequestException("The meter number is invalid");
  }
};
