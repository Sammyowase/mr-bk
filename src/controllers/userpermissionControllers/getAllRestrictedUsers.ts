import { Request, Response } from "express";
import PaginatedResponse from "../../utils/http/paginatedResponse";
import { UserPermissionService } from "../../services/userpermission.service";
import { container } from "tsyringe";

export const getAllRestrictedUsers = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const {
    page,
    size,
    sortBy,
    order,
    search,
    restrictionId,
    userId,
    propertyId,
  } = req.query;

  const service = container.resolve(UserPermissionService);

  const paginatedResult = await service.getAllRestrictedUsers(
    page as string,
    size as string,
    sortBy as string,
    order as string,
    search as string,
    restrictionId as string,
    userId as string,
    propertyId as string,
  );

  PaginatedResponse(
    res,
    "All restricted users retrieved successfully",
    paginatedResult.data,
    paginatedResult.metadata,
  );

  return;
};
