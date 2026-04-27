import { Request, Response } from "express";
import PropertyService from "../../services/property.service";
import PaginatedResponse from "../../utils/http/paginatedResponse";
import sendResponse from "../../utils/http/sendResponse";
import { PropertiesWithMetadata } from "../../types/property";
import { container } from "../../utils/handler/container";

export const getAllProperty = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { page, size, sortBy, order, search } = req.query;

  const paginated = page || size || sortBy || order || search;

  const service = container.resolve(PropertyService);

  const result = await service.getAllProperties(
    paginated as string,
    page as string,
    size as string,
    sortBy as string,
    order as string,
    search as string,
  );

  if (paginated) {
    const paginatedResult = result as PropertiesWithMetadata;
    PaginatedResponse(
      res,
      "All properties retrieved successfully",
      paginatedResult.data,
      paginatedResult.metadata,
    );
  } else {
    sendResponse(res, 200, "Properties retrieved successfully", result);
  }
  return;
};
