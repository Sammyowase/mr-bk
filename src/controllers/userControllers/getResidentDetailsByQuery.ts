import { Request, Response } from "express";
import sendResponse from "../../utils/http/sendResponse";
import { HttpStatusCode } from "axios";
import UserService from "../../services/user.service";
import { container } from "../../utils/handler/container";
import { BadRequestException } from "../../utils/exceptions/customException";

export const getResidentDetailsByQuery = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { residentId } = req.query;

  if (!residentId || typeof residentId !== "string") {
    throw new BadRequestException(
      "Resident ID is required as a query parameter",
    );
  }

  const service = container.resolve(UserService);
  const result = await service.getResidentDetails(residentId);

  sendResponse(
    res,
    HttpStatusCode.Ok,
    "Resident details retrieved successfully",
    result,
  );

  return;
};
