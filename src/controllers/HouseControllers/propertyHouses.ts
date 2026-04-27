import { Request, Response } from "express";
import sendResponse from "../../utils/http/sendResponse";
import HouseService from "../../services/house.service";
import { container } from "../../utils/handler/container";

export const getPropertyHouses = async (req: Request, res: Response) => {
  const propertyId = req.params.id;

  const service = container.resolve(HouseService);

  const houses = await service.getHousesByPropertyId(propertyId);

  sendResponse(res, 200, "Houses fetched successfully", houses);
  return;
};
