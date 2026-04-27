import { TrxnStatus } from "../../../prisma/generated/prisma";
import { SortOrder } from "../../types/misc";
import {
  PropertyFilter,
  PropertySortByOptions,
  ResidentFilter,
  ResidentSortByOptions,
  ResidentTransactionFilter,
  ResidentTransactionWhere,
  ResidentWhere,
} from "../../types/property";

export const allowedPropertySortBy = [
  "name",
  "address",
  "city",
  "state",
  "country",
  "tarrif",
];

export const residentFilter = (
  search: string,
  propertyId: string,
): ResidentFilter => {
  return {
    propertyId,
    AND: [
      {
        Meter: {
          isNot: null,
        },
      },
      {
        Meter: {
          Owner: {
            isNot: null,
          },
        },
      },
      {
        Meter: {
          Owner: {
            deletedAt: null,
          },
        },
      },
      {
        OR: [
          {
            name: {
              contains: search,
            },
          },
          {
            address: {
              contains: search,
            },
          },
          {
            Meter: {
              OR: [
                {
                  number: {
                    contains: search,
                  },
                },
                {
                  Owner: {
                    OR: [
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
                        email: {
                          contains: search,
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    ],
  };
};

export const residentWhere = (propertyId: string): ResidentWhere => {
  return {
    propertyId,
    AND: [
      {
        Meter: {
          isNot: null,
        },
      },
      {
        Meter: {
          Owner: {
            isNot: null,
          },
        },
      },
      {
        Meter: {
          Owner: {
            deletedAt: null,
          },
        },
      },
    ],
  };
};

export const residentTransactionFilter = (
  propertyId: string,
  search: string,
): ResidentTransactionFilter => {
  // Regex for date validation
  const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
  return {
    propertyId,
    OR: [
      {
        meterNumber: {
          contains: search,
        },
      },
      {
        // Search parameter must be a valid number to filter with number
        amount: Object.is(NaN, parseInt(search, 10))
          ? undefined
          : parseInt(search, 10),
      },
      {
        // Search parameter must be a valid date string to filter with date
        createdAt: {
          lte: regex.test(search) ? new Date(search) : undefined,
        },
      },
      {
        status: {
          equals: TrxnStatus[search as TrxnStatus] ?? undefined,
        },
      },
    ],
  };
};

export const residentTransactionWhere = (
  propertyId: string,
): ResidentTransactionWhere => {
  return {
    propertyId,
  };
};

export const residentSortBy = (
  sortBy: string,
  order: SortOrder,
): ResidentSortByOptions => {
  const splitSortBy = sortBy.split(".");
  // Sort by owner
  if (splitSortBy.length === 2 && splitSortBy[0] === "owner") {
    return {
      Meter: {
        Owner: {
          [splitSortBy[1]]: order,
        },
      },
    };
  }
  // Sort by house
  return {
    [sortBy]: order,
  };
};

export const propertyFilter = (search: string): PropertyFilter => {
  return {
    OR: [
      {
        name: {
          contains: search,
        },
      },
      {
        tarrif: Object.is(NaN, parseInt(search, 10))
          ? undefined
          : parseInt(search, 10),
      },
      {
        Manager: {
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

export const propertySortBy = (
  sortBy: string,
  order: SortOrder,
): PropertySortByOptions => {
  //  Sort by property
  return {
    [sortBy]: order,
  };
};

export const residentExportCol = [
  {
    header: "First name",
    key: "firstname",
    width: 20,
  },
  {
    header: "Last name",
    key: "lastname",
    width: 20,
  },
  {
    header: "Unit",
    key: "unit",
    width: 15,
  },
  {
    header: "Email",
    key: "email",
    width: 30,
  },
  { header: "Phone", key: "phone", width: 20 },
  {
    header: "Meter Number",
    key: "meter",
    width: 14,
  },
  {
    header: "Joined Date",
    key: "joined",
    width: 10,
  },
];
