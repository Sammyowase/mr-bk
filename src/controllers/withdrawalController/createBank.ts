import { Request, Response } from "express";
import sendResponse from "../../utils/http/sendResponse";
import { WithdrawalBankDto } from "../../types/withdrawal";
import WithdrawalService from "../../services/withdrawal.service";
import { container } from "../../utils/handler/container";

export const saveWithdrawalBank = async (req: Request, res: Response) => {
  const dto: WithdrawalBankDto = req.body;
  const ownerId = req.user?.id;

  const service = container.resolve(WithdrawalService);

  const newBank = await service.createWithdrawalBank(req, dto, ownerId);

  sendResponse(
    res,
    200,
    "Bank withdrawal details saved successfully.",
    newBank,
  );
  return;
};
