import { Restriction, UserRestriction } from "../../prisma/generated/prisma";
import { Database } from "../models/database";
import {
  RestrictionFilter,
  RestrictionSortByOptions,
  RestrictionWhere,
  RestrictUserDto,
  UserRestrictions,
} from "../types/permission";
import { injectable } from "tsyringe";

/**
 * Repository class for managing user restrictions and permissions.
 *
 * Provides methods to query, add, and remove user restrictions in the database.
 * Typical use cases include finding restrictions by type and user, removing restrictions
 * from individual users or groups of users, and cleaning up restrictions by type or user.
 *
 * All methods interact with the `userRestriction` and `restriction` tables.
 */
@injectable()
export class UserPermissionRepository {
  constructor(private db: Database) {}

  public async getAllRestrictions(): Promise<Restriction[]> {
    return await this.db.restriction.findMany();
  }

  public async findRestrictionById(id: string): Promise<Restriction | null> {
    return await this.db.restriction.findUnique({
      where: {
        id,
      },
    });
  }

  public async findByTypeAndUserId(
    restrictionType: string,
    userId: string,
  ): Promise<UserRestriction | null> {
    return await this.db.userRestriction.findFirst({
      where: {
        userId,
        Restriction: {
          type: restrictionType,
        },
      },
    });
  }

  public async findRestrictionByType(
    restrictionType: string,
  ): Promise<Restriction | null> {
    return await this.db.restriction.findUnique({
      where: {
        type: restrictionType,
      },
    });
  }

  public async restrictUser(dto: RestrictUserDto): Promise<UserRestriction> {
    return await this.db.userRestriction.create({
      data: {
        ...dto,
      },
    });
  }

  public async getAllRestrictedUsers(
    filter: RestrictionFilter | RestrictionWhere,
    page: number,
    size: number,
    orderBy: RestrictionSortByOptions,
  ): Promise<UserRestrictions> {
    // Find all restricted users
    const users = await this.db.userRestriction.findMany({
      take: size,
      skip: (page - 1) * size,
      orderBy,
      where: filter,
      include: {
        User: {
          omit: {
            password: true,
          },
        },
        Restriction: true,
      },
    });

    // Count the total number of restrictions
    const total = await this.db.userRestriction.count({
      where: filter,
    });

    return {
      users,
      total,
    };
  }

  /**
   * Removes a specific restriction from a user by deleting the corresponding user restriction record.
   *
   * @param userId - The unique identifier of the user.
   * @param restrictionId - The unique identifier of the restriction to be removed.
   * @returns A promise that resolves when the restriction has been removed.
   */
  public async removeRestriction(
    userId: string,
    restrictionId: string,
  ): Promise<void> {
    await this.db.userRestriction.delete({
      where: {
        userId_restrictionId: {
          userId,
          restrictionId,
        },
      },
    });
  }

  /**
   * Removes a specific restriction from multiple users by deleting corresponding records
   * from the `userRestriction` table.
   *
   * @param userIds - An array of user IDs from whom the restriction should be removed.
   * @param restrictionId - The ID of the restriction to be removed.
   * @returns A promise that resolves when the operation is complete.
   */
  public async removeUsersRestriction(
    userIds: string[],
    restrictionId: string,
  ): Promise<void> {
    await this.db.userRestriction.deleteMany({
      where: {
        AND: [
          {
            restrictionId,
          },
          {
            userId: {
              in: userIds,
            },
          },
        ],
      },
    });
  }

  /**
   * Removes all user restrictions associated with the specified restriction ID.
   *
   * @param restrictionId - The unique identifier of the restriction to remove.
   * @returns A promise that resolves when the restrictions have been deleted.
   */
  public async removeRestrictions(restrictionId: string): Promise<void> {
    await this.db.userRestriction.deleteMany({
      where: {
        restrictionId,
      },
    });
  }

  /**
   * Removes all user restrictions for the specified user.
   *
   * Deletes all records from the `userRestriction` table that are associated with the given user ID.
   *
   * @param userId - The unique identifier of the user whose restrictions should be removed.
   * @returns A promise that resolves when the operation is complete.
   */
  public async removeUserRestrictions(userId: string): Promise<void> {
    await this.db.userRestriction.deleteMany({
      where: {
        userId,
      },
    });
  }
}
