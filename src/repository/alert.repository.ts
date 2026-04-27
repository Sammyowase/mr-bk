import { Alert } from "../../prisma/generated/prisma";
import { Database } from "../models/database";
import { CreateAlertDto, UpdateAlertDto } from "../types/alert";
import { injectable } from "tsyringe";

@injectable()
class AlertRepository {
  constructor(private db: Database) {}

  public async createAlert(
    dto: CreateAlertDto,
    createdBy: string,
  ): Promise<Alert> {
    return await this.db.alert.create({
      data: {
        ...dto,
        createdBy,
      },
    });
  }

  public async findAlertById(id: string): Promise<Alert | null> {
    return await this.db.alert.findUnique({
      where: {
        id,
      },
    });
  }

  public async updateAlert(id: string, dto: UpdateAlertDto): Promise<Alert> {
    return await this.db.alert.update({
      where: {
        id,
      },
      data: {
        ...dto,
      },
    });
  }

  public async deleteAlert(id: string): Promise<Alert> {
    return await this.db.alert.delete({
      where: {
        id,
      },
    });
  }

  public async getAlertsByAudience(
    audienceType: string,
    audienceId: string,
    limit: number = 20,
    offset: number = 0,
  ): Promise<Alert[]> {
    return await this.db.alert.findMany({
      where: {
        audienceType,
        audienceIds: {
          has: audienceId,
        },
        OR: [
          {
            expiresAt: {
              gt: new Date(),
            },
          },
          {
            expiresAt: null,
          },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: offset,
      take: limit,
    });
  }

  public async markAlertAsRead(alertId: string, userId: string): Promise<void> {
    await this.db.alertRead.upsert({
      where: {
        alertId_userId: {
          alertId,
          userId,
        },
      },
      update: {
        readAt: new Date(),
      },
      create: {
        alertId,
        userId,
        readAt: new Date(),
      },
    });
  }

  public async isAlertReadByUser(
    alertId: string,
    userId: string,
  ): Promise<boolean> {
    const read = await this.db.alertRead.findUnique({
      where: {
        alertId_userId: {
          alertId,
          userId,
        },
      },
    });
    return !!read;
  }

  public async getAlertsWithReadStatus(
    userId: string,
    limit: number = 20,
    offset: number = 0,
  ): Promise<{ alert: Alert; isRead: boolean }[]> {
    const alerts = await this.db.alert.findMany({
      where: {
        OR: [
          {
            expiresAt: {
              gt: new Date(),
            },
          },
          {
            expiresAt: null,
          },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: offset,
      take: limit,
    });

    const alertIds = alerts.map((alert) => alert.id);

    const reads = await this.db.alertRead.findMany({
      where: {
        alertId: {
          in: alertIds,
        },
        userId,
      },
    });

    const readMap = new Map<string, boolean>();
    reads.forEach((read) => {
      readMap.set(read.alertId, true);
    });

    return alerts.map((alert) => ({
      alert,
      isRead: readMap.has(alert.id),
    }));
  }
}

export default AlertRepository;
