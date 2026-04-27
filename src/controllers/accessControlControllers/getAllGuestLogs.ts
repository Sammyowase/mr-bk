import { Request, Response } from "express";
import AccessControlService from "../../services/access-control.service";
import PaginatedResponse from "../../utils/http/paginatedResponse";
import { container } from "../../utils/handler/container";

export const getAllGuestLogs = async (req: Request, res: Response) => {
  const {
    propertyId,
    page,
    size,
    search,
    startDate,
    endDate,
    status,
    download,
  } = req.query;

  const service = container.resolve(AccessControlService);

  const result = await service.getAllGuestLogs(
    res,
    page as string,
    size as string,
    search as string,
    propertyId as string,
    startDate as string,
    endDate as string,
    status as string,
    download as string,
  );

  if (result) {
    PaginatedResponse(
      res,
      "Guest entry logs retrieved successfully",
      result.data,
      result.metadata,
    );
  }
  return;
};
