import { Database } from "../models/database";
import {
  AccessPointFilter,
  AccessPointSortByOptions,
  AllAccessPoints,
  CreateAccessPointDto,
  UpdateAccessPointDto,
  GenerateAccessCodeDto,
  AccessTokenFilter,
  AccessTokenSortByOptions,
  AllAccessTokens,
  AllGuestLogs,
  AllGuestLogsFilter,
  AddGuestLogDto,
  UpdateEntryLogDto,
  UpdateGuestLogResponse,
  GuestLogExport,
  GuestEntryWithToken,
} from "../types/access-control";
import {
  AccessPoint,
  AccessToken,
  GuestEntry,
} from "../../prisma/generated/prisma";
import { injectable } from "tsyringe";

@injectable()
class AccessPointRepository {
  constructor(private db: Database) {}

  public async getAllAccessPoints(
    filter: AccessPointFilter | undefined,
    page: number,
    size: number,
    orderBy: AccessPointSortByOptions,
  ): Promise<AllAccessPoints> {
    // Find all access point
    const points = await this.db.accessPoint.findMany({
      take: size,
      skip: (page - 1) * size,
      orderBy,
      where: filter,
      include: {
        Property: true,
        House: true,
        AccessToken: {
          omit: {
            code: true,
          },
        },
      },
    });
    // Count the total number of access points based on filter
    const total = await this.db.accessPoint.count({
      where: filter,
    });

    return {
      points,
      total,
    };
  }

  public async findById(id: string): Promise<AccessPoint | null> {
    return await this.db.accessPoint.findUnique({
      where: { id },
      include: {
        Property: true,
        House: true,
      },
    });
  }

  public async createAccessPoint(
    dto: CreateAccessPointDto,
  ): Promise<AccessPoint> {
    return await this.db.accessPoint.create({
      data: dto,
      include: {
        Property: true,
        House: true,
      },
    });
  }

  public async updateAccessPoint(
    id: string,
    dto: UpdateAccessPointDto,
  ): Promise<AccessPoint> {
    return await this.db.accessPoint.update({
      where: { id },
      data: dto,
      include: {
        Property: true,
        House: true,
      },
    });
  }

  public async deleteAccessPoint(id: string): Promise<void> {
    await this.db.accessPoint.delete({
      where: { id },
    });
  }

  public async createAccessToken(
    dto: GenerateAccessCodeDto & { code: string; issuedById: string },
  ): Promise<AccessToken> {
    return await this.db.accessToken.create({
      data: {
        code: dto.code,
        type: dto.type,
        issuedById: dto.issuedById,
        guestName: dto.guestName,
        guestPhotoUrl: dto.guestPhotoUrl,
        validFrom: dto.validFrom,
        validUntil: dto.validUntil,
        accesspointId: dto.accesspointId,
      },
      include: {
        issuedBy: {
          omit: {
            password: true,
          },
        },
        AccessPoint: true,
      },
    });
  }

  public async getAllAccessTokens(
    filter: AccessTokenFilter | object,
    page: number,
    size: number,
    orderBy: AccessTokenSortByOptions,
  ): Promise<AllAccessTokens> {
    const tokens = await this.db.accessToken.findMany({
      take: size,
      skip: (page - 1) * size,
      orderBy,
      where: filter,
      include: {
        issuedBy: {
          omit: {
            password: true,
          },
        },
        AccessPoint: true,
      },
    });

    const total = await this.db.accessToken.count({
      where: filter,
    });

    return {
      tokens,
      total,
    };
  }

  public async findAccessTokenById(id: string): Promise<AccessToken | null> {
    return await this.db.accessToken.findUnique({
      where: { id },
      include: {
        issuedBy: {
          omit: {
            password: true,
          },
        },
        AccessPoint: true,
      },
    });
  }

  public async deleteAccessToken(id: string): Promise<void> {
    await this.db.accessToken.delete({
      where: { id },
    });
  }

  public async revokeAccessToken(id: string): Promise<AccessToken> {
    return await this.db.accessToken.update({
      where: { id },
      data: {
        status: "revoked",
      },
      include: {
        issuedBy: {
          omit: {
            password: true,
          },
        },
        AccessPoint: true,
      },
    });
  }

