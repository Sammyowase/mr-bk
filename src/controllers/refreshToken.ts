import { Request, Response } from "express";
import sendResponse from "../utils/http/sendResponse";
import AuthService from "../services/auth.service";
import { RefreshTokenDto } from "../types/auth";
import { container } from "../utils/handler/container";

const refreshToken = async (req: Request, res: Response) => {
  const dto: RefreshTokenDto = req.body;

  const service = container.resolve(AuthService);

  const data = await service.refreshToken(dto);

  sendResponse(res, 200, "Token refreshed successfully", data);
  return;
};

export default refreshToken;
