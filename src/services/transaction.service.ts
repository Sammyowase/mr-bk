import { Response } from "express";
import { Transaction } from "../../prisma/generated/prisma";
import PropertyRepository from "../repository/property.repository";
import TransactionRepository from "../repository/transaction.repository";
import {
  residentTransactionFilter,
  residentTransactionWhere,
} from "../utils/constants/property";
import {
  allowedTransactionSortBy,
  transactionExportCol,
  transactionsFilter,
} from "../utils/constants/transaction";
import {
  BadRequestException,
  NotFoundException,
} from "../utils/exceptions/customException";
import { MetadataType } from "../utils/http/paginatedResponse";
import SpreadSheet from "./spreadsheet.service";
import { exportExcel } from "../utils/helper/exportExcel";
import { TransactionExport } from "../types/transaction";
import { FormatAmount } from "../utils/helper/formatString";
import { injectable } from "tsyringe";

/**
 * Service class for handling operations related to transactions.
 *
 * Provides methods to retrieve transaction records based on different criteria,
 * such as user ID, meter number, or property ID.
 *
 * @remarks
 * All methods return a promise that resolves to an array of transaction records.
 */
@injectable()
class TransactionService {
  constructor(
    private transactionRepo: TransactionRepository,
    private propertyRepo: PropertyRepository,
  ) {}
  /**
   * Retrieves all transactions associated with a specific user ID.
   *
   * @param userId - The ID of the user whose transactions are to be retrieved.
   * @returns A promise that resolves to an array of transaction records.
   */
  public async getTransactionsByUserId(userId: string) {
    return this.transactionRepo.findTransactionsByUserId(userId);
  }

  /**
   * Retrieves all transactions associated with a specific meter number.
   *
   * @param meterNumber - The number of the meter whose transactions are to be retrieved.
   * @returns A promise that resolves to an array of transaction records.
   */
  public async getTransactionsByMeter(meterNumber: string) {
    return this.transactionRepo.findTransactionsByMeterNumber(meterNumber);
  }

  /**
   * Retrieves all transactions associated with a specific property ID.
   *
   * @param propertyId - The ID of the property whose transactions are to be retrieved.
   * @returns A promise that resolves to an array of transaction records.
   */
  public async getTransactionsByPropertyId(propertyId: string) {
    return this.transactionRepo.findTransactionsByPropertyId(propertyId);
  }

  /**
   * Retrieves all transactions associated with a specific house ID.
   *
   * @param houseId - The ID of the house whose transactions are to be retrieved.
   * @returns A promise that resolves to an array of transaction records.
   */
  public async getTransactionsByHouseId(houseId: string) {
    return this.transactionRepo.findTransactionsByHouseId(houseId);
  }

  /**
   * Retrieves a single transaction record from the database by its transaction reference.
   *
   * @param trxnRef - The unique transaction reference string to search for.
   * @returns A promise that resolves to the transaction object if found, or null otherwise.
   */
  public async getTransactionByTrxnRef(trxnRef: string) {
    return this.transactionRepo.findTransactionByTrxnRef(trxnRef);
  }

