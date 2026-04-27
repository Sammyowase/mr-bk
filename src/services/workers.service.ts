import { logger } from "../utils/logger/logger";
import { emailService, queueService } from "../utils/handler/resolveModule";
import NotificationService from "./notification.service";
import { Job } from "bullmq";

export const initWorkers = () => {
  // EMAIL
  emailService.emailWorker.on("completed", (job: Job) => {
    logger.info(`✅ Email Job ${job.id} completed`);
  });

  emailService.emailWorker.on("failed", (job: Job | undefined, err: Error) => {
    logger.error(`❌ Email Job ${job?.id} failed:`, err);
  });

  // CRON
  queueService.cronWorker.on("completed", (job: Job) => {
    logger.info(`✅ Job ${job.id} completed`);
  });

  queueService.cronWorker.on("failed", (job: Job | undefined, err: Error) => {
    logger.error(`❌ Job ${job?.id} failed:`, err);
  });

  // Access static workers from NotificationService class

  // PUSH
  if (NotificationService.pushNotifyWorker) {
    NotificationService.pushNotifyWorker.on("completed", (job: Job) => {
      logger.info(`✅ Push Notification Job ${job.id} completed`);
    });

    NotificationService.pushNotifyWorker.on(
      "failed",
      (job: Job | undefined, err: Error) => {
        logger.error(`❌ Push Notification Job ${job?.id} failed:`, err);
      },
    );
  } else {
    logger.warn(
      "Push notification worker not initialized when setting up event listeners",
    );
  }

  // SMS
  if (NotificationService.smsNotifyWorker) {
    NotificationService.smsNotifyWorker.on("completed", (job: Job) => {
      logger.info(`✅ SMS Notification Job ${job.id} completed`);
    });

    NotificationService.smsNotifyWorker.on(
      "failed",
      (job: Job | undefined, err: Error) => {
        logger.error(`❌ SMS Notification Job ${job?.id} failed:`, err);
      },
    );
  } else {
    logger.warn(
      "SMS notification worker not initialized when setting up event listeners",
    );
  }
};
