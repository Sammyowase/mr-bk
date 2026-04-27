/* eslint-disable @typescript-eslint/no-explicit-any */
import { Server } from "socket.io";
import { logger } from "../utils/logger/logger";
import { injectable } from "tsyringe";

@injectable()
export class BroadcastService {
  private engine!: Server;

  init(io: Server) {
    this.engine = io;
    this.startEngine();
  }

  protected startEngine = () => {
    // Initialize a connection
    this.engine.on("connection", async () => {
      const sockets = await this.engine.fetchSockets();
      const active = sockets.length;

      logger.debug(
        `${active} active socket ${active === 1 ? "connection" : "connections"}`,
      );
    });
  };

  stopEngine() {
    this.engine!.close();
  }

  public outGoingListener(e: any, args: any[]) {
    logger.info(`Sending event to ${e}`);
    console.log("Data: ", args);
  }

  public notify(args: any[], to?: string, prefix: string = "notifications") {
    const ev = to ? `${prefix}:${to}` : prefix;

    this.engine.emit(ev, args);
  }
}
