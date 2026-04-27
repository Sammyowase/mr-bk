import AuditLogRepository from "../repository/audit.repository";
import MeterRepository from "../repository/meter.repository";
import PropertyRepository from "../repository/property.repository";
import UserRepository from "../repository/user.repository";
import { LogAuditDto, Logs } from "../types/audit";
import { SortOrder } from "../types/misc";
import {
  allowedAuditSortBy,
  auditFilter,
  auditSortBy,
  auditWhere,
} from "../utils/constants/audit";
import { BadRequestException } from "../utils/exceptions/customException";
import { MetadataType } from "../utils/http/paginatedResponse";
import { injectable } from "tsyringe";

/**
 * Service class for managing audit logs.
 *
 * Provides methods to log audit events performed by users.
 * Handles validation to ensure the user exists before logging.
 *
 * @remarks
 * This service interacts with the `AuditLogRepository` and is intended for use in backend business logic.
 */
@injectable()
class AuditLogService {
  constructor(
    private userRepo: UserRepository,
    private meterRepo: MeterRepository,
    private auditRepo: AuditLogRepository,
    private propertyRepo: PropertyRepository,
  ) {}

  /**
   * Logs an audit event for a user action.
   *
   * This method retrieves the user by the provided user ID, validates their existence,
   * and then creates an audit log entry with the specified action, model, description,
   * property ID, and any additional metadata.
   *
   * @param dto - The data transfer object containing audit log details.
   * @throws {BadRequestException} If the user with the given ID is not found.
   * @returns A promise that resolves when the audit log entry has been created.
   */
  public async logAudit(dto: LogAuditDto): Promise<void> {
    const user = await this.userRepo.findById(dto.userId);
    if (!user) {
      throw new BadRequestException("User not found");
    }

    // Add property Id if available
    if (!dto.propertyId) {
      const meter = await this.meterRepo.findMeterByOwnerId(user.id);
      dto.propertyId = meter && meter.propertyId ? meter.propertyId : undefined;
    }

    const data = {
      userId: dto.userId,
      role: user.role,
      action: dto.action,
      entity: `${dto.action}_${dto.model}`,
      description: dto.description,
      propertyId: dto.propertyId,
      metadata: dto.metadata,
    };

    await this.auditRepo.create(data);
  }

  /**
   * Retrieves a paginated, sorted, and optionally filtered list of audit logs.
   *
   * @param page - The current page number as a string (defaults to "1" if not provided or invalid).
   * @param size - The number of logs per page as a string (defaults to "10" if not provided or invalid).
   * @param sortBy - The field by which to sort the logs (defaults to "createdAt").
   * @param order - The sort order, either "asc" or "desc" (defaults to descending order).
   * @param search - An optional search string to filter logs.
   * @param propertyId - Optional property ID to filter logs.
   * @param userId - Optional user ID to filter logs.
   * @param role - Optional role to filter logs.
   * @returns A promise that resolves to an object containing the paginated logs and metadata.
   * @throws BadRequestException If the sortBy field is not allowed.
   */
  public async getAllLogs(
    page: string,
    size: string,
    sortBy: string,
    order: string,
    search: string,
    propertyId: string,
    userId: string,
    role: string,
  ): Promise<{ data: Logs[]; metadata: MetadataType }> {
    const pageNumber = parseInt(page) || 1;
    const pageSize = parseInt(size) || 10;
    const sortByField = sortBy || "createdAt";
    const sortOrder = order === "asc" ? SortOrder.ASC : SortOrder.DESC;

    if (propertyId) {
      await this.propertyRepo.findById(propertyId);
    }

    const filter = search
      ? auditFilter(search)
      : auditWhere(propertyId, userId, role);

    if (!allowedAuditSortBy.includes(sortByField)) {
      throw new BadRequestException("Invalid sort field");
    }

    const result = await this.auditRepo.getAllLogs(
      filter,
      pageNumber,
      pageSize,
      auditSortBy(sortByField, sortOrder),
    );

    return {
      data: result.logs,
      metadata: {
        total: result.total,
        page: pageNumber,
        size: pageSize,
      },
    };
  }
}

export default AuditLogService;
