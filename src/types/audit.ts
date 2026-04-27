import { AuditLog, Property, Role, User } from "../../prisma/generated/prisma";
import { SortOrder } from "./misc";

export interface CreateAuditDto {
  userId: string;
  role: string;
  action: string;
  entity?: string;
  description?: string;
  propertyId?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any>;
}

export interface LogAuditDto {
  userId: string;
  action: string;
  model: string;
  description?: string;
  propertyId?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any>;
}

export interface Logs extends AuditLog {
  RelatedProperty: Property | null;
  ActionBy: Omit<User, "password">;
}

export interface AllLogs {
  logs: Logs[];
  total: number;
}

export interface AllLogsSortByOptions {
  [key: string]: SortOrder;
}

export interface AllLogsSortByDoerOptions {
  ActionBy: {
    [key: string]: SortOrder;
  };
}

export type AuditSortByOptions =
  | AllLogsSortByOptions
  | AllLogsSortByDoerOptions;

export interface AllLogsFilter {
  OR: [
    {
      action: {
        contains: string;
      };
    },
    {
      propertyId: {
        equals: string;
      };
    },
    {
      ref: {
        equals: string;
      };
    },
    {
      userId: {
        equals: string;
      };
    },
    {
      ActionBy: {
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

export type AllLogsWhere =
  | {
      role: Role;
    }
  | {
      propertyId: string;
    }
  | {
      userId: string;
    }
  | undefined;
