import { Request, Response } from "express";
import sendResponse from "../../utils/http/sendResponse";
import PropertyService from "../../services/property.service";
import { CreatePropertyDto } from "../../types/property";
import { container } from "tsyringe";

export const updateProperty = async (req: Request, res: Response) => {
  const { id } = req.params;
  const dto: Partial<CreatePropertyDto> = req.body;

  const service = container.resolve(PropertyService);

  const updatedProperty = await service.updateProperty(req, dto, id);

  sendResponse(res, 200, "Property updated successfully", updatedProperty);
  return;
};
