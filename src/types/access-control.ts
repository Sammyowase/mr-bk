import {
  AccessPoint,
  AccessPointType,
  AccessToken,
  AccessType,
  AccessStatus,
  GuestEntry,
  AccessDecision,
  House,
} from "../../prisma/generated/prisma";
import { SortOrder } from "./misc";

export interface AccessPointSortByOptions {
  [key: string]: SortOrder;
}

export interface AccessPointFilter {
  OR: [
    {
      name: {
        contains: string;
      };
    },
    {
      description: {
        contains: string;
      };
    },
    {
      type: {
        equals: AccessPointType | undefined;
      };
    },
    {
      isActive: {
        equals: boolean | undefined;
      };
    },
  ];
  AND?: [
    {
      propertyId: {
        equals: string;
      };
    },
  ];
}

export interface AllAccessPoints {
  points: AccessPoint[];
  total: number;
}

export interface CreateAccessPointDto {
  name: string;
  description?: string;
  type: AccessPointType;
  propertyId: string;
  houseId?: string;
  isActive?: boolean;
}

export interface UpdateAccessPointDto {
  name?: string;
  description?: string;
  type?: AccessPointType;
  isActive?: boolean;
}

export interface GenerateAccessCodeDto {
  accesspointId: string;
  type: AccessType;
  guestName: string;
  guestPhotoUrl?: string;
  validFrom: Date;
  validUntil: Date;
}

export interface AccessTokenSortByOptions {
  [key: string]: SortOrder;
}

export interface AccessTokenFilter {
  AND: [
    {
      accesspointId: {
        equals: string;
      };
    },
    {
      OR?: [
        {
          code: {
            contains: string;
          };
        },
        {
          guestName: {
            contains: string;
          };
        },
        {
          status: {
            equals: AccessStatus | undefined;
          };
        },
      ];
    },
  ];
}

export interface AllAccessTokens {
  tokens: AccessToken[];
  total: number;
}

export interface AssignSecurityRoleDto {
  userId: string;
  propertyId?: string;
  houseId?: string;
}

export interface GenerateQRCodeDto {
  accesspointId: string;
  guestName: string;
  guestPhotoUrl?: string;
  validFrom: Date;
  validUntil: Date;
}

export interface AllGuestLogs {
  logs: GuestEntry[];
  total: number;
}

export interface AllGuestLogsFilter {
  accessPoint?: {
    propertyId: string;
  };
  OR?: Array<{
    accessToken?: {
      guestName?: {
        contains: string;
        mode: "insensitive";
      };
      code?: {
        contains: string;
        mode: "insensitive";
      };
    };
    guestName?: {
      contains: string;
      mode: "insensitive";
    };
  }>;
  createdAt?: {
    gte?: Date;
    lte?: Date;
  };
  accessStatus?: AccessDecision;
}

export interface GuestLogExport extends GuestEntry {
  accessPoint: AccessPoint & {
    House: House | null;
    Property: {
      id: string;
      name: string;
    } | null;
  };
  accessToken: AccessToken;
}

export interface AddGuestLogDto {
  accessTokenId: string;
  guestName: string;
  guestItems?: string;
  securityId: string;
  accessPointId: string;
  photoCapturedUrl?: string;
  entryTime: Date;
  exitTime?: Date;
  accessStatus?: AccessDecision;
}

export interface EntryRequestDto {
  code: string;
  guestItems?: string;
  securityId: string;
  photoCapturedUrl?: string;
  accessStatus: AccessDecision;
}

export interface ExitVerifyDto {
  userId: string;
  guestLogId: string;
  exitTime: Date;
  checked: boolean;
}

export interface UpdateEntryLogDto {
  exitTime: Date;
}

export type AccessTokenWithDetails =
  | (AccessToken & {
      AccessPoint: AccessPoint | (null & { House: Partial<House> });
    })
  | (AccessToken & {
      AccessPoint: AccessPoint;
    });

export type UpdateGuestLogResponse = GuestEntry & { accessPoint: AccessPoint };

export type GuestEntryWithToken = GuestEntry & {
  accessToken: AccessToken;
  accessPoint: AccessPoint & {
    House: House | null;
    Property: {
      id: string;
      name: string;
    } | null;
  };
};
