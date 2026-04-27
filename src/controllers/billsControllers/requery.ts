import { Request, Response } from "express";
import sendResponse from "../../utils/http/sendResponse";
import { billService } from "../../services/bills.service";


export const requeryBPTransaction = async (
  req: Request,
  res: Response
) => {
  const { orderId } = req.params;

  const result = await billService.requery(orderId);

  sendResponse(res, 200, "BP transaction requery successfully", result);

  return;
};
