import { Redis } from "ioredis";
import { logger } from "../utils/logger/logger";
import config from "../configs/app/env";

export const redisConnection = new Redis({
  ...config.redisOptions,
  maxRetriesPerRequest: null, // Required for queue
});

redisConnection.on("connect", () =>
  logger.info("Redis connected successfully!"),
);
redisConnection.on("error", (err) =>
  logger.error("Redis connection error:", err),
);
