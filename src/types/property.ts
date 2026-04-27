import {
  Property,
  PropertyType,
  TrxnStatus,
} from "../../prisma/generated/prisma";
import { MetadataType } from "../utils/http/paginatedResponse";
import { SortOrder } from "./misc";

export interface CreatePropertyDto {
  name: string;
  type: PropertyType;
  address: string;
  city?: string;
  state?: string;
  country?: string;
  tarrif: number;
  tax: number;
  minVend?: number;
  maxVend?: number;
  isVendingSuspended?: boolean;
}

export interface AddPropertyManagerDto {
  email: string;
  propertyId: string;
}

export interface PropertyOverview extends Property {
  totalUnits: number;
  totalMeters: number;
  totalOccupiedUnits: number;
  totalActiveMeters: number;
  totalActiveUsers: number;
}

export interface PropertyResidentHouse {
  id: string;
  name: string;
  address: string;
  Meter: {
    number: string;
    id: string;
    name: string | null;
    Owner: {
      id: string;
      createdAt: Date;
      firstName: string;
      lastName: string;
      userName: string;
      email: string;
      phone: string | null;
    } | null;
  } | null;
}

export interface PropertyResidentExport {
  name: string;
  address: string;
  Meter: {
    number: string;
    name: string | null;
    Owner: {
      id: string;
      createdAt: Date;
      firstName: string;
      lastName: string;
      email: string;
      phone: string | null;
    } | null;
  } | null;
}

export interface PropertyResident {
  houses: PropertyResidentHouse[];
  total: number;
}

export interface ResidentFilter {
  propertyId: string;
  AND: [
    {
      Meter: {
        isNot: null;
      };
    },
    {
      Meter: {
        Owner: {
          isNot: null;
        };
      };
    },
    {
      Meter: {
        Owner: {
          deletedAt: null;
        };
      };
    },
    {
      OR: [
        {
          name: {
            contains: string;
          };
        },
        {
          address: {
            contains: string;
          };
        },
        {
          Meter: {
            OR: [
              {
                number: {
                  contains: string;
                };
              },
              {
                Owner: {
                  OR: [
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
                      email: {
                        contains: string;
                      };
                    },
                  ];
                };
              },
            ];
          };
        },
      ];
    },
  ];
}

export interface ResidentWhere {
  propertyId: string;
  AND: [
    {
      Meter: {
        isNot: null;
      };
    },
    {
      Meter: {
        Owner: {
          isNot: null;
        };
      };
    },
    {
      Meter: {
        Owner: {
          deletedAt: null;
        };
      };
    },
  ];
}

export interface ResidentTransactionFilter {
  propertyId: string;
  OR: [
    {
      meterNumber: {
        contains: string;
      };
    },
    {
      amount: number | undefined;
    },
    {
      createdAt: {
        lte: Date | undefined;
      };
    },
    {
      status: {
        equals: TrxnStatus | undefined;
      };
    },
  ];
}

export interface ResidentTransactionWhere {
  propertyId: string;
}

export interface ResidentSortByOwnerOptions {
  Meter: {
    Owner: {
      [key: string]: SortOrder;
    };
  };
}

export interface ResidentSortByHouseOptions {
  [key: string]: SortOrder;
}

export type ResidentSortByOptions =
  | ResidentSortByHouseOptions
  | ResidentSortByOwnerOptions;

export interface PropertiesWithMetadata {
  data: PropertyWithManager[];
  metadata: MetadataType;
}

export interface PropertySortByOptions {
  [key: string]: SortOrder;
}

export interface Properties {
  properties: PropertyWithManager[];
  total: number;
}

export interface PropertyWithManager extends Property {
  Manager: {
    id: string;
    createdAt: Date;
    firstName: string;
    lastName: string;
    userName: string;
    email: string;
    phone: string | null;
  } | null;
}

export interface PropertyFilter {
  OR: [
    {
      name: {
        contains: string;
      };
    },
    {
      tarrif: number | undefined;
    },
    {
      Manager: {
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

export interface PropertyResidentId {
  Meter: {
    ownerId: string | null;
  } | null;
}

export interface ToggleVendingSuspensionDto {
  isVendingSuspended: boolean;
}
