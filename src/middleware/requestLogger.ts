import morgan from "morgan";
import { logger } from "../utils/logger/logger";
/**
 * Middleware to log HTTP requests using Morgan.
 * It formats the log messages and sends them to the logger.
 */
const stream = {
  write: (message: string) => logger.http(message.trim()),
};

export const requestLogger = morgan(
  ":method :url :status :res[content-length] - :response-time ms",
  { stream }
);
