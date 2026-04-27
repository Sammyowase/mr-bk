import {
  Notification,
  NotificationStatus,
  NotificationType,
} from "../../prisma/generated/prisma";
import NotificationRepository from "../repository/notification.repository";
import UserRepository from "../repository/user.repository";
import {
  CreateNotifyDto,
  InAppNotificationData,
  NotificationPrefWithUser,
  UpdateNotifyPrefDto,
  UpdateNotifyStatus,
  WorkerInputData,
} from "../types/notification";
import {
  BadRequestException,
  NotFoundException,
} from "../utils/exceptions/customException";
import { logger } from "../utils/logger/logger";
import { EmailService } from "./email.service";
import { BaseQueueService } from "./base-queue.service";
import { sendSms } from "../utils/service/smsSetup";
import { Job, Worker } from "bullmq";
import { BroadcastService } from "./ws-broadcast.service";
import { container, injectable } from "tsyringe";
import { TemplateData } from "../types/email";

@injectable()
class NotificationService {
  // Static properties to track worker initialization
  private static workersInitialized = false;
  public static pushNotifyWorker: Worker;
  public static smsNotifyWorker: Worker;

  // Queue instances (still instance properties as they're lightweight)
  pushNotificationQueue =
    this.baseQueueService.createQueue("push_notification");
  smsNotificationQueue = this.baseQueueService.createQueue("sms_notification");

  constructor(
    private emailService: EmailService,
    private baseQueueService: BaseQueueService,
    private broadcastService: BroadcastService,
    private notifyRepo: NotificationRepository,
    private userRepo: UserRepository,
  ) {
    // Initialize workers only once across all instances
    if (!NotificationService.workersInitialized) {
      this.initializeWorkers();
      NotificationService.workersInitialized = true;
      logger.info("Notification workers initialized");
    }
  }

  /**
   * Initialize workers only once for all instances of NotificationService
   */
  private initializeWorkers(): void {
    // Push notification worker
    NotificationService.pushNotifyWorker = this.baseQueueService.createWorker(
      "push_notification",
      async (job) => {
        try {
          logger.info(`Processing push notification job: ${job.id}`, {
            jobName: job.name,
            jobId: job.id,
          });

          const { data, user } = job.data;
          logger.debug(`Push notification data:`, {
            notificationId: data.id,
            title: data.title,
            userId: user.id,
          });

          // Update notification status to sent
          if (data.id) {
            // We need to get a fresh instance to update the notification
            const notificationService = container.resolve(NotificationService);
            await notificationService.updateNotification(data.id, {
              status: "sent",
            });
          }
        } catch (error: Error | unknown) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          logger.error(`Push notification processing error: ${errorMessage}`, {
            jobId: job.id,
            error,
          });

          // Re-throw to let BullMQ handle the retry logic
          throw error;
        }
      },
      {
        concurrency: 5,
        removeOnComplete: {
          count: 500,
        },
        removeOnFail: {
          count: 1000,
        },
      },
    );

