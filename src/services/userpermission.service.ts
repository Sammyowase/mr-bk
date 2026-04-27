import { Restriction, Role } from "../../prisma/generated/prisma";
import UserRepository from "../repository/user.repository";
import { UserPermissionRepository } from "../repository/userpermission.repository";
import { RestrictUserDto, UsersRestriction } from "../types/permission";
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "../utils/exceptions/customException";
import AuditLogService from "./audit.service";
import MeterRepository from "../repository/meter.repository";
import { MetadataType } from "../utils/http/paginatedResponse";
import { SortOrder } from "../types/misc";
import {
  allowedRestrictionSortBy,
  restrictionFilter,
  restrictionSortBy,
  restrictionWhere,
} from "../utils/constants/restriction";
import { JwtPayload } from "jsonwebtoken";
import { injectable } from "tsyringe";

/**
 * Service for managing and checking user permissions and restrictions.
 *
 * Provides methods to verify if a user has specific restriction types.
 *
 * @remarks
 * This service interacts with the UserPermissionRepository to determine
 * if a user is associated with a particular restriction.
 */
@injectable()
export class UserPermissionService {
  constructor(
    private auditService: AuditLogService,
    private userRepo: UserRepository,
    private permissionRepo: UserPermissionRepository,
    private meterRepo: MeterRepository,
  ) {}
  /**
   * Checks if a user has a specific restriction type.
   *
   * @param userId - The unique identifier of the user.
   * @param restrictionType - The type of restriction to check for.
   * @returns A promise that resolves to `true` if the user has the specified restriction, otherwise `false`.
   */
  public async hasRestriction(
    userId: string,
    restrictionType: string,
  ): Promise<boolean> {
    return (
      (await this.permissionRepo.findByTypeAndUserId(
        restrictionType,
        userId,
      )) !== null
    );
  }

  /**
   * Determines if a user with a given role (`reqRole`) has permission to restrict another user with a specified role (`userRole`).
   *
   * The permission is based on a hierarchy of roles, where higher-level roles can restrict lower-level roles.
   * Returns `true` if `reqRole` is higher than `userRole`, otherwise returns `false`.
   *
   * @param reqRole - The role of the user attempting to restrict another user.
   * @param userRole - The role of the user being restricted.
   * @returns A promise that resolves to `true` if `reqRole` can restrict `userRole`, otherwise `false`.
   */
  public async canRestrict(reqRole: Role, userRole: Role) {
    const levels = {
      [Role.super_admin]: 5,
      [Role.admin]: 4,
      [Role.manager]: 3,
      [Role.security]: 2,
      [Role.houseowner]: 2,
      [Role.user]: 1,
    };
    return levels[reqRole] > levels[userRole];
  }

  /**
   * Restricts a user by applying a specified restriction type.
   *
   * This method performs the following steps:
   * 1. Fetches the user, restriction type, and associated meter in parallel.
   * 2. Validates the existence of the user and restriction type.
   * 3. Checks if the requesting user has permission to restrict the target user.
   * 4. Applies the restriction to the user.
   * 5. Logs the restriction action in the audit log if the request is authenticated.
   *
   * @param req - The Express request object, containing the authenticated user.
   * @param dto - Data transfer object containing the userId and restrictionId.
   * @returns The result of the restriction operation.
   * @throws BadRequestException if the user or restriction type does not exist.
   * @throws ForbiddenException if the requesting user is not allowed to restrict the target user.
   */
  public async restrictUser(req: JwtPayload, dto: RestrictUserDto) {
    const [user, restriction, meter] = await Promise.all([
      this.userRepo.findById(dto.userId),
      this.permissionRepo.findRestrictionById(dto.restrictionId),
      this.meterRepo.findMeterByOwnerId(dto.userId),
    ]);

    if (!user) {
      throw new BadRequestException("User doesn't exist");
    }

    if (!restriction) {
      throw new BadRequestException("Restriction type doesn't exist");
    }

    if (req.user && !this.canRestrict(req.user.role, user.role)) {
      throw new ForbiddenException(
        "You are not allowed to perform this action",
      );
    }

    const restrict = await this.permissionRepo.restrictUser(dto);

    if (req.user) {
      // Log restriction
      await this.auditService.logAudit({
        action: "create",
        model: "restriction",
        userId: req.user.id,
        description: `User ${user.email} restricted (${restriction.type})`,
        propertyId: meter?.propertyId || undefined,
      });
    }

    return restrict;
  }

