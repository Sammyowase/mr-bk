import { Request, Response } from "express";
import UserService from "../../services/user.service";
import PaginatedResponse from "../../utils/http/paginatedResponse";
import { container } from "../../utils/handler/container";

export const getAllUsers = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const {
    page,
    size,
    sortBy,
    order,
    search,
    startDate,
    endDate,
    role,
    download,
  } = req.query;

  const service = container.resolve(UserService);

  const result = await service.getAllUsers(
    res,
    page as string,
    size as string,
    sortBy as string,
    order as string,
    search as string,
    startDate as string,
    endDate as string,
    role as string,
    download as string,
  );

  // If download was triggered, the response is already handled by the service
  if (download === "true") {
    return;
  }

  // TypeScript knows result is not void here since download !== "true"
  if (result) {
    PaginatedResponse(
      res,
      "All users retrieved successfully",
      result.data,
      result.metadata,
    );
  }

  return;
};
