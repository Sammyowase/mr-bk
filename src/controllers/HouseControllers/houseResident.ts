import { Request, Response } from "express";
import sendResponse from "../../utils/http/sendResponse";
import HouseService from "../../services/house.service";
import { container } from "../../utils/handler/container";

export const getHouseResident = async (req: Request, res: Response) => {
  const { id } = req.params;

  const service = container.resolve(HouseService);

  const data = await service.getResidentsByHouseId(id);

  sendResponse(res, 200, "House resident fetched successfully", data);
  return;
};
