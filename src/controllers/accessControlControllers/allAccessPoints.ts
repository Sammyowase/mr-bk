import { Request, Response } from "express";
import AccessControlService from "../../services/access-control.service";
import PaginatedResponse from "../../utils/http/paginatedResponse";
import { container } from "../../utils/handler/container";

export const getAllAccessPoints = async (req: Request, res: Response) => {
  const { page, size, sortBy, order, search, propertyId } = req.query;

  const service = container.resolve(AccessControlService);

  const result = await service.getAllAccessPoints(
    page as string,
    size as string,
    sortBy as string,
    order as string,
    search as string,
    propertyId as string,
  );

  PaginatedResponse(
    res,
    "All access points retrieved successfully",
    result.data,
    result.metadata,
  );
  return;
};
