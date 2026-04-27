import { WithdrawalBank } from "../../prisma/generated/prisma";
import { Database } from "../models/database";
import { WithdrawalBankDto } from "../types/withdrawal";
import { injectable } from "tsyringe";

@injectable()
class WithdrawalBankRepository {
  constructor(private db: Database) {}

  public async createWithdrawalBank(
    dto: WithdrawalBankDto,
    ownerId: string,
  ): Promise<WithdrawalBank> {
    return await this.db.withdrawalBank.create({
      data: {
        ...dto,
        ownerId,
      },
    });
  }
  public async findByNameAndNumber(
    bank_name: string,
    account_number: string,
  ): Promise<WithdrawalBank | null> {
    return await this.db.withdrawalBank.findFirst({
      where: {
        bank_name,
        account_number,
      },
    });
  }

  public async findAllByOwnerId(ownerId: string): Promise<WithdrawalBank[]> {
    return await this.db.withdrawalBank.findMany({
      where: {
        ownerId,
      },
    });
  }
}

export default WithdrawalBankRepository;
