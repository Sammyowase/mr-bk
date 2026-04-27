import { Response } from "express";
import sendResponse from "../../utils/http/sendResponse";
import PropertyService from "../../services/property.service";
import { CreatePropertyDto } from "../../types/property";
import { JwtPayload } from "jsonwebtoken";
import { container } from "../../utils/handler/container";

export const createProperty = async (req: JwtPayload, res: Response) => {
  let dto: CreatePropertyDto = req.body;
  const userId = req.user?.id;

  const service = container.resolve(PropertyService);

  const newProperty = await service.createProperty(req, dto, userId);

  sendResponse(res, 200, "Property created successfully", newProperty);
  return;
};
