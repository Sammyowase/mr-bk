import { inject, injectable } from "tsyringe";
import os from "os";
import Redis from "ioredis";
import { logger } from "../utils/logger/logger";
import { EmailService } from "./email.service";
import NotificationService from "./notification.service";
import { HealthStatusResponse } from "../types/misc";

@injectable()
export class SystemService {
  constructor(
    @inject("RedisConnection") private connection: Redis,
    private emailService: EmailService,
    private notifyService: NotificationService,
  ) {}
  async health(): Promise<HealthStatusResponse> {
    let status: "ok" | "degraded" | "error" = "ok";
    const errors: string[] = [];

    // Convert bytes → MB
    const toMB = (bytes: number) => (bytes / 1024 / 1024).toFixed(2);

    // Health thresholds
    const thresholds = {
      memoryMB: 1024, // mark degraded if > 1GB
      failedJobs: 100, // mark degraded if > 100 failed jobs
    };

    try {
      // Node.js memory usage
      const memory = process.memoryUsage();
      const memoryUsage = {
        rssMB: toMB(memory.rss),
        heapTotalMB: toMB(memory.heapTotal),
        heapUsedMB: toMB(memory.heapUsed),
        usagePercent: (memory.heapUsed / memory.heapTotal) * 100,
        externalMB: toMB(memory.external),
      };

      if (Number(memoryUsage.rssMB) > thresholds.memoryMB) {
        status = "degraded";
        errors.push(`High memory usage: ${memoryUsage.rssMB} MB`);
      }

      // System info
      const system = {
        uptime: os.uptime(),
        load: os.loadavg(),
        freeMemMB: toMB(os.freemem()),
        totalMemMB: toMB(os.totalmem()),
      };

      // Redis stats
      let redisStats: Record<string, string> = {};
      try {
        const info = await this.connection.info("memory");
        info.split("\n").forEach((line) => {
          if (
            line.startsWith("used_memory_human") ||
            line.startsWith("connected_clients")
          ) {
            const [key, value] = line.split(":");
            redisStats[key] = value?.trim();
          }
        });
      } catch (err) {
        logger.error(err);
        status = "error";
        errors.push("Redis not reachable");
        redisStats = { error: "Redis not reachable" };
      }

      // BullMQ queue stats
      const queues = [
        this.emailService.emailQueue,
        this.notifyService.smsNotificationQueue,
        this.notifyService.pushNotificationQueue,
      ];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const queueStats: any = {};

      for (const queue of queues) {
        try {
          const counts = await queue.getJobCounts();
          queueStats[queue.name] = counts;

          if (counts.failed > thresholds.failedJobs) {
            status = "degraded";
            errors.push(
              `Queue ${queue.name} has too many failed jobs: ${counts.failed}`,
            );
          }
        } catch (err) {
          logger.error(err);
          status = "error";
          errors.push(`Queue ${queue.name} not reachable`);
          queueStats[queue.name] = { error: "Queue not reachable" };
        }
      }

      return {
        status,
        timestamp: new Date().toISOString(),
        memory: memoryUsage,
        system,
        redis: redisStats,
        queues: queueStats,
        errors: errors.length ? errors : undefined,
      };
    } catch (error) {
      return { status: "error", error: (error as Error).message };
    }
  }
}
