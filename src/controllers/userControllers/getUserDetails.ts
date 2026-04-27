import { Request, Response } from "express";
import sendResponse from "../../utils/http/sendResponse";
import { HttpStatusCode } from "axios";
import UserService from "../../services/user.service";
import { container } from "../../utils/handler/container";

export const getUserDetails = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { id } = req.params;

  const service = container.resolve(UserService);

  const result = await service.getUserDetails(id);

  sendResponse(
    res,
    HttpStatusCode.Ok,
    "User details retrieved successfully",
    result,
  );

  return;
};
