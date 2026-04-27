import { Request, Response } from "express";
import sendResponse from "../utils/http/sendResponse";
import { container } from "tsyringe";
import { QueueService } from "../services/queue.service";

export const startCron = async (req: Request, res: Response) => {
  const queueService = container.resolve(QueueService);

  await queueService.startTransactionCron();

  sendResponse(res, 200, "Cron Job started");
};
