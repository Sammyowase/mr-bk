import { Transaction } from "../../prisma/generated/prisma";
import { Database } from "../models/database";
import {
  ResidentTransactionFilter,
  ResidentTransactionWhere,
} from "../types/property";
import {
  AllTransactionsFilter,
  CreateTransactionDto,
  TransactionExport,
  TransactionFilter,
} from "../types/transaction";
import { injectable } from "tsyringe";

@injectable()
class TransactionRepository {
  constructor(private db: Database) {}

  public async createTransaction(
    data: CreateTransactionDto,
  ): Promise<Transaction> {
    return await this.db.transaction.create({
      data,
    });
  }

  public async findTransactionById(id: string): Promise<Transaction | null> {
    return await this.db.transaction.findFirst({
      where: {
        id,
      },
    });
  }

  public async updateById(
    id: string,
    data: Partial<Transaction>,
  ): Promise<Transaction> {
    return await this.db.transaction.update({
      where: {
        id,
      },
      data,
    });
  }

  public async findTransactionByTrxnRef(
    trxnRef: string,
  ): Promise<Transaction | null> {
    return await this.db.transaction.findFirst({
      where: {
        trxnRef,
      },
    });
  }

  public async findTransactionByUserIdAndTrxnRef(
    userId: string,
    trxnRef: string,
  ): Promise<Transaction | null> {
    return await this.db.transaction.findFirst({
      where: {
        userId,
        trxnRef,
      },
    });
  }

  public async findTransactionsByUserId(
    userId: string,
  ): Promise<Transaction[]> {
    return await this.db.transaction.findMany({
      where: {
        userId,
      },
    });
  }

  public async findTransactionsByMeterNumber(
    meterNumber: string,
  ): Promise<Transaction[]> {
    return await this.db.transaction.findMany({
      where: {
        meterNumber,
      },
    });
  }

  public async findTransactionsByPropertyId(
    propertyId: string,
  ): Promise<Transaction[]> {
    return await this.db.transaction.findMany({
      where: {
        propertyId,
      },
    });
  }

  public async findTransactionsByHouseId(
    houseId: string,
  ): Promise<Transaction[]> {
    return await this.db.transaction.findMany({
      where: {
        houseId,
      },
    });
  }

  public async getPendingTransactions(): Promise<Transaction[]> {
    return await this.db.transaction.findMany({
      where: {
        status: "pending",
        createdAt: {
          lte: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago}
        },
      },
    });
  }

  public async getResidentsTransactions(
    filter: ResidentTransactionFilter | ResidentTransactionWhere,
    page: number,
    size: number,
    sortBy: string,
    order: string,
  ): Promise<{ txns: Transaction[]; total: number }> {
    const txns = await this.db.transaction.findMany({
      take: size,
      skip: (page - 1) * size,
      orderBy: {
        [sortBy]: order,
      },
      where: filter,
    });
    const total = await this.db.transaction.count({
      where: filter,
    });

    return {
      txns,
      total,
    };
  }

  public async getTotalTurnover(): Promise<number> {
    const total = await this.db.transaction.aggregate({
      where: {
        status: "success",
      },
      _sum: {
        amount: true,
      },
    });
    return total._sum.amount || 0;
  }

  public async getTotalTurnoverThisMonth(): Promise<number> {
    const now = new Date();
    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
      0,
      0,
      0,
    );

    const total = await this.db.transaction.aggregate({
      where: {
        status: "success",
        createdAt: {
          gte: startOfMonth,
        },
      },
      _sum: {
        amount: true,
      },
    });

    return total._sum.amount || 0;
  }

  public async getTotalTurnoverThisWeek(startOfWeek: Date): Promise<number> {
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);
    endOfWeek.setHours(0, 0, 0, 0);

    const total = await this.db.transaction.aggregate({
      where: {
        AND: [
          {
            status: "success",
          },
          {
            createdAt: {
              gte: startOfWeek,
            },
          },
          {
            createdAt: {
              lte: endOfWeek,
            },
          },
        ],
      },
      _sum: {
        amount: true,
      },
    });

    return total._sum.amount || 0;
  }

  public async getTotalTurnoverEachDayThisWeek(startOfWeek: Date) {
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);
    endOfWeek.setHours(0, 0, 0, 0);

    return await this.db.transaction.groupBy({
      by: ["createdAt"],
      where: {
        AND: [
          {
            status: "success",
          },
          {
            createdAt: {
              gte: startOfWeek,
            },
          },
          {
            createdAt: {
              lte: endOfWeek,
            },
          },
        ],
      },
      _sum: {
        amount: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  }

  public async getTotalTransactions(
    filter?: TransactionFilter,
  ): Promise<number> {
    return await this.db.transaction.count({
      where: filter,
    });
  }

  public async getTransactions(
    filter: AllTransactionsFilter,
    page: number,
    size: number,
    sortBy: string,
    order: string,
  ): Promise<{ txns: Transaction[]; total: number }> {
    const txns = await this.db.transaction.findMany({
      take: size,
      skip: (page - 1) * size,
      orderBy: {
        [sortBy]: order,
      },
      where: filter,
    });
    const total = await this.db.transaction.count({
      where: filter,
    });

    return {
      txns,
      total,
    };
  }

  public async getTransactionsExport(
    filter: AllTransactionsFilter,
  ): Promise<TransactionExport[]> {
    return await this.db.transaction.findMany({
      where: filter,
      include: {
        House: true,
        Property: true,
        User: true,
      },
    });
  }
}

export default TransactionRepository;
