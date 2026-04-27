import { SortOrder } from "../../types/misc";
import {
  RestrictionFilter,
  RestrictionSortByOptions,
  RestrictionWhere,
} from "../../types/permission";

export const allowedRestrictionSortBy = [
  "user.firstName",
  "user.lastName",
  "user.email",
  "createdAt",
];

export const restrictionFilter = (
  search: string,
  propertyId: string,
): RestrictionFilter => {
  if (propertyId) {
    return {
      AND: [
        {
          User: {
            Meter: {
              some: {
                propertyId,
              },
            },
          },
        },
        {
          OR: [
            {
              User: {
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
        },
      ],
    };
  }

  return {
    OR: [
      {
        User: {
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

export const restrictionSortBy = (
  sortBy: string,
  order: SortOrder,
): RestrictionSortByOptions => {
  const splitSortBy = sortBy.split(".");
  // Sort by user
  if (splitSortBy.length === 2 && splitSortBy[0] === "user") {
    return {
      User: {
        [splitSortBy[1]]: order,
      },
    };
  }
  // Sort by data
  return {
    [sortBy]: order,
  };
};

export const restrictionWhere = (
  userId: string,
  restrictionId: string,
  propertyId: string,
): RestrictionWhere => {
  if (restrictionId) {
    return {
      restrictionId,
    };
  }

  if (userId) {
    return {
      userId,
    };
  }

  if (propertyId) {
    return {
      User: {
        Meter: {
          some: {
            propertyId,
          },
        },
      },
    };
  }

  return undefined;
};
