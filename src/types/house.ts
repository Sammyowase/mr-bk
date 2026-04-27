import { HouseType } from "../../prisma/generated/prisma";

export interface CreateHouseDto {
  name: string;
  type: HouseType;
  address: string;
}

export interface CreateHouseData {
  name: string;
  propertyId: string;
  type: HouseType;
  address: string;
  authorId: string;
}

export interface UpdateHouseDto {
  name?: string;
  type?: HouseType;
  address?: string;
}

export interface HouseResident {
  Meter: {
    Owner: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string | null;
    } | null;
  } | null;
}
