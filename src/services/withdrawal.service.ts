import { Request } from "express";
import WithdrawalBankRepository from "../repository/withdrawal.repository";
import { WithdrawalBankDto } from "../types/withdrawal";
import { ConflictException } from "../utils/exceptions/customException";
import AuditLogService from "./audit.service";
import { injectable } from "tsyringe";

/**
 * Service class for managing withdrawal bank accounts.
 *
 * Provides methods to create and retrieve withdrawal bank accounts
 * associated with a specific owner.
 *
 * @remarks
 * - Ensures that duplicate withdrawal bank accounts (by bank name and account number) cannot be created.
 * - Supports retrieval of all withdrawal banks for a given owner, ordered by creation date.
 */
@injectable()
class WithdrawalService {
  constructor(
    private auditService: AuditLogService,
    private repo: WithdrawalBankRepository,
  ) {}

  /**
   * Creates a new withdrawal bank account.
   *
   * @param dto - The data transfer object containing withdrawal bank details.
   * @param ownerId - The ID of the owner creating the bank account.
   * @returns The newly created withdrawal bank account.
   * @throws ConflictException if a bank with the same name and account number already exists.
   */
  public async createWithdrawalBank(
    req: Request,
    dto: WithdrawalBankDto,
    ownerId: string,
  ) {
    const bankExist = await this.repo.findByNameAndNumber(
      dto.bank_name,
      dto.account_number,
    );

    if (bankExist) {
      throw new ConflictException("Withdrawal bank already exists");
    }

    const bank = await this.repo.createWithdrawalBank(dto, ownerId);
    if (req.user) {
      // Log withdrawal bank creation
      await this.auditService.logAudit({
        action: "create",
        model: "bank",
        userId: req.user.id,
        description: `New withdrawal bank added`,
        metadata: {
          ...dto,
        },
      });
    }

    return bank;
  }

  /**
   * Retrieves all withdrawal banks for a given owner.
   *
   * @param ownerId - The ID of the owner whose withdrawal banks are to be retrieved.
   * @returns An array of withdrawal bank accounts associated with the owner.
   */
  public async getWithdrawalBanks(ownerId: string) {
    return this.repo.findAllByOwnerId(ownerId);
  }
}

export default WithdrawalService;
