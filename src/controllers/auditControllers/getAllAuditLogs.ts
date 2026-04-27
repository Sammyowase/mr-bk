import { Request, Response } from "express";
import AuditLogService from "../../services/audit.service";
import PaginatedResponse from "../../utils/http/paginatedResponse";
import { container } from "../../utils/handler/container";

export const getAllAuditLogs = async (req: Request, res: Response) => {
  const { page, size, sortBy, order, search, propertyId, userId, role } =
    req.query;

  const service = container.resolve(AuditLogService);

  const result = await service.getAllLogs(
    page as string,
    size as string,
    sortBy as string,
    order as string,
    search as string,
    propertyId as string,
    userId as string,
    role as string,
  );

  PaginatedResponse(
    res,
    "All audit logs retrieved successfully",
    result.data,
    result.metadata,
  );
  return;
};