  /**
   * Retrieves a paginated list of transactions for residents of a specific property.
   *
   * @param propertyId - The unique identifier of the property.
   * @param page - The page number for pagination (as a string).
   * @param size - The number of items per page (as a string).
   * @param sortBy - The field by which to sort the transactions.
   * @param order - The sort order, either "asc" for ascending or "desc" for descending.
   * @param search - A search query to filter transactions.
   * @returns An object containing the array of transactions and pagination metadata.
   * @throws NotFoundException If the property is not found.
   * @throws BadRequestException If the sort field, page number, or page size is invalid.
   */
  public async getResidentsTransactions(
    propertyId: string,
    page: string,
    size: string,
    sortBy: string,
    order: string,
    search: string,
  ): Promise<{ data: Transaction[]; metadata: MetadataType }> {
    const property = await this.propertyRepo.findById(propertyId);
    if (!property) {
      throw new NotFoundException("Property not found");
    }

    const pageNumber = parseInt(page) || 1;
    const pageSize = parseInt(size) || 10;
    const sortByField = sortBy || "updatedAt";
    const sortOrder = order === "asc" ? "asc" : "desc";

    const filter = search
      ? residentTransactionFilter(propertyId, search)
      : residentTransactionWhere(propertyId);

    if (!allowedTransactionSortBy.includes(sortByField)) {
      throw new BadRequestException("Invalid sort field");
    }

    if (pageNumber < 1) {
      throw new BadRequestException("Page number must be greater than 0");
    }

    if (pageSize < 1) {
      throw new BadRequestException("Page size must be greater than 0");
    }

    const data = await this.transactionRepo.getResidentsTransactions(
      filter,
      pageNumber,
      pageSize,
      sortByField,
      sortOrder,
    );

    return {
      data: data.txns,
      metadata: {
        total: data.total,
        page: pageNumber,
        size: pageSize,
      },
    };
  }

  /**
   * Retrieves a paginated list of transactions with optional sorting, search filtering, and date range filtering.
   *
   * @param res - Express response object (used for file download).
   * @param page - The current page number as a string (defaults to 1 if not provided or invalid).
   * @param size - The number of transactions per page as a string (defaults to 10 if not provided or invalid).
   * @param sortBy - The field to sort the transactions by (defaults to "createdAt").
   * @param order - The sort order, either "asc" for ascending or "desc" for descending (defaults to "desc").
   * @param search - An optional search string to filter transactions.
   * @param propertyId - The property ID to filter transactions.
   * @param startDate - An optional start date (ISO string) to filter transactions from this date.
   * @param endDate - An optional end date (ISO string) to filter transactions up to this date.
   * @param download - If specified, triggers export of transactions to Excel.
   * @returns A promise that resolves to an object containing the paginated transaction data and metadata.
   * @throws BadRequestException if the sortBy field, page, or size is not allowed.
   */
  public async getTransactions(
    res: Response,
    page: string,
    size: string,
    sortBy: string,
    order: string,
    search: string,
    propertyId: string,
    startDate: string,
    endDate: string,
    download: string,
    status: string,
  ): Promise<{ data: Transaction[]; metadata: MetadataType } | void> {
    const pageNumber = parseInt(page) || 1;
    const pageSize = parseInt(size) || 10;
    const sortByField = sortBy || "createdAt";
    const sortOrder = order === "asc" ? "asc" : "desc";

    const filter = transactionsFilter(
      propertyId,
      search,
      startDate,
      endDate,
      status,
    );

    if (!allowedTransactionSortBy.includes(sortByField)) {
      throw new BadRequestException("Invalid sort field");
    }

    // If Download specified
    if (download) {
      const sheetname = "Transactions";
      const filename = `transactions`;

      const sp = new SpreadSheet(`${sheetname} List`);

      // Retrieve the data
      const txns = await this.transactionRepo.getTransactionsExport(filter);

      if (txns.length) {
        // Prepare the data
        const data = txns.map((txn: TransactionExport) => {
          return {
            facility: txn.Property?.name,
            unit: txn.House?.name,
            email: txn.User.email,
            meter: txn.meterNumber,
            amount: FormatAmount(txn.amount, true),
            units: txn.units,
            reference: txn.trxnRef,
            status: txn.status,
            remark: txn.remark,
            created: new Date(txn.createdAt).toLocaleString(),
            completed: new Date(txn.updatedAt).toLocaleString(),
          };
        });

        // Write to a file
        const filePath = await sp.writeExcel(
          filename,
          sheetname,
          transactionExportCol,
          data,
        );

        // Export the file
        return exportExcel(res, filename, filePath);
      }
    }

    const data = await this.transactionRepo.getTransactions(
      filter,
      pageNumber,
      pageSize,
      sortByField,
      sortOrder,
    );

    return {
      data: data.txns,
      metadata: {
        total: data.total,
        page: pageNumber,
        size: pageSize,
      },
    };
  }
}

export default TransactionService;
