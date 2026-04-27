import { Request, Response } from "express";
import sendResponse from "../../utils/http/sendResponse";
import TransactionService from "../../services/transaction.service";
import { container } from "../../utils/handler/container";

export const getTransactions = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  const service = container.resolve(TransactionService);

  const transactions = await service.getTransactionsByUserId(userId);

  sendResponse(res, 200, "Transactions fetched successfully", transactions);
  return;
};

export default getTransactions;
