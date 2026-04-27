import { Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import sendResponse from "../../utils/http/sendResponse";
import VendingService from "../../services/vending.service";
import { BuyTokenDto } from "../../types/vending";
import { container } from "../../utils/handler/container";

export const buyToken = async (req: JwtPayload, res: Response) => {
  const dto: BuyTokenDto = req.body;
  const userId = req.user?.id;

  const service = container.resolve(VendingService);

  const data = await service.buyToken(dto.trxnRef, userId);

  sendResponse(res, 200, "Transaction already completed", data);
};
