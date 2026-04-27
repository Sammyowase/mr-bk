import { Job } from "bullmq";
import PaymentService from "./payment.service";
import { logger } from "../utils/logger/logger";
import { BaseQueueService } from "./base-queue.service";
import { container, injectable } from "tsyringe";

@injectable()
export class QueueService {
  constructor(
    private baseQueueService: BaseQueueService,
    private paymentService: PaymentService,
  ) {}

  public cronQueue = this.baseQueueService.createQueue("cron_jobs");

  public cronWorker = this.baseQueueService.createWorker(
    "cron_jobs",
    this.processCronJob,
  );

  public async addCronJob(
    name: string,
    data?: Record<string, unknown>,
    delay?: number,
  ) {
    const job = await this.cronQueue.add(name, data, {
      attempts: 3,
      backoff: 5000,
      delay,
    });
    logger.info(`Job added to queue - id: ${job.id}`);
  }

  public async processCronJob(job: Job) {
    const paymentService = container.resolve(PaymentService);

    logger.info(`Processing pending job - id: ${job.id}`);

    switch (job.name) {
      case "resolve-pending-transaction":
        await paymentService.resolvePending();
        break;
    }
  }

  // Add resolve pending transaction to queue
  public async startTransactionCron() {
    const jobs = await this.cronQueue.getJobSchedulers();

    for (const job of jobs) {
      if (job.name === "resolve-pending-transaction") {
        logger.info("Remove existing job");
        await this.cronQueue.removeJobScheduler(job.key);
      }
    }

    await this.cronQueue.add(
      "resolve-pending-transaction",
      { message: "Run daily job" },
      {
        repeat: {
          pattern: "0 8 * * *", // 8:00 AM every day
          tz: "Africa/Lagos",
        },
        jobId: "unique-daily-job", // Required to avoid duplicate jobs
        removeOnComplete: true,
      },
    );
  }
}
