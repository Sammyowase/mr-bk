import "reflect-metadata";
import { container } from "tsyringe";
import UserRepository from "../../repository/user.repository";
import { EmailService } from "../../services/email.service";
import NotificationService from "../../services/notification.service";
import { QueueService } from "../../services/queue.service";
import { redisConnection } from "../../models/redis";
import { initWorkers } from "../../services/workers.service";

// Register server
container.register("RedisConnection", { useValue: redisConnection });

// Resolve dependency to be used by functions
export const emailService = container.resolve(EmailService);
export const queueService = container.resolve(QueueService);
export const notificationService = container.resolve(NotificationService);
export const userRepo = container.resolve(UserRepository);

// Start worker
initWorkers();
