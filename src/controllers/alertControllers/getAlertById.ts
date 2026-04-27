import { Request, Response } from "express";
import { container } from "tsyringe";
import AlertService from "../../services/alert.service";
import sendResponse from "../../utils/http/sendResponse";

export const getAlertById = async (req: Request, res: Response) => {
  const alertId = req.params.id;

  const service = container.resolve(AlertService);

  const alert = await service.getAlertById(alertId);

  sendResponse(res, 200, "Alert retrieved successfully", alert);
};

export default getAlertById;
