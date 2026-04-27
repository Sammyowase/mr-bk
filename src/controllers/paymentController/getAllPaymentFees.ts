import { Request, Response } from "express";
import sendResponse from "../../utils/http/sendResponse";
import PaymentService from "../../services/payment.service";
import { container } from "../../utils/handler/container";

export const getAllPaymentFees = async (req: Request, res: Response) => {
  const service = container.resolve(PaymentService);

  const result = await service.getAllFees();

  sendResponse(res, 200, "All payment fees retrieved successfully", result);
  return;
};