    // SMS notification worker
    NotificationService.smsNotifyWorker = this.baseQueueService.createWorker(
      "sms_notification",
      this.sendSmsNotify.bind(this), // Bind to ensure 'this' context is preserved
      {
        concurrency: 5,
        removeOnComplete: {
          count: 500,
        },
        removeOnFail: {
          count: 1000,
        },
      },
    );
  }

  public async sendDirectEmail(
    name: string,
    email: string,
    data?: TemplateData,
    delay?: number,
  ) {
    await this.emailService.sendEmail(name, email, data, delay);
  }

  public async notify(dto: CreateNotifyDto): Promise<Notification> {
    // Get notification preference
    const usersPreference: NotificationPrefWithUser[] = [];
    for (const userId of dto.recipientIds) {
      const pref = await this.getNotificationPreference(userId);
      usersPreference.push(pref);
    }

    // Create notification
    const notification = await this.notifyRepo.createNotification(dto);
    if (!notification) {
      throw new BadRequestException("Unable to create notification");
    }

    // Send InApp notification
    if (dto.type.includes(NotificationType.inapp)) {
      const channel = dto.data?.channel;

      const data: InAppNotificationData = {
        title: dto.title,
        message: dto.message,
        date: new Date(),
        id: notification.id,
      };

      this.broadcastService.notify([data], channel);

      await this.notifyRepo.updateNotification(notification.id, {
        status: NotificationStatus.sent,
      });
    }

    // Add notification to related queue for processing
    usersPreference.forEach(async (preference: NotificationPrefWithUser) => {
      await this.addNotificationToQueue(preference, dto, notification);
    });

    return notification;
  }

  public async createNotifyPreference(
    userId: string,
  ): Promise<NotificationPrefWithUser> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new BadRequestException("Invalid userId provided");
    }

    const result = await this.notifyRepo.createNotificationPreference(user.id);

    return result;
  }

  public async updateNotification(
    id: string,
    dto: UpdateNotifyStatus,
    userId?: string,
  ): Promise<Notification> {
    const notification = await this.notifyRepo.findNotificationById(id);

    if (!notification) {
      throw new NotFoundException("Notification not found");
    }

    const data = {
      readAt: dto.readAt,
      status: dto.status,
      readBy:
        userId && !notification.readBy.includes(userId)
          ? [...notification.readBy, userId]
          : notification.readBy,
    };

    const result = await this.notifyRepo.updateNotification(id, data);

    return result;
  }

  public async updateNotifyPreference(
    userId: string,
    dto: UpdateNotifyPrefDto,
  ): Promise<NotificationPrefWithUser> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new BadRequestException("Invalid userID provided");
    }

    if (dto.email === false || dto.email) {
      throw new BadRequestException("Unable to toggle email notification");
    }

    const result = await this.notifyRepo.updateNotificationPreferenceByUserId(
      userId,
      dto,
    );

    return result;
  }

  public async getNotificationsByUserId(
    userId: string,
  ): Promise<Notification[]> {
    const user = await this.userRepo.findById(userId);

    if (!user) {
      throw new BadRequestException("Invalid userId provided");
    }

    const result = await this.notifyRepo.getNotificationsByUserId(userId);

    return result;
  }

  public async getNotificationPreference(
    userId?: string,
    email?: string,
  ): Promise<NotificationPrefWithUser> {
    const preferences =
      await this.notifyRepo.getNotificationPreferenceByUserIdOrEmail(
        userId,
        email,
      );
    if (!preferences) {
      throw new BadRequestException("Unable to get notification preferences");
    }

    return preferences;
  }

  public async sendSmsNotify(job: Job<WorkerInputData>) {
    try {
      const { data, user } = job.data;

      if (!user.phone) {
        logger.warn(
          `SMS notification failed: No phone number for user ${user.id}`,
        );
        await this.updateNotification(data.id, { status: "failed" });
        return null;
      }

      const result = await sendSms(data.message, user.phone);

      if (result) {
        await this.updateNotification(data.id, { status: "sent" });
        return result;
      } else {
        await this.updateNotification(data.id, { status: "failed" });
        return null;
      }
    } catch (error: Error | unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger.error(`SMS notification processing error: ${errorMessage}`, {
        jobId: job.id,
        error,
      });

      // Try to update notification status if we have the data
      try {
        if (job.data?.data?.id) {
          await this.updateNotification(job.data.data.id, { status: "failed" });
        }
      } catch (updateError: Error | unknown) {
        const errorMessage =
          updateError instanceof Error
            ? updateError.message
            : String(updateError);
        logger.error(`Failed to update notification status: ${errorMessage}`);
      }

      // Re-throw to let BullMQ handle the retry logic
      throw error;
    }
  }

  protected async addNotificationToQueue(
    preferences: NotificationPrefWithUser,
    dto: CreateNotifyDto,
    notification: Notification,
  ) {
    try {
      const { email, push, sms, User } = preferences;

      // Handle email notifications
      if (dto.type.includes(NotificationType.email) && email) {
        try {
          const template = dto.data?.template;
          const templateData = dto.data?.templateData;
          if (dto.data && template && templateData) {
            await this.emailService.sendEmail(
              template,
              User.email,
              templateData,
            );
          }
        } catch (emailError: Error | unknown) {
          const errorMessage =
            emailError instanceof Error
              ? emailError.message
              : String(emailError);
          logger.error(`Failed to send email notification: ${errorMessage}`, {
            userId: User.id,
            notificationId: notification.id,
            error: emailError,
          });
          // Continue with other notification types even if email fails
        }
      }

      const notificationTypes = [
        {
          type: NotificationType.push,
          enabled: push,
          queue: this.pushNotificationQueue,
          backoff: 10000,
          logPrefix: "Push",
        },
        {
          type: NotificationType.sms,
          enabled: sms,
          queue: this.smsNotificationQueue,
          backoff: 10000,
          logPrefix: "SMS",
        },
      ];

      // Add to queue with proper error handling
      for (const {
        type,
        enabled,
        queue,
        backoff,
        logPrefix,
      } of notificationTypes) {
        if (dto.type.includes(type) && enabled) {
          try {
            const job = await queue.add(
              dto.title,
              { data: notification, user: User },
              {
                attempts: 3,
                backoff,
                removeOnComplete: {
                  count: 500,
                },
                removeOnFail: {
                  count: 1000,
                },
              },
            );
            logger.info(
              `${logPrefix} notification added to queue - id: ${job.id}`,
            );
          } catch (queueError: Error | unknown) {
            const errorMessage =
              queueError instanceof Error
                ? queueError.message
                : String(queueError);
            logger.error(
              `Failed to add ${logPrefix} notification to queue: ${errorMessage}`,
              {
                userId: User.id,
                notificationId: notification.id,
                error: queueError,
              },
            );
            // Continue with other notification types even if one queue fails
          }
        }
      }
    } catch (error: Error | unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger.error(`Error in addNotificationToQueue: ${errorMessage}`, {
        notificationId: notification.id,
        error,
      });
      // Don't re-throw to prevent notify() from failing completely
    }
  }

  /**
   * Static method to close all workers during application shutdown
   * This should be called from the application shutdown handler
   */
  public static async closeAllWorkers(): Promise<void> {
    if (NotificationService.workersInitialized) {
      logger.info("Closing notification workers...");

      if (NotificationService.pushNotifyWorker) {
        await NotificationService.pushNotifyWorker.close();
        logger.info("Push notification worker closed");
      }

      if (NotificationService.smsNotifyWorker) {
        await NotificationService.smsNotifyWorker.close();
        logger.info("SMS notification worker closed");
      }

      NotificationService.workersInitialized = false;
    }
  }
}

export default NotificationService;
