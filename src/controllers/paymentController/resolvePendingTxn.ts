import { Request, Response } from "express";
import sendResponse from "../../utils/http/sendResponse";
import PaymentService from "../../services/payment.service";
import { container } from "../../utils/handler/container";

export const resolvePendingTransactions = async (
  req: Request,
  res: Response,
) => {
  const service = container.resolve(PaymentService);

  const message = await service.resolvePendingTransactions(req);

  sendResponse(res, 200, "Request completed", message);
  return;
};
