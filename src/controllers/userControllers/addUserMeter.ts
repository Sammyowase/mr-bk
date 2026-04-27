import { Request, Response } from "express";
import sendResponse from "../../utils/http/sendResponse";
import UserService from "../../services/user.service";
import { AddUserMeterDto } from "../../types/user";
import { container } from "../../utils/handler/container";

export const addUserMeter = async (req: Request, res: Response) => {
  const dto: AddUserMeterDto = req.body;

  const service = container.resolve(UserService);

  const meterData = await service.addUserMeter(dto);

  sendResponse(res, 200, "Meter added successfully", meterData);
};
