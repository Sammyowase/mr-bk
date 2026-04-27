import { Request, Response } from "express";
import { container } from "tsyringe";
import AlertService from "../../services/alert.service";
import sendResponse from "../../utils/http/sendResponse";

export const updateAlert = async (req: Request, res: Response) => {
  const alertId = req.params.id;
  const updateData = req.body;

  const service = container.resolve(AlertService);

  const alert = await service.updateAlert(alertId, updateData);

  sendResponse(res, 200, "Alert updated successfully", alert);
};

export default updateAlert;
