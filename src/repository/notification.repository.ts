import { Notification } from "../../prisma/generated/prisma";
import { Database } from "../models/database";
import {
  CreateNotifyDto,
  NotificationPreferenceResponse,
  NotificationPrefWithUser,
  UpdateNotifyPrefDto,
  UpdateNotifyStatus,
} from "../types/notification";
import { injectable } from "tsyringe";

@injectable()
class NotificationRepository {
  constructor(private db: Database) {}

  public async findNotificationById(id: string): Promise<Notification | null> {
    return await this.db.notification.findUnique({
      where: {
        id,
      },
    });
  }

  public async createNotification(dto: CreateNotifyDto): Promise<Notification> {
    return await this.db.notification.create({
      data: {
        ...dto,
      },
    });
  }

  public async updateNotification(
    id: string,
    dto: UpdateNotifyStatus,
  ): Promise<Notification> {
    return await this.db.notification.update({
      where: {
        id,
      },
      data: {
        ...dto,
      },
    });
  }

  public async getNotificationsByUserId(
    recipientId: string,
  ): Promise<Notification[]> {
    return await this.db.notification.findMany({
      where: {
        recipientIds: {
          has: recipientId,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  public async createNotificationPreference(
    userId: string,
  ): Promise<NotificationPrefWithUser> {
    return await this.db.notificationPreference.create({
      data: {
        userId,
      },
      include: {
        User: {
          omit: {
            password: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });
  }

  public async updateNotificationPreferenceByUserId(
    userId: string,
    dto: UpdateNotifyPrefDto,
  ): Promise<NotificationPrefWithUser> {
    return await this.db.notificationPreference.update({
      where: {
        userId,
      },
      data: {
        ...dto,
      },
      include: {
        User: {
          omit: {
            password: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });
  }

  public async getNotificationPreferenceByUserIdOrEmail(
    userId?: string,
    email?: string,
  ): Promise<NotificationPreferenceResponse> {
    return await this.db.notificationPreference.findFirst({
      where: {
        OR: [
          {
            userId,
          },
          {
            User: {
              email,
            },
          },
        ],
      },
      include: {
        User: {
          omit: {
            password: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });
  }
}

export default NotificationRepository;
