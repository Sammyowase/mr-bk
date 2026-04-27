import {
  AccessPointFilter,
  AccessPointSortByOptions,
  AccessTokenFilter,
  AccessTokenSortByOptions,
  AllGuestLogsFilter,
} from "../../types/access-control";
import { SortOrder } from "../../types/misc";
import {
  AccessPointType,
  AccessStatus,
  AccessDecision,
} from "../../../prisma/generated/prisma";

export const accessPointFilter = (
  search: string,
  propertyId?: string,
): AccessPointFilter => {
  const filter: AccessPointFilter = {
    OR: [
      {
        name: {
          contains: search,
        },
      },
      {
        description: {
          contains: search,
        },
      },
      {
        type: {
          equals: AccessPointType[search as AccessPointType] ?? undefined,
        },
      },
      {
        isActive: {
          equals: Boolean(search),
        },
      },
    ],
  };

  // Add propertyId filter if provided
  if (propertyId) {
    filter.AND = [
      {
        propertyId: {
          equals: propertyId,
        },
      },
    ];
  }

  return filter;
};

export const accessPointSortBy = (
  sortBy: string,
  order: SortOrder,
): AccessPointSortByOptions => {
  return {
    [sortBy]: order,
  };
};

export const allowedAccessPointSortBy = [
  "name",
  "description",
  "type",
  "isActive",
  "createdAt",
];

export const accessTokenFilter = (
  search: string,
  accesspointId: string,
  status?: string,
): AccessTokenFilter => {
  const baseConditions = [
    {
      code: {
        contains: search,
      },
    },
    {
      guestName: {
        contains: search,
      },
    },
  ];

  const orConditions = status
    ? [
        ...baseConditions,
        {
          status: {
            equals: AccessStatus[status as AccessStatus] ?? undefined,
          },
        },
      ]
    : baseConditions;

  return {
    AND: [
      {
        accesspointId: {
          equals: accesspointId,
        },
      },
      {
        OR: orConditions,
      },
    ],
  } as AccessTokenFilter;
};

export const accessTokenWhere = (accesspointId: string, status?: string) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: Record<string, any> = {
    accesspointId: {
      equals: accesspointId,
    },
  };

  if (status) {
    where.status = {
      equals: AccessStatus[status as AccessStatus] ?? undefined,
    };
  }

  return where;
};

export const accessTokenSortBy = (
  sortBy: string,
  order: SortOrder,
): AccessTokenSortByOptions => {
  return {
    [sortBy]: order,
  };
};

export const allowedAccessTokenSortBy = [
  "code",
  "guestName",
  "status",
  "validFrom",
  "validUntil",
  "createdAt",
];

export const guestLogFilter = (
  propertyId?: string,
  search?: string,
  startDate?: string,
  endDate?: string,
  status?: string,
): AllGuestLogsFilter => {
  const filter: AllGuestLogsFilter = {};

  // Property filter
  if (propertyId) {
    filter.accessPoint = {
      propertyId,
    };
  }

  // Search filter (search by guest name or code)
  if (search) {
    filter.OR = [
      {
        accessToken: {
          guestName: {
            contains: search,
            mode: "insensitive",
          },
        },
      },
      {
        accessToken: {
          code: {
            contains: search,
            mode: "insensitive",
          },
        },
      },
      {
        guestName: {
          contains: search,
          mode: "insensitive",
        },
      },
    ];
  }

  // Date range filter
  if (startDate || endDate) {
    filter.createdAt = {};

    if (startDate) {
      filter.createdAt.gte = new Date(startDate);
    }

    if (endDate) {
      filter.createdAt.lte = new Date(endDate);
    }
  }

  // Status filter
  if (status) {
    // Convert string status to AccessDecision enum
    if (status === "granted" || status === "denied" || status === "pending") {
      filter.accessStatus = status as AccessDecision;
    }
  }

  return filter;
};
