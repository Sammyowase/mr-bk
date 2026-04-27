import { Request, Response } from "express";
import PaginatedResponse from "../../utils/http/paginatedResponse";
import TransactionService from "../../services/transaction.service";
import { container } from "../../utils/handler/container";

export const getPropertyResidentsTxns = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { propertyId } = req.params;

  const { page, size, sortBy, order, search } = req.query;

  const service = container.resolve(TransactionService);

  const result = await service.getResidentsTransactions(
    propertyId,
    page as string,
    size as string,
    sortBy as string,
    order as string,
    search as string,
  );

  PaginatedResponse(
    res,
    "Property residents transactions retrieved successfully",
    result.data,
    result.metadata,
  );
  return;
};
