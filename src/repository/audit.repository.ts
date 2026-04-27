import { Database } from "../models/database";
import {
  AllLogs,
  AllLogsFilter,
  AllLogsWhere,
  AuditSortByOptions,
  CreateAuditDto,
} from "../types/audit";
import { injectable } from "tsyringe";

@injectable()
class AuditLogRepository {
  constructor(private db: Database) {}

  public async create(dto: CreateAuditDto): Promise<void> {
    await this.db.auditLog.create({
      data: { ...dto },
    });
  }

  public async getAllLogs(
    filter: AllLogsFilter | AllLogsWhere,
    page: number,
    size: number,
    orderBy: AuditSortByOptions,
  ): Promise<AllLogs> {
    // Find all logs
    const logs = await this.db.auditLog.findMany({
      take: size,
      skip: (page - 1) * size,
      orderBy,
      where: filter,
      include: {
        ActionBy: {
          omit: {
            password: true,
          },
        },
        RelatedProperty: true,
      },
    });

    // Count the total number of logs based on filter
    const total = await this.db.auditLog.count({
      where: filter,
    });

    return {
      logs,
      total,
    };
  }
}

export default AuditLogRepository;
