import "reflect-metadata";
import { createServer } from "node:http";
import app from "./app";
import config from "./configs/app/env";
import { gracefulShutdown } from "./utils/helper/shutdown";
import discordLogger from "./utils/logger/discordLogger";
import { logger } from "./utils/logger/logger";
import { Server } from "socket.io";
import { BroadcastService } from "./services/ws-broadcast.service";
import { container } from "tsyringe";

// Config
const PORT = config.port;
const NODE_ENV = config.nodeEnv;
const DOMAIN = config.domain;

// Graceful shutdown
process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

// Setup Server and Socket IO
const server = createServer(app);
export const ioServer = new Server(server, {
  cors: {
    origin: "*", // frontend origin
    methods: ["GET", "POST"],
    credentials: false,
  },
});

// Inject and start server
const broadcastService = container.resolve(BroadcastService);
broadcastService.init(ioServer);

if (require.main === module) {
  server.listen(PORT, async () => {
    if (NODE_ENV === "production") {
      await discordLogger.logApplication(`Server started on ${new Date()}`);
    }
    logger.info(`server running on ${DOMAIN}`);
  });
}
