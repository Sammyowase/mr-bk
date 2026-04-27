import { Request, Response } from "express";
import sendResponse from "../../utils/http/sendResponse";
import PaymentService from "../../services/payment.service";
import { CreatePaymentSplitDto } from "../../types/payment";
import { container } from "../../utils/handler/container";

export const addPaymentSplit = async (req: Request, res: Response) => {
  const dto: CreatePaymentSplitDto = req.body;

  const service = container.resolve(PaymentService);

  const data = await service.addPaymentSplit(req, dto);

  sendResponse(res, 200, "Payment split created successfully", data);
  return;
};
