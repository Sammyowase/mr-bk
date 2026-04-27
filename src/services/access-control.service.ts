import { customAlphabet } from "nanoid";
import QRCode from "qrcode";
import { Response } from "express";
import AccessPointRepository from "../repository/access-point.repository";
import PropertyRepository from "../repository/property.repository";
import HouseRepository from "../repository/house.repository";
import UserRepository from "../repository/user.repository";
import { SortOrder } from "../types/misc";
import SpreadSheet from "./spreadsheet.service";
import { exportExcel } from "../utils/helper/exportExcel";
import {
  accessPointFilter,
  accessPointSortBy,
  allowedAccessPointSortBy,
  accessTokenFilter,
  accessTokenSortBy,
  allowedAccessTokenSortBy,
  accessTokenWhere,
  guestLogFilter,
} from "../utils/constants/access-control";
import {
  BadRequestException,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
} from "../utils/exceptions/customException";
import {
  CreateAccessPointDto,
  UpdateAccessPointDto,
  GenerateAccessCodeDto,
  AssignSecurityRoleDto,
  GenerateQRCodeDto,
  AddGuestLogDto,
  EntryRequestDto,
  ExitVerifyDto,
  UpdateEntryLogDto,
  UpdateGuestLogResponse,
  GuestEntryWithToken,
} from "../types/access-control";
import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";
import AuditLogService from "./audit.service";
import {
  AccessDecision,
  AccessStatus,
  AccessToken,
  AccessType,
  GuestEntry,
} from "../../prisma/generated/prisma";
import { injectable } from "tsyringe";

/**
 * Service class providing access control functionalities.
 *
 * @remarks
 * This service handles token creation, token validation, access point management,
 * and guest entry
 *
 */
@injectable()
class AccessControlService {
  constructor(
    private accessRepo: AccessPointRepository,
    private propertyRepo: PropertyRepository,
    private houseRepo: HouseRepository,
    private userRepo: UserRepository,
    private auditService: AuditLogService,
  ) {}

  public async getAllAccessPoints(
    page: string,
    size: string,
    sortBy: string,
    order: string,
    search: string,
    propertyId?: string,
  ) {
    const pageNumber = parseInt(page) || 1;
    const pageSize = parseInt(size) || 10;
    const sortByField = sortBy || "name";
    const sortOrder = order === "desc" ? SortOrder.DESC : SortOrder.ASC;

    // If propertyId is provided, validate it exists
    if (propertyId) {
      const property = await this.propertyRepo.findById(propertyId);
      if (!property) {
        throw new NotFoundException("Property not found");
      }
    }

    const filter = search
      ? accessPointFilter(search, propertyId)
      : propertyId
        ? accessPointFilter("", propertyId)
        : undefined;

    if (!allowedAccessPointSortBy.includes(sortByField)) {
      throw new BadRequestException("Invalid sort field");
    }

    const result = await this.accessRepo.getAllAccessPoints(
      filter,
      pageNumber,
      pageSize,
      accessPointSortBy(sortByField, sortOrder),
    );

    return {
      data: result.points,
      metadata: {
        total: result.total,
        page: pageNumber,
        size: pageSize,
      },
    };
  }

  public async createAccessPoint(req: Request, dto: CreateAccessPointDto) {
    const user = req.user as JwtPayload;

    // Validate property or house exists
    if (dto.propertyId) {
      const property = await this.propertyRepo.findById(dto.propertyId);
      if (!property) {
        throw new NotFoundException("Property not found");
      }
    }

    if (dto.houseId) {
      const house = await this.houseRepo.findById(dto.houseId);
      if (!house) {
        throw new NotFoundException("House not found");
      }
    }

    // Check if access point with same name already exists for the property/house
    const existingAccessPoint = await this.accessRepo.checkAccessPointExists(
      dto.name,
      dto.propertyId,
      dto.houseId,
    );

    if (existingAccessPoint) {
      throw new ConflictException("Access point with this name already exists");
    }

    const accessPoint = await this.accessRepo.createAccessPoint({
      ...dto,
      isActive: dto.isActive !== undefined ? dto.isActive : true,
    });

    // Log audit
    await this.auditService.logAudit({
      action: "create",
      model: "access_point",
      userId: user.id,
      propertyId: dto.propertyId,
      description: `Access point created: ${accessPoint.name}`,
      metadata: {
        accessPointId: accessPoint.id,
        type: accessPoint.type,
      },
    });

    return accessPoint;
  }

