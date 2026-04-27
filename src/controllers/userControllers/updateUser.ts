import { Request, Response } from "express";
import sendResponse from "../../utils/http/sendResponse";
import { CreateUserDto } from "../../types/user";
import UserService from "../../services/user.service";
import { container } from "../../utils/handler/container";

export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const dto: Partial<CreateUserDto> = req.body;

  const service = container.resolve(UserService);

  const user = await service.updateUser(req, id, dto);

  sendResponse(res, 200, "User details updated successfully", user);
};
