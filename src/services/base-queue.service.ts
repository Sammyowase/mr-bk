import { Processor, Queue, QueueOptions, Worker, WorkerOptions } from "bullmq";
import { inject, injectable } from "tsyringe";
import Redis from "ioredis";

@injectable()
export class BaseQueueService {
  constructor(@inject("RedisConnection") private connection: Redis) {}

  createQueue(name: string, options?: Omit<QueueOptions, "connection">) {
    return new Queue(name, {
      connection: this.connection,
      ...options,
    });
  }

  createWorker(
    name: string,
    processor: Processor,
    options?: Omit<WorkerOptions, "connection">,
  ) {
    return new Worker(name, processor, {
      connection: this.connection,
      ...options,
    });
  }
}
