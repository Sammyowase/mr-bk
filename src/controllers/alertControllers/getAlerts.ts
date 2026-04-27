import { Request, Response } from "express";
import { container } from "tsyringe";
import AlertService from "../../services/alert.service";
import sendResponse from "../../utils/http/sendResponse";

export const getAlerts = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
  const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;

  const service = container.resolve(AlertService);

  const alerts = await service.getAlertsForUser(userId, limit, offset);

  sendResponse(res, 200, "Alerts retrieved successfully", alerts);
};

export default getAlerts;
