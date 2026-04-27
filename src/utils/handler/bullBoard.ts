import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";
import {
  emailService,
  notificationService,
  queueService,
} from "./resolveModule";

export const serverAdapter = new ExpressAdapter();

// Add Queue Board
createBullBoard({
  queues: [
    new BullMQAdapter(queueService.cronQueue),
    new BullMQAdapter(emailService.emailQueue),
    new BullMQAdapter(notificationService.pushNotificationQueue),
    new BullMQAdapter(notificationService.smsNotificationQueue),
  ],
  serverAdapter,
});
