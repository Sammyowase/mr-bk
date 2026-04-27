import {
  House,
  Meter,
  Property,
  Role,
  User,
} from "../../prisma/generated/prisma";
import { MetadataType } from "../utils/http/paginatedResponse";
import { SortOrder } from "./misc";

export interface AddUserMeterDto {
  propertyId: string;
  houseId: string;
  email: string;
  number: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  userName: string;
  phone: string;
  role: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  userName: string;
  phone: string | null;
  role: Role;
}

export interface RegisterResponse {
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  phone: string | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VerifyEmailDto {
  otp: string;
  email: string;
}

export interface UsersWithMetadata {
  data: Omit<User, "password">[];
  metadata: MetadataType;
}

export interface UserFilter {
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
    {
      role: {
        equals: Role;
      };
    },
    {
      createdAt: {
        gte: Date | undefined;
        lte: Date | undefined;
      };
    },
  ];
  AND?: [
    {
      role: {
        equals: Role;
      };
    },
  ];
}

export interface UserSortByOptions {
  [key: string]: SortOrder;
}

export interface Users {
  users: Omit<User, "password">[];
  total: number;
}

export interface ResidentDetailsResponse {
  user: Omit<User, "password">;
  property: Property | null;
  house: House | null;
  meter: Meter | null;
}
