import { Request, Response } from "express";
import sendResponse from "../../utils/http/sendResponse";
import PaymentService from "../../services/payment.service";
import { UpdateFeeDto } from "../../types/payment";
import { container } from "../../utils/handler/container";

export const updatePaymentFee = async (req: Request, res: Response) => {
  const { id } = req.params;
  const dto: UpdateFeeDto = req.body;

  const service = container.resolve(PaymentService);

  const data = await service.updateFee(req, id, dto);

  sendResponse(res, 200, "Payment fee updated successfully", data);
  return;
};
