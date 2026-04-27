import { Request, Response } from "express";
import AccessControlService from "../../services/access-control.service";
import PaginatedResponse from "../../utils/http/paginatedResponse";
import { container } from "../../utils/handler/container";

export const getPropertyAccessCodes = async (req: Request, res: Response) => {
  const { propertyId } = req.params;
  const { page, size } = req.query;

  const service = container.resolve(AccessControlService);

  const result = await service.getPropertyAccessCodes(
    propertyId as string,
    page as string,
    size as string,
  );

  PaginatedResponse(
    res,
    "Property access codes retrieved successfully",
    result.data,
    result.metadata,
  );
  return;
};
