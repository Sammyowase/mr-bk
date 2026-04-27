import { Request, Response } from "express";
import AccessControlService from "../../services/access-control.service";
import PaginatedResponse from "../../utils/http/paginatedResponse";
import { container } from "../../utils/handler/container";

export const getAllAccessCodes = async (req: Request, res: Response) => {
  const { accesspointId, page, size, sortBy, order, search, status } =
    req.query;

  const service = container.resolve(AccessControlService);

  const result = await service.getAllAccessCodes(
    req,
    accesspointId as string,
    page as string,
    size as string,
    sortBy as string,
    order as string,
    search as string,
    status as string,
  );

  PaginatedResponse(
    res,
    "Access codes retrieved successfully",
    result.data,
    result.metadata,
  );
  return;
};
