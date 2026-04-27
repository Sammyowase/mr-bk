import { PrismaClient } from "../../prisma/generated/prisma";
import { logger } from "../utils/logger/logger";
import { injectable } from "tsyringe";

@injectable()
export class Database extends PrismaClient {
  constructor() {
    super();
  }

  async connect() {
    try {
      await this.$connect();
      logger.info("Database connection established");
    } catch (err) {
      logger.error("Failed to connect to database", err);
      process.exit(1);
    }
  }
}

const db = new Database();

// Export the database instance for use in other modules
export default db;
