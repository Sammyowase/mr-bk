import { Request, Response } from "express";
import sendResponse from "../../utils/http/sendResponse";
import PaymentService from "../../services/payment.service";
import { CreatePaymentSplitDto } from "../../types/payment";
import { container } from "tsyringe";

export const updatePaymentSplit = async (req: Request, res: Response) => {
  const { id } = req.params;
  const dto: Partial<CreatePaymentSplitDto> = req.body;

  const service = container.resolve(PaymentService);

  const data = await service.updatePaymentSplit(req, id, dto);

  sendResponse(res, 200, "Payment split updated successfully", data);
  return;
};