  /**
   * Removes a specific restriction type from one or more users.
   *
   * @param req - The Express request object, used for logging and authorization.
   * @param userId - The ID of the user or an array of user IDs from whom the restriction should be removed.
   * @param restrictionType - The type of restriction to remove.
   * @returns A promise that resolves when the restriction has been removed.
   * @throws {BadRequestException} If the specified restriction type does not exist.
   */
  public async removeRestriction(
    req: JwtPayload,
    userId: string | string[],
    restrictionType: string,
  ): Promise<void> {
    const restriction =
      await this.permissionRepo.findRestrictionByType(restrictionType);

    if (!restriction) {
      throw new BadRequestException("Restriction type doesn't exist");
    }

    if (Array.isArray(userId)) {
      await this.permissionRepo.removeUsersRestriction(userId, restriction.id);
    } else {
      await this.permissionRepo.removeRestriction(userId, restriction.id);
    }

    if (req.user) {
      // Log restriction
      await this.auditService.logAudit({
        action: "delete",
        model: "restriction",
        userId: req.user.id,
        description: `Restrictions removed (${restriction.type})`,
        metadata: {
          userId,
        },
      });
    }
  }

  /**
   * Removes user restrictions associated with the specified restriction ID.
   *
   * @param req - The Express request object, used for logging and authorization.
   * @param restrictionId - The unique identifier of the restriction to be removed.
   * @returns A promise that resolves when the restriction has been removed.
   */
  public async removeRestrictions(
    req: JwtPayload,
    restrictionId: string,
  ): Promise<void> {
    const restriction =
      await this.permissionRepo.findRestrictionById(restrictionId);
    if (!restriction) {
      throw new NotFoundException("Restriction not found");
    }

    if (req.user) {
      // Log restriction
      await this.auditService.logAudit({
        action: "delete",
        model: "restriction",
        userId: req.user.id,
        description: `All restrictions removed (${restriction.type})`,
      });
    }

    await this.permissionRepo.removeRestrictions(restrictionId);
  }

  /**
   * Removes all restrictions associated with a specific user.
   *
   * This method retrieves the user by their ID and, if the user exists,
   * proceeds to remove any restrictions applied to them via the this.permissionRepo.
   * Throws a BadRequestException if the user does not exist.
   *
   * @param req - The Express request object, used for logging and authorization.
   * @param userId - The unique identifier of the user whose restrictions are to be removed.
   * @returns A promise that resolves when the restrictions have been removed.
   * @throws {BadRequestException} If the user does not exist.
   */
  public async removeUserRestrictions(
    req: JwtPayload,
    userId: string,
  ): Promise<void> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new BadRequestException("User doesn't exist");
    }

    if (req.user) {
      // Log restriction
      await this.auditService.logAudit({
        action: "delete",
        model: "restriction",
        userId: req.user.id,
        description: `All user restrictions removed (${user.email})`,
      });
    }

    await this.permissionRepo.removeUserRestrictions(userId);
  }

  /**
   * Retrieves a paginated list of users with specific restrictions, supporting filtering, sorting, and searching.
   *
   * @param page - The current page number as a string (defaults to "1" if not provided or invalid).
   * @param size - The number of items per page as a string (defaults to "10" if not provided or invalid).
   * @param sortBy - The field by which to sort the results (defaults to "createdAt").
   * @param order - The sort order, either "asc" for ascending or "desc" for descending (defaults to descending).
   * @param search - A search query string to filter users by relevant fields.
   * @param restrictionId - The ID of the restriction to filter users by.
   * @param userId - The ID of the user to filter restrictions for.
   * @param propertyId - The ID of the property to be filtered with.
   * @returns An object containing the list of restricted users and pagination metadata.
   * @throws BadRequestException If the sortBy field is not allowed.
   */
  public async getAllRestrictedUsers(
    page: string,
    size: string,
    sortBy: string,
    order: string,
    search: string,
    restrictionId: string,
    userId: string,
    propertyId: string,
  ): Promise<{ data: UsersRestriction[]; metadata: MetadataType }> {
    const pageNumber = parseInt(page) || 1;
    const pageSize = parseInt(size) || 10;
    const sortByField = sortBy || "createdAt";
    const sortOrder = order === "asc" ? SortOrder.ASC : SortOrder.DESC;

    const filter = search
      ? restrictionFilter(search, propertyId)
      : restrictionWhere(restrictionId, userId, propertyId);

    if (!allowedRestrictionSortBy.includes(sortByField)) {
      throw new BadRequestException("Invalid sort field");
    }

    const result = await this.permissionRepo.getAllRestrictedUsers(
      filter,
      pageNumber,
      pageSize,
      restrictionSortBy(sortByField, sortOrder),
    );

    return {
      data: result.users,
      metadata: {
        total: result.total,
        page: pageNumber,
        size: pageSize,
      },
    };
  }

  /**
   * Retrieves all restriction entities from the data source.
   *
   * @returns {Promise<Restriction[]>} A promise that resolves to an array of `Restriction` objects.
   */
  public async getAllRestrictions(): Promise<Restriction[]> {
    return await this.permissionRepo.getAllRestrictions();
  }
}
