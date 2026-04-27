import { Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import sendResponse from "../../utils/http/sendResponse";
import VendingService from "../../services/vending.service";
import { MakePaymentDto } from "../../types/vending";
import { container } from "../../utils/handler/container";

export const makePayment = async (req: JwtPayload, res: Response) => {
  const dto: MakePaymentDto = req.body;

  const userId = req.user?.id;

  const service = container.resolve(VendingService);

  const data = await service.makePayment(dto, userId);

  sendResponse(res, 200, "Payment link generated", data);
};
