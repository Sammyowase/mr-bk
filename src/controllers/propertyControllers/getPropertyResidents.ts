import { Request, Response } from "express";
import PropertyService from "../../services/property.service";
import PaginatedResponse from "../../utils/http/paginatedResponse";
import { container } from "../../utils/handler/container";

export const getPropertyResidents = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { propertyId } = req.params;

  const { page, size, sortBy, order, search, download } = req.query;

  const service = container.resolve(PropertyService);

  const result = await service.getPropertyResidents(
    res,
    propertyId,
    page as string,
    size as string,
    sortBy as string,
    order as string,
    search as string,
    download as string,
  );

  if (result) {
    PaginatedResponse(
      res,
      "Property residents retrieved successfully",
      result.data,
      result.metadata,
    );
  }
  return;
};
