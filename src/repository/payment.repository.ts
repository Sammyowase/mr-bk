import { Fee, PaymentSplit } from "../../prisma/generated/prisma";
import db, { Database } from "../models/database";
import {
  CreateFeeDto,
  CreatePaymentSplitDto,
  UpdateFeeDto,
} from "../types/payment";
import { injectable } from "tsyringe";

@injectable()
class PaymentRepository {
  constructor(private db: Database) {}

  public async createPaymentSplit(
    dto: CreatePaymentSplitDto,
  ): Promise<PaymentSplit> {
    return await db.paymentSplit.create({
      data: {
        ...dto,
      },
    });
  }

  public async updatePaymentSplitById(
    id: string,
    data: Partial<CreatePaymentSplitDto>,
  ): Promise<PaymentSplit> {
    return await db.paymentSplit.update({
      where: {
        id,
      },
      data,
    });
  }

  public async deletePaymentSplit(id: string): Promise<PaymentSplit> {
    return await db.paymentSplit.delete({
      where: {
        id,
      },
    });
  }

  public async findAllPaymentSplits(): Promise<PaymentSplit[]> {
    return await db.paymentSplit.findMany();
  }

  public async findById(id: string): Promise<PaymentSplit | null> {
    return await db.paymentSplit.findUnique({
      where: {
        id,
      },
    });
  }

  public async findByPropertyId(
    propertyId: string,
  ): Promise<PaymentSplit | null> {
    return await db.paymentSplit.findFirst({
      where: {
        propertyId,
      },
    });
  }

  public async getAllFees(): Promise<Fee[]> {
    return await db.fee.findMany();
  }

  public async findFeeById(id: string): Promise<Fee | null> {
    return await db.fee.findUnique({
      where: {
        id,
      },
    });
  }

  public async findFeeByType(type: string): Promise<Fee | null> {
    return await db.fee.findUnique({
      where: {
        type,
      },
    });
  }

  public async updateFee(id: string, dto: UpdateFeeDto): Promise<Fee> {
    return await db.fee.update({
      where: {
        id,
      },
      data: {
        ...dto,
      },
    });
  }

  public async createFee(dto: CreateFeeDto): Promise<Fee> {
    return await db.fee.create({
      data: {
        ...dto,
      },
    });
  }

  public async deleteFee(id: string): Promise<Fee> {
    return db.fee.delete({
      where: {
        id,
      },
    });
  }
}

export default PaymentRepository;
