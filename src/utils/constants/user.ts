import { Role } from "../../../prisma/generated/prisma";
import { SortOrder } from "../../types/misc";
import { UserFilter, UserSortByOptions } from "../../types/user";

export const allowedUserSortBy = [
  "firstName",
  "lastName",
  "userName",
  "email",
  "phone",
  "createdAt",
  "updatedAt",
];

export const userFilter = (
  search: string,
  startDate: string,
  endDate: string,
  role?: string,
): UserFilter | undefined => {
  if (!search && !startDate && !endDate && !role) {
    return undefined;
  }

  const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

  // Create base filter
  const filter: UserFilter = {
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
      {
        role: {
          equals: Role[search as Role] ?? undefined,
        },
      },
      {
        createdAt: {
          gte: regex.test(startDate) ? new Date(startDate) : undefined,
          lte: regex.test(endDate) ? new Date(endDate) : undefined,
        },
      },
    ],
  };

  // Add role filter if provided
  if (role && Role[role as Role]) {
    filter.AND = [
      {
        role: {
          equals: Role[role as Role],
        },
      },
    ];
  }

  return filter;
};

export const userSortBy = (
  sortBy: string,
  order: SortOrder,
): UserSortByOptions => {
  return {
    [sortBy]: order,
  };
};
