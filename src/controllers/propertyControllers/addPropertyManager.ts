import { Request, Response } from "express";
import sendResponse from "../../utils/http/sendResponse";
import PropertyService from "../../services/property.service";
import { AddPropertyManagerDto } from "../../types/property";
import { container } from "../../utils/handler/container";

export const addPropertyManager = async (req: Request, res: Response) => {
  let dto: AddPropertyManagerDto = req.body;

  const service = container.resolve(PropertyService);

  const result = await service.addPropertyManager(dto);

  sendResponse(res, 200, "Property manager added successfully", result);
  return;
};
