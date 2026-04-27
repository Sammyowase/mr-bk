import { Request, Response } from "express";
import sendResponse from "../../utils/http/sendResponse";
import { HttpStatusCode } from "axios";
import UserService from "../../services/user.service";
import { container } from "../../utils/handler/container";

export const getResidentDetails = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { userId } = req.params;

  const service = container.resolve(UserService);

  const result = await service.getResidentDetails(userId);

  // Audit logging for resident details access has been removed to prevent database growth
  // This was previously logging every access to resident details

  sendResponse(
    res,
    HttpStatusCode.Ok,
    "Resident details retrieved successfully",
    result,
  );

  return;
};
