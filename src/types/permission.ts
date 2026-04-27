import {
  Restriction,
  User,
  UserRestriction,
} from "../../prisma/generated/prisma";
import { SortOrder } from "./misc";

export interface RestrictUserDto {
  userId: string;
  restrictionId: string;
}

export interface RemoveRestrictionDto {
  userId: string | string[];
  restrictionType: string;
}
export interface UserRestrictions {
  users: UsersRestriction[];
  total: number;
}

export interface UsersRestriction extends UserRestriction {
  User: Omit<User, "password">;
  Restriction: Restriction;
}

export type RestrictionWhere =
  | {
      restrictionId: string;
    }
  | {
      userId: string;
    }
  | {
      User: {
        Meter: {
          some: {
            propertyId: string;
          };
        };
      };
    }
  | undefined;

export interface RestrictionSortOptions {
  [key: string]: SortOrder;
}

export interface RestrictionSortByUserOptions {
  User: {
    [key: string]: SortOrder;
  };
}

export type RestrictionSortByOptions =
  | RestrictionSortOptions
  | RestrictionSortByUserOptions;

export interface RestrictionFilterWithProperty {
  AND: [
    {
      User: {
        Meter: {
          some: {
            propertyId: string;
          };
        };
      };
    },
    {
      OR: [
        {
          User: {
            OR: [
              {
                email: {
                  contains: string;
                };
              },
              {
                firstName: {
                  contains: string;
                };
              },
              {
                lastName: {
                  contains: string;
                };
              },
            ];
          };
        },
      ];
    },
  ];
}

export interface RestrictionFilterWithOutProperty {
  OR: [
    {
      User: {
        OR: [
          {
            email: {
              contains: string;
            };
          },
          {
            firstName: {
              contains: string;
            };
          },
          {
            lastName: {
              contains: string;
            };
          },
        ];
      };
    },
  ];
}

export type RestrictionFilter =
  | RestrictionFilterWithOutProperty
  | RestrictionFilterWithProperty;
