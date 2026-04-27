import { Request, Response } from "express";
import sendResponse from "../../utils/http/sendResponse";
import UserService from "../../services/user.service";
import { container } from "../../utils/handler/container";

export const restoreUserAccount = async (req: Request, res: Response) => {
  const { id } = req.params;

  const service = container.resolve(UserService);

  const user = await service.restoreUser(req, id);

  sendResponse(res, 200, "User account restored successfully", user);
};