  public async updateAccessPoint(
    req: Request,
    id: string,
    dto: UpdateAccessPointDto,
  ) {
    const user = req.user as JwtPayload;

    const accessPoint = await this.accessRepo.findById(id);
    if (!accessPoint) {
      throw new NotFoundException("Access point not found");
    }

    // Check authorization - user should be able to access this access point
    if (user.role !== "super_admin" && user.role !== "admin") {
      // For managers and users, they can only update access points in their property/house
      if (accessPoint.propertyId) {
        const property = await this.propertyRepo.findById(
          accessPoint.propertyId,
        );
        if (property?.managerId !== user.id && property?.authorId !== user.id) {
          throw new UnauthorizedException(
            "You don't have permission to update this access point",
          );
        }
      }
    }

    const updatedAccessPoint = await this.accessRepo.updateAccessPoint(id, dto);

    // Log audit
    await this.auditService.logAudit({
      action: "update",
      model: "access_point",
      userId: user.id,
      propertyId: accessPoint.propertyId || undefined,
      description: `Access point updated: ${accessPoint.name}`,
      metadata: {
        accessPointId: id,
        changes: dto,
      },
    });

    return updatedAccessPoint;
  }

  public async deleteAccessPoint(req: Request, id: string) {
    const user = req.user as JwtPayload;

    const accessPoint = await this.accessRepo.findById(id);
    if (!accessPoint) {
      throw new NotFoundException("Access point not found");
    }

    // Check authorization - user should be able to access this access point
    if (user.role !== "super_admin" && user.role !== "admin") {
      if (accessPoint.propertyId) {
        const property = await this.propertyRepo.findById(
          accessPoint.propertyId,
        );
        if (property?.managerId !== user.id && property?.authorId !== user.id) {
          throw new UnauthorizedException(
            "You don't have permission to delete this access point",
          );
        }
      }
    }

    await this.accessRepo.deleteAccessPoint(id);

    // Log audit
    await this.auditService.logAudit({
      action: "delete",
      model: "access_point",
      userId: user.id,
      propertyId: accessPoint.propertyId || undefined,
      description: `Access point deleted: ${accessPoint.name}`,
      metadata: {
        accessPointId: id,
      },
    });
  }

  public async generateAccessCode(req: Request, dto: GenerateAccessCodeDto) {
    const user = req.user as JwtPayload;

    // Validate access point exists
    const accessPoint = await this.accessRepo.findById(dto.accesspointId);
    if (!accessPoint) {
      throw new NotFoundException("Access point not found");
    }

    // Check authorization
    if (user.role !== "super_admin" && user.role !== "admin") {
      if (accessPoint.propertyId && !accessPoint.houseId) {
        const property = await this.propertyRepo.findById(
          accessPoint.propertyId,
        );
        if (property?.managerId !== user.id && property?.authorId !== user.id) {
          throw new UnauthorizedException(
            "You don't have permission to generate codes for this access point",
          );
        }
      }
    }

    // Generate unique code
    let code: string;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      code = this.generateCode(6);
      const existingToken = await this.accessRepo.findAccessTokenByCode(code);
      if (!existingToken) {
        isUnique = true;
      }
      attempts++;
    } while (!isUnique && attempts < maxAttempts);

    if (!isUnique) {
      throw new BadRequestException(
        "Unable to generate unique access code. Please try again.",
      );
    }

    const accessToken = await this.accessRepo.createAccessToken({
      ...dto,
      code: code!,
      issuedById: user.id,
    });

    // Log audit
    await this.auditService.logAudit({
      action: "create",
      model: "access_token",
      userId: user.id,
      propertyId: accessPoint.propertyId,
      description: `Access code generated for ${dto.guestName} at ${accessPoint.name}`,
      metadata: {
        accessTokenId: accessToken.id,
        guestName: dto.guestName,
        accessPointId: dto.accesspointId,
        validFrom: dto.validFrom,
        validUntil: dto.validUntil,
      },
    });

