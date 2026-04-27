import { Request, Response } from "express";
import { container } from "tsyringe";
import AlertService from "../../services/alert.service";
import sendResponse from "../../utils/http/sendResponse";

export const deleteAlert = async (req: Request, res: Response) => {
  const alertId = req.params.id;

  const service = container.resolve(AlertService);

  await service.deleteAlert(alertId);

  sendResponse(res, 200, "Alert deleted successfully");
};

export default deleteAlert;
