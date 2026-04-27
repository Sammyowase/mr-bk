import { Request, Response } from "express";
import sendResponse from "../../utils/http/sendResponse";
import { billService } from "../../services/bills.service";

export const checkDiscos = async (req: Request, res: Response) => {
  const result = await billService.checkDisco();

  sendResponse(res, 200, "BP discos retrieved successfully", result);
  return;
};
