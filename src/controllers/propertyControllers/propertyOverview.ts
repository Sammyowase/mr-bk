import { Request, Response } from "express";
import sendResponse from "../../utils/http/sendResponse";
import PropertyService from "../../services/property.service";
import { JwtPayload } from "jsonwebtoken";
import { container } from "../../utils/handler/container";

export const getPropertyOverview = async (req: Request, res: Response) => {
  const { propertyId } = req.params;

  const service = container.resolve(PropertyService);

  const overview = await service.getPropertyOverview(propertyId);

  sendResponse(res, 200, "Property overview retrieved successfully", overview);
  return;
};

export const getPropertyOverviewByManagerId = async (
  req: JwtPayload,
  res: Response,
) => {
  const managerId = req.user.id;

  const service = container.resolve(PropertyService);

  const overview = await service.getPropertyOverviewByManagerId(managerId);

  sendResponse(res, 200, "Property overview retrieved successfully", overview);
  return;
};

export const getPropertyOverviewBySecurityId = async (
  req: JwtPayload,
  res: Response,
) => {
  const securityId = req.user.id;

  const service = container.resolve(PropertyService);

  const overview = await service.getPropertyOverviewBySecurityId(securityId);

  sendResponse(res, 200, "Property overview retrieved successfully", overview);
  return;
};
