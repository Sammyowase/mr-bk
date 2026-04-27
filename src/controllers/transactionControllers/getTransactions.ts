import { Request, Response } from "express";
import PaginatedResponse from "../../utils/http/paginatedResponse";
import TransactionService from "../../services/transaction.service";
import { container } from "../../utils/handler/container";

export const getAllTransactions = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const {
    page,
    size,
    sortBy,
    order,
    search,
    propertyId,
    status,
    startDate,
    endDate,
    download,
  } = req.query;

  const service = container.resolve(TransactionService);

  const result = await service.getTransactions(
    res,
    page as string,
    size as string,
    sortBy as string,
    order as string,
    search as string,
    propertyId as string,
    startDate as string,
    endDate as string,
    download as string,
    status as string,
  );

  if (result) {
    PaginatedResponse(
      res,
      "Transactions retrieved successfully",
      result.data,
      result.metadata,
    );
  }
  return;
};
