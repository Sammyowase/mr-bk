import { Request, Response } from "express";
import sendResponse from "../../utils/http/sendResponse";
import UserService from "../../services/user.service";
import { InviteUserDto } from "../../types/auth";
import { container } from "../../utils/handler/container";

export const inviteUser = async (req: Request, res: Response) => {
  const dto: InviteUserDto = req.body;

  const service = container.resolve(UserService);

  await service.inviteUser(dto);

  sendResponse(res, 200, "Invitation link sent successfully", dto);
};
