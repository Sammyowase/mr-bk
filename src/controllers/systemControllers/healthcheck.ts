import { container } from "tsyringe";
import { SystemService } from "../../services/system.service";
import sendResponse from "../../utils/http/sendResponse";
import { Request, Response } from "express";

export default async function healthCheck(req: Request, res: Response) {
  const healthService = container.resolve(SystemService);

  const result = await healthService.health();

  sendResponse(res, 200, result.status, result);
}
