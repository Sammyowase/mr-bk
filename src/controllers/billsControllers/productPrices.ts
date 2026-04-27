import { Request, Response } from "express";
import sendResponse from "../../utils/http/sendResponse";
import { billService } from "../../services/bills.service";

export const getProductPriceList = async (req: Request, res: Response) => {
  const { vertical, provider } = req.query;

  const result = await billService.productPrices(
    vertical as string,
    provider as string
  );

  sendResponse(res, 200, "Product prices retrieved successfully", result);

  return;
};