  public async findAccessTokenByCode(code: string) {
    return await this.db.accessToken.findUnique({
      where: { code },
      include: {
        issuedBy: {
          omit: {
            password: true,
          },
        },
        AccessPoint: {
          include: {
            House: {
              omit: {
                authorId: true,
                meterId: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
        },
        guestEntries: true,
      },
    });
  }

  public async checkAccessPointExists(
    name: string,
    propertyId?: string,
    houseId?: string,
  ): Promise<AccessPoint | null> {
    return await this.db.accessPoint.findFirst({
      where: {
        name,
        ...(propertyId && { propertyId }),
        ...(houseId && { houseId }),
      },
    });
  }

  public async getResidentAccessCodes(
    houseId: string,
    page: number,
    size: number,
  ): Promise<AllAccessTokens> {
    const tokens = await this.db.accessToken.findMany({
      take: size,
      skip: (page - 1) * size,
      orderBy: {
        createdAt: "desc",
      },
      where: {
        AccessPoint: {
          houseId,
        },
      },
      include: {
        issuedBy: {
          omit: {
            password: true,
          },
        },
        AccessPoint: true,
      },
    });

    const total = await this.db.accessToken.count({
      where: {
        AccessPoint: {
          houseId,
        },
      },
    });

    return {
      tokens,
      total,
    };
  }

  public async getPropertyAccessCodes(
    propertyId: string,
    page: number,
    size: number,
  ): Promise<AllAccessTokens> {
    const tokens = await this.db.accessToken.findMany({
      take: size,
      skip: (page - 1) * size,
      orderBy: {
        createdAt: "desc",
      },
      where: {
        AccessPoint: {
          propertyId,
        },
      },
      include: {
        issuedBy: {
          omit: {
            password: true,
          },
        },
        AccessPoint: {
          include: {
            House: true,
          },
        },
      },
    });

    const total = await this.db.accessToken.count({
      where: {
        AccessPoint: {
          propertyId,
        },
      },
    });

    return {
      tokens,
      total,
    };
  }

  public async getResidentAccessPoints(
    houseId: string,
    page: number,
    size: number,
  ): Promise<AllAccessPoints> {
    const points = await this.db.accessPoint.findMany({
      take: size,
      skip: (page - 1) * size,
      orderBy: {
        createdAt: "desc",
      },
      where: {
        houseId,
      },
      include: {
        Property: true,
        House: true,
        AccessToken: {
          omit: {
            code: true,
          },
        },
      },
    });

    const total = await this.db.accessPoint.count({
      where: {
        houseId,
      },
    });

    return {
      points,
      total,
    };
  }

  public async getAllGuestLogs(
    filter: AllGuestLogsFilter | undefined,
    page: number,
    size: number,
  ): Promise<AllGuestLogs> {
    const logs = await this.db.guestEntry.findMany({
      take: size,
      skip: (page - 1) * size,
      where: filter,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        accessPoint: {
          include: {
            House: true,
            Property: true,
          },
        },
        accessToken: {
          omit: {
            code: true,
          },
        },
        security: {
          omit: {
            password: true,
          },
        },
      },
    });

    const total = await this.db.guestEntry.count({
      where: filter,
    });

    return {
      logs,
      total,
    };
  }

  public async getAllGuestLogsExport(
    filter: AllGuestLogsFilter | undefined,
  ): Promise<GuestLogExport[]> {
    return (await this.db.guestEntry.findMany({
      where: filter,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        accessPoint: {
          include: {
            House: true,
            Property: true,
          },
        },
        accessToken: true,
        security: {
          omit: {
            password: true,
          },
        },
      },
    })) as unknown as GuestLogExport[];
  }

  public async addGuestLogs(dto: AddGuestLogDto): Promise<GuestEntry> {
    return await this.db.guestEntry.create({
      data: {
        ...dto,
      },
    });
  }

  public async findGuestLogById(
    id: string,
  ): Promise<GuestEntryWithToken | null> {
    return await this.db.guestEntry.findUnique({
      where: {
        id,
      },
      include: {
        accessToken: true,
        accessPoint: {
          include: {
            House: true,
            Property: true,
          },
        },
      },
    });
  }

  public async updateGuestLogExit(
    id: string,
    data: UpdateEntryLogDto,
  ): Promise<UpdateGuestLogResponse> {
    return await this.db.guestEntry.update({
      where: {
        id,
      },
      data,
      include: {
        accessPoint: true,
      },
    });
  }
}

export default AccessPointRepository;
