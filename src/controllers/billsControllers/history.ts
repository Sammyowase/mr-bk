import { Request, Response } from "express";
import sendResponse from "../../utils/http/sendResponse";
import { billService } from "../../services/bills.service";

export const getBPTxnHistory = async (req: Request, res: Response) => {
  const { size, start, end } = req.query;

  const result = await billService.history(
    size as string,
    start as string,
    end as string
  );

  sendResponse(res, 200, "BP transaction history retrieved successfully", result);
  return;
};
