import { Role } from "../../../prisma/generated/prisma";
import {
  AllLogsFilter,
  AllLogsWhere,
  AuditSortByOptions,
} from "../../types/audit";
import { SortOrder } from "../../types/misc";

export const allowedAuditSortBy = [
  "action",
  "model",
  "description",
  "createdAt",
  "actionby.firstname",
  "actionby.lastname",
  "actionby.email",
];

export const auditFilter = (
  search: string
): AllLogsFilter => {
  return {
    OR: [
      {
        action: {
          contains: search,
        },
      },
      {
        propertyId: {
          equals: search,
        },
      },
      {
        ref: {
          equals: search,
        },
      },
      {
        userId: {
          equals: search,
        },
      },
      {
        ActionBy: {
          OR: [
            {
              email: {
                contains: search,
              },
            },
            {
              firstName: {
                contains: search,
              },
            },
            {
              lastName: {
                contains: search,
              },
            },
          ],
        },
      },
    ],
  };
};

export const auditSortBy = (
  sortBy: string,
  order: SortOrder
): AuditSortByOptions => {
  const splitSortBy = sortBy.split(".");
  // Sort by action doer
  if (splitSortBy.length === 2 && splitSortBy[0] === "actionby") {
    return {
      ActionBy: {
        [splitSortBy[1]]: order,
      },
    };
  }
  // Sort by audit data
  return {
    [sortBy]: order,
  };
};

export const auditWhere = (
  propertyId: string,
  userId: string,
  role: string
): AllLogsWhere => {
  if (role && Object.values(Role).includes(role as Role)) {
    return {
      role: role as Role,
    };
  }
  if (propertyId) {
    return {
      propertyId,
    };
  }

  if (userId) {
    return {
      userId,
    };
  }

  return undefined;
};
