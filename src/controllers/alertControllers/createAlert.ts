import { Request, Response } from "express";
import { container } from "tsyringe";
import AlertService from "../../services/alert.service";
import sendResponse from "../../utils/http/sendResponse";

export const createAlert = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const alertData = req.body;

  const service = container.resolve(AlertService);

  const alert = await service.createAlert(alertData, userId);

  sendResponse(res, 201, "Alert created successfully", alert);
};

export default createAlert;
