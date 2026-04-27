import { Request, Response } from "express";
import sendResponse from "../../utils/http/sendResponse";
import WithdrawalService from "../../services/withdrawal.service";
import { container } from "../../utils/handler/container";

export const getAllSavedBanks = async (req: Request, res: Response) => {
  const ownerId = req.user?.id;

  const service = container.resolve(WithdrawalService);

  const banks = await service.getWithdrawalBanks(ownerId);

  sendResponse(
    res,
    200,
    "Saved withdrawal banks retrieved successfully",
    banks,
  );
  return;
};
