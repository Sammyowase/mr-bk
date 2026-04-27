import { Request, Response } from "express";
import AccessControlService from "../../services/access-control.service";
import PaginatedResponse from "../../utils/http/paginatedResponse";
import { container } from "../../utils/handler/container";

export const getResidentAccessPoints = async (req: Request, res: Response) => {
  const { houseId } = req.params;

  const { page, size } = req.query;

  const service = container.resolve(AccessControlService);

  const result = await service.getResidentAccessPoints(
    houseId as string,
    page as string,
    size as string,
  );

  PaginatedResponse(
    res,
    "Access points retrieved successfully",
    result.data,
    result.metadata,
  );
  return;
};
