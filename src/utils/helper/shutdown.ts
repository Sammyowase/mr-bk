import db from "../../models/database";
import { logger } from "../logger/logger";
import {
  emailService,
  notificationService,
  queueService,
} from "../handler/resolveModule";
import { ioServer } from "../../server";
import NotificationService from "../../services/notification.service";

// Handle graceful shutdown
export const gracefulShutdown = async () => {
  try {
    await db.$disconnect();
    logger.info("Database connection closed gracefully");
  } catch (err) {
    logger.error("Error closing database connection", err);
  }

  // Stop workers
  try {
    // Close queue service workers
    queueService.cronWorker.close();
    queueService.cronQueue.close();

    // Close email service workers
    emailService.emailWorker.close();
    emailService.emailQueue.close();

    // Close notification service queues (workers are now handled by static method)
    notificationService.smsNotificationQueue.close();
    notificationService.pushNotificationQueue.close();

    // Close notification workers using the static method
    await NotificationService.closeAllWorkers();

    logger.info("Workers and queues closed gracefully");
  } catch (err) {
    logger.error("Error closing workers and queues", err);
  }

  // Close Socket.IO
  try {
    ioServer.close();
    logger.info("Socket connection closed gracefully");
  } catch (err) {
    logger.error("Error closing socket connection", err);
  }
};