    return accessToken;
  }

  public async getAllAccessCodes(
    req: Request,
    accesspointId: string,
    page: string,
    size: string,
    sortBy: string,
    order: string,
    search: string,
    status: string,
  ) {
    const user = req.user as JwtPayload;

    // Validate access point exists
    const accessPoint = await this.accessRepo.findById(accesspointId);
    if (!accessPoint) {
      throw new NotFoundException("Access point not found");
    }

    // Check authorization
    if (user.role !== "super_admin" && user.role !== "admin") {
      if (accessPoint.propertyId && !accessPoint.houseId) {
        const property = await this.propertyRepo.findById(
          accessPoint.propertyId,
        );
        if (property?.managerId !== user.id && property?.authorId !== user.id) {
          throw new UnauthorizedException(
            "You don't have permission to view codes for this access point",
          );
        }
      }
    }

    const pageNumber = parseInt(page) || 1;
    const pageSize = parseInt(size) || 10;
    const sortByField = sortBy || "createdAt";
    const sortOrder = order === "desc" ? SortOrder.DESC : SortOrder.ASC;

    const filter = search
      ? accessTokenFilter(search, accesspointId, status)
      : accessTokenWhere(accesspointId, status);

    if (!allowedAccessTokenSortBy.includes(sortByField)) {
      throw new BadRequestException("Invalid sort field");
    }

    const result = await this.accessRepo.getAllAccessTokens(
      filter,
      pageNumber,
      pageSize,
      accessTokenSortBy(sortByField, sortOrder),
    );

    return {
      data: result.tokens,
      metadata: {
        total: result.total,
        page: pageNumber,
        size: pageSize,
      },
    };
  }

  public async deleteAccessCode(req: Request, accessCodeId: string) {
    const user = req.user as JwtPayload;

    const accessToken = await this.accessRepo.findAccessTokenById(accessCodeId);
    if (!accessToken) {
      throw new NotFoundException("Access code not found");
    }

    const accessPoint = await this.accessRepo.findById(
      accessToken.accesspointId,
    );

    if (!accessPoint) {
      throw new NotFoundException("Access point not found");
    }

    // Check authorization
    if (user.role !== "super_admin" && user.role !== "admin") {
      if (accessToken.issuedById !== user.id) {
        if (accessPoint.propertyId && !accessPoint.houseId) {
          const property = await this.propertyRepo.findById(
            accessPoint.propertyId,
          );
          if (
            property?.managerId !== user.id &&
            property?.authorId !== user.id
          ) {
            throw new UnauthorizedException(
              "You don't have permission to delete this access code",
            );
          }
        } else {
          throw new UnauthorizedException(
            "You don't have permission to delete this access code",
          );
        }
      }
    }

    await this.accessRepo.deleteAccessToken(accessCodeId);

    // Log audit
    await this.auditService.logAudit({
      action: "delete",
      model: "access_token",
      userId: user.id,
      propertyId: accessPoint.propertyId,
      description: `Access code deleted for ${accessToken.guestName}`,
      metadata: {
        accessTokenId: accessCodeId,
        guestName: accessToken.guestName,
        accessPointId: accessToken.accesspointId,
      },
    });
  }

  public async revokeAccessCode(req: Request, accessCodeId: string) {
    const user = req.user as JwtPayload;

    const accessToken = await this.accessRepo.findAccessTokenById(accessCodeId);
    if (!accessToken) {
      throw new NotFoundException("Access code not found");
    }

    if (accessToken.status === AccessStatus.revoked) {
      throw new BadRequestException("Access code is already revoked");
    }

    const accessPoint = await this.accessRepo.findById(
      accessToken.accesspointId,
    );
    if (!accessPoint) {
      throw new NotFoundException("Access point not found");
    }

    // Check authorization
    if (user.role !== "super_admin" && user.role !== "admin") {
      if (accessToken.issuedById !== user.id) {
        if (accessPoint.propertyId && !accessPoint.houseId) {
          const property = await this.propertyRepo.findById(
            accessPoint.propertyId,
          );
          if (
            property?.managerId !== user.id &&
            property?.authorId !== user.id
          ) {
            throw new UnauthorizedException(
              "You don't have permission to revoke this access code",
            );
          }
        } else {
          throw new UnauthorizedException(
            "You don't have permission to revoke this access code",
          );
        }
      }
    }

    const revokedToken = await this.accessRepo.revokeAccessToken(accessCodeId);

    // Log audit
    await this.auditService.logAudit({
      action: "update",
      model: "access_token",
      userId: user.id,
      propertyId: accessPoint.propertyId,
      description: `Access code revoked for ${accessToken.guestName}`,
      metadata: {
        accessTokenId: accessCodeId,
        guestName: accessToken.guestName,
        accessPointId: accessToken.accesspointId,
        previousStatus: accessToken.status,
        newStatus: "revoked",
      },
    });

    return revokedToken;
  }

  public async assignSecurityRole(req: Request, dto: AssignSecurityRoleDto) {
    const user = req.user as JwtPayload;

    // Only admins and super admins can assign security roles
    if (user.role !== "super_admin" && user.role !== "admin") {
      throw new UnauthorizedException(
        "You don't have permission to assign security roles",
      );
    }

    // Validate user exists
    const targetUser = await this.userRepo.findById(dto.userId);
    if (!targetUser) {
      throw new NotFoundException("User not found");
    }

    // Validate property or house if provided
    if (dto.propertyId) {
      const property = await this.propertyRepo.findById(dto.propertyId);
      if (!property) {
        throw new NotFoundException("Property not found");
      }
    }

    if (dto.houseId) {
      const house = await this.houseRepo.findById(dto.houseId);
      if (!house) {
        throw new NotFoundException("House not found");
      }
    }

    // Update user role to security
    const updatedUser = await this.userRepo.updateUserRole(
      dto.userId,
      "security",
    );

    // Log audit
    await this.auditService.logAudit({
      action: "update",
      model: "user",
      userId: user.id,
      propertyId: dto.propertyId,
      description: `Security role assigned to ${targetUser.firstName} ${targetUser.lastName}`,
      metadata: {
        targetUserId: dto.userId,
        previousRole: targetUser.role,
        newRole: "security",
        propertyId: dto.propertyId,
        houseId: dto.houseId,
      },
    });

    return updatedUser;
  }

  public async generateQRCode(req: Request, dto: GenerateQRCodeDto) {
    // Generate access code as before
    const accessCodeDto: GenerateAccessCodeDto = {
      ...dto,
      type: AccessType.qr,
    };

    const accessToken = await this.generateAccessCode(req, accessCodeDto);

    // Prepare QR data as a JSON string
    const qrData = {
      code: accessToken.code,
      accessPointId: accessToken.accesspointId,
      guestName: accessToken.guestName,
      validFrom: accessToken.validFrom,
      validUntil: accessToken.validUntil,
    };
    const qrString = JSON.stringify(qrData);

    // Generate QR code as a Data URL (PNG)
    const qrCodeImage = await QRCode.toDataURL(qrString, {
      errorCorrectionLevel: "M",
    });

    return {
      ...accessToken,
      qrCodeImage,
    };
  }

  public generateCode(length: number = 6): string {
    const generateNumericCode = customAlphabet(
      "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      length,
    );

    return generateNumericCode();
  }

  public async getResidentAccessCodes(
    houseId: string,
    page: string,
    size: string,
  ) {
    // Validate house exists
    const house = await this.houseRepo.findById(houseId);
    if (!house) {
      throw new NotFoundException("House not found");
    }

    const pageNumber = parseInt(page) || 1;
    const pageSize = parseInt(size) || 10;

    const result = await this.accessRepo.getResidentAccessCodes(
      houseId,
      pageNumber,
      pageSize,
    );

    return {
      data: result.tokens,
      metadata: {
        total: result.total,
        page: pageNumber,
        size: pageSize,
      },
    };
  }

  public async getPropertyAccessCodes(
    propertyId: string,
    page: string,
    size: string,
  ) {
    // Validate property exists
    const property = await this.propertyRepo.findById(propertyId);
    if (!property) {
      throw new NotFoundException("Property not found");
    }

    const pageNumber = parseInt(page) || 1;
    const pageSize = parseInt(size) || 10;

    const result = await this.accessRepo.getPropertyAccessCodes(
      propertyId,
      pageNumber,
      pageSize,
    );

    return {
      data: result.tokens,
      metadata: {
        total: result.total,
        page: pageNumber,
        size: pageSize,
      },
    };
  }

  public async getResidentAccessPoints(
    houseId: string,
    page: string,
    size: string,
  ) {
    // Validate house exists
    const house = await this.houseRepo.findById(houseId);
    if (!house) {
      throw new NotFoundException("House not found");
    }

    const pageNumber = parseInt(page) || 1;
    const pageSize = parseInt(size) || 10;

    const result = await this.accessRepo.getResidentAccessPoints(
      houseId,
      pageNumber,
      pageSize,
    );

    return {
      data: result.points,
      metadata: {
        total: result.total,
        page: pageNumber,
        size: pageSize,
      },
    };
  }

  public async getAccessCodeDetails(code: string): Promise<AccessToken | null> {
    const accessToken = await this.accessRepo.findAccessTokenByCode(code);
    if (!accessToken) {
      throw new NotFoundException("Access code not found");
    }

    return accessToken;
  }

  public async getAllGuestLogs(
    res: Response,
    page: string,
    size: string,
    search: string,
    propertyId?: string,
    startDate?: string,
    endDate?: string,
    status?: string,
    download?: string,
  ) {
    const pageNumber = parseInt(page) || 1;
    const pageSize = parseInt(size) || 10;

    const filter = guestLogFilter(
      propertyId,
      search,
      startDate,
      endDate,
      status,
    );

    // If Download specified
    if (download === "true") {
      const sheetname = "Guest Logs";
      const filename = `guest_logs`;

      const sp = new SpreadSheet(`${sheetname} List`);

      // Retrieve the data
      const logs = await this.accessRepo.getAllGuestLogsExport(filter);

      if (logs.length) {
        // Prepare the data
        const data = logs.map((log) => {
          return {
            property: log.accessPoint.Property?.name || "N/A",
            house: log.accessPoint.House?.name || "N/A",
            accessPoint: log.accessPoint.name || "N/A",
            guestName: log.accessToken.guestName || "N/A",
            code: log.accessToken.code || "N/A",
            status: log.accessStatus || "N/A",
            entryTime: log.entryTime
              ? new Date(log.entryTime).toLocaleString()
              : "N/A",
            exitTime: log.exitTime
              ? new Date(log.exitTime).toLocaleString()
              : "N/A",
            createdAt: new Date(log.createdAt).toLocaleString(),
          };
        });

        // Define columns for export
        const guestLogExportCol = [
          { header: "Property", key: "property", width: 25 },
          { header: "House", key: "house", width: 25 },
          { header: "Access Point", key: "accessPoint", width: 25 },
          { header: "Guest Name", key: "guestName", width: 25 },
          { header: "Code", key: "code", width: 15 },
          { header: "Status", key: "status", width: 15 },
          { header: "Entry Time", key: "entryTime", width: 25 },
          { header: "Exit Time", key: "exitTime", width: 25 },
          { header: "Created At", key: "createdAt", width: 25 },
        ];

        // Write to a file
        const filePath = await sp.writeExcel(
          filename,
          sheetname,
          guestLogExportCol,
          data,
        );

        // Export the file
        return exportExcel(res, filename, filePath);
      }
    }

    const result = await this.accessRepo.getAllGuestLogs(
      filter,
      pageNumber,
      pageSize,
    );

    return {
      data: result.logs,
      metadata: {
        total: result.total,
        page: pageNumber,
        size: pageSize,
      },
    };
  }

  public async entryRequest(dto: EntryRequestDto): Promise<GuestEntry> {
    const accessToken = await this.accessRepo.findAccessTokenByCode(dto.code);
    if (!accessToken) {
      throw new BadRequestException("Invalid access code provided");
    }

    // Init Guest log data
    const data: AddGuestLogDto = {
      accessPointId: accessToken.accesspointId,
      accessTokenId: accessToken.id,
      entryTime: new Date(),
      securityId: dto.securityId,
      guestName: accessToken.guestName,
      guestItems: dto.guestItems,
      accessStatus: dto.accessStatus,
      photoCapturedUrl: dto.photoCapturedUrl,
    };

    const currentTime = new Date();
    // Deny access if request is sent outside the validity period
    if (
      accessToken.validFrom > currentTime ||
      accessToken.validUntil < currentTime
    ) {
      data.accessStatus = AccessDecision.denied;
      data.exitTime = currentTime;
    }

    // Create entry request
    const entry = await this.accessRepo.addGuestLogs(data);

    // Log audit
    await this.auditService.logAudit({
      action: "create",
      model: "guestLog",
      userId: dto.securityId,
      propertyId: accessToken.AccessPoint.propertyId,
      description: `Access ${data.accessStatus} for ${accessToken.guestName} to ${accessToken.AccessPoint.name}`,
      metadata: {
        expectedExit: accessToken.validUntil,
      },
    });

    return entry;
  }

  public async exitRequest(
    dto: ExitVerifyDto,
  ): Promise<UpdateGuestLogResponse> {
    const entryLog = await this.accessRepo.findGuestLogById(dto.guestLogId);
    if (!entryLog) {
      throw new BadRequestException("Guest entry not recorded");
    }

    // Init update data
    const data: UpdateEntryLogDto = {
      exitTime: dto.exitTime,
    };
    // verify exit
    const exit = await this.accessRepo.updateGuestLogExit(dto.guestLogId, data);

    // Log audit
    await this.auditService.logAudit({
      action: "update",
      model: "guestLog",
      userId: dto.userId,
      propertyId: exit.accessPoint.propertyId,
      description: `${exit.guestName} exit (${exit.accessPoint.name})`,
      metadata: {
        checked: dto.checked,
      },
    });

    return exit;
  }

  public async getGuestEntryLog(
    id: string,
  ): Promise<GuestEntryWithToken | null> {
    return await this.accessRepo.findGuestLogById(id);
  }
}

export default AccessControlService;
