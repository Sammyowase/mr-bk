import { Request, Response } from "express";
import sendResponse from "../../utils/http/sendResponse";
import { CreateHouseDto } from "../../types/house";
import HouseService from "../../services/house.service";
import { container } from "../../utils/handler/container";

export const createHouse = async (req: Request, res: Response) => {
  const data: CreateHouseDto = req.body;
  const propertyId = req.params.id;
  const authorId = req.user?.id;

  const service = container.resolve(HouseService);

  // Create a new house record
  const newHouse = await service.create(data, propertyId, authorId);

  // Send the response
  sendResponse(res, 200, "House created successfully", newHouse);
  return;
};
