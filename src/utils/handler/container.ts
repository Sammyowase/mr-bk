import "reflect-metadata";
import { container } from "tsyringe";
import CacheService from "../../services/cache.service";
import { EmailService } from "../../services/email.service";
import { QueueService } from "../../services/queue.service";
import { BaseQueueService } from "../../services/base-queue.service";
import { Database } from "../../models/database";
import Redis from "ioredis";
import AlertService from "../../services/alert.service";
import EngagementService from "../../services/engagement.service";
import AlertRepository from "../../repository/alert.repository";
import EngagementRepository from "../../repository/engagement.repository";
import { KafkaService } from "../../services/kafka.service";
import { BroadcastService } from "../../services/ws-broadcast.service";

// SINGLETON (shared services)
container.registerSingleton(BaseQueueService);
container.registerSingleton(Database);
container.registerSingleton(Redis);
container.registerSingleton(CacheService);
container.registerSingleton(EmailService);
container.registerSingleton(QueueService);
container.registerSingleton(AlertRepository);
container.registerSingleton(EngagementRepository);
container.registerSingleton(AlertService);
container.registerSingleton(EngagementService);
container.registerSingleton(KafkaService);
container.registerSingleton(BroadcastService);

export { container };
