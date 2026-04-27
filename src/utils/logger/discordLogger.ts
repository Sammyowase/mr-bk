import axios from "axios";
import { logger } from "./logger";
import config from "../../configs/app/env";

class DiscordLogger {
  private static instance: DiscordLogger;
  private webhookUrl: string;

  private constructor() {
    this.webhookUrl = config.discord_webhook;
  }

  public static getInstance(): DiscordLogger {
    if (!DiscordLogger.instance) {
      DiscordLogger.instance = new DiscordLogger();
    }
    return DiscordLogger.instance;
  }

  private async sendLog(payload: object): Promise<void> {
    try {
      await axios.post(this.webhookUrl, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      logger.error("Failed to send log to Discord:", error);
    }
  }

  public async logError(message: string, stack?: string): Promise<void> {
    const payload = {
      content: `**Error:** ${message}\n**Stack:** ${stack || "No stack trace available"}`,
    };
    await this.sendLog(payload);
  }

  public async logInfo(message: string): Promise<void> {
    const payload = { content: `**Info:** ${message}` };
    await this.sendLog(payload);
  }

  public async logWarning(message: string): Promise<void> {
    const payload = { content: `**Warning:** ${message}` };
    await this.sendLog(payload);
  }

  public async logDebug(message: string): Promise<void> {
    const payload = { content: `**Debug:** ${message}` };
    await this.sendLog(payload);
  }

  public async logSuccess(message: string): Promise<void> {
    const payload = { content: `**Success:** ${message}` };
    await this.sendLog(payload);
  }

  public async logTransaction(message: string): Promise<void> {
    const payload = { content: `**Transaction:** ${message}` };
    await this.sendLog(payload);
  }

  public async logPayment(message: string): Promise<void> {
    const payload = { content: `**Payment:** ${message}` };
    await this.sendLog(payload);
  }

  public async logUser(message: string): Promise<void> {
    const payload = { content: `**User:** ${message}` };
    await this.sendLog(payload);
  }

  public async logAdmin(message: string): Promise<void> {
    const payload = { content: `**Admin:** ${message}` };
    await this.sendLog(payload);
  }

  public async logSecurity(message: string): Promise<void> {
    const payload = { content: `**Security:** ${message}` };
    await this.sendLog(payload);
  }

  public async logPerformance(message: string): Promise<void> {
    const payload = { content: `**Performance:** ${message}` };
    await this.sendLog(payload);
  }

  public async logAudit(message: string): Promise<void> {
    const payload = { content: `**Audit:** ${message}` };
    await this.sendLog(payload);
  }

  public async logCompliance(message: string): Promise<void> {
    const payload = { content: `**Compliance:** ${message}` };
    await this.sendLog(payload);
  }

  public async logDatabase(message: string): Promise<void> {
    const payload = { content: `**Database:** ${message}` };
    await this.sendLog(payload);
  }

  public async logApplication(message: string): Promise<void> {
    const payload = { content: `**Application:** ${message}` };
    await this.sendLog(payload);
  }
}

export default DiscordLogger.getInstance();
