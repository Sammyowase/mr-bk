import { Request, Response } from "express";
import sendResponse from "../../utils/http/sendResponse";
import PropertyService from "../../services/property.service";
import { container } from "../../utils/handler/container";

export const deleteProperty = async (req: Request, res: Response) => {
  const { id } = req.params;

  const service = container.resolve(PropertyService);

  await service.deleteProperty(req, id);

  sendResponse(res, 200, "Property deleted successfully");
  return;
};
