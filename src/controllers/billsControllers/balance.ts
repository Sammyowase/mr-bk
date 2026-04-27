import { Request, Response } from "express";
import sendResponse from "../../utils/http/sendResponse";
import { billService } from "../../services/bills.service";

export const getBPBalance = async (req: Request, res: Response) => {
  const result = await billService.balance();

  sendResponse(res, 200, "BP balance retrieved successfully", result);
  return;
};
