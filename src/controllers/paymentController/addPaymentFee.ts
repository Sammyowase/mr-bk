import { Request, Response } from "express";
import sendResponse from "../../utils/http/sendResponse";
import PaymentService from "../../services/payment.service";
import { CreateFeeDto } from "../../types/payment";
import { container } from "../../utils/handler/container";

export const addPaymentFee = async (req: Request, res: Response) => {
  const dto: CreateFeeDto = req.body;

  const service = container.resolve(PaymentService);

  const data = await service.createFee(req, dto);

  sendResponse(res, 200, "Payment fee created successfully", data);
  return;
};
