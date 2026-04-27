import { Database } from "../models/database";
import { SecurityDetails } from "../types/security";
import { injectable } from "tsyringe";

@injectable()
class SecurityAssignmentRepository {
  constructor(private db: Database) {}

  public async getPropertySecurities(
    propertyId: string,
  ): Promise<Array<SecurityDetails>> {
    return await this.db.securityAssignment.findMany({
      where: {
        propertyId,
      },
      include: {
        Security: {
          omit: {
            password: true,
          },
        },
        Property: true,
      },
    });
  }

  public async assignGuardToProperty(
    userId: string,
    propertyId: string,
  ): Promise<SecurityDetails> {
    return await this.db.securityAssignment.create({
      data: {
        userId,
        propertyId,
      },
      include: {
        Security: {
          omit: {
            password: true,
          },
        },
        Property: true,
      },
    });
  }

  public async getPropertyOfGuard(
    userId: string,
  ): Promise<SecurityDetails | null> {
    return await this.db.securityAssignment.findFirst({
      where: {
        userId,
      },
      include: {
        Security: {
          omit: {
            password: true,
          },
        },
        Property: true,
      },
    });
  }
}

export default SecurityAssignmentRepository;
