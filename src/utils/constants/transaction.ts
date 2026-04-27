import { TrxnStatus } from "../../../prisma/generated/prisma";
import {
  AllTransactionsFilter,
  TransactionsOrFilter,
  TransactionWhere,
} from "../../types/transaction";

export const allowedTransactionSortBy = [
  "createdAt",
  "updatedAt",
  "meterNumber",
  "amount",
  "trxnRef",
];

export const transactionsWhere = (date: string): TransactionWhere => {
  return {
    OR: [
      {
        createdAt: {
          gte: new Date(date),
        },
      },
    ],
  };
};

const buildOrFilters = (
  search: string,
  startDate: string,
  endDate: string,
): TransactionsOrFilter => {
  const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
  return [
    {
      meterNumber: {
        contains: search,
      },
    },
    {
      amount: Number.isNaN(parseInt(search, 10))
        ? undefined
        : parseInt(search, 10),
    },
    {
      createdAt: {
        gte: regex.test(startDate) ? new Date(startDate) : undefined,
        lte: regex.test(endDate) ? new Date(endDate) : undefined,
      },
    },
    {
      userId: {
        equals: search,
      },
    },
  ];
};

export const transactionsFilter = (
  propertyId: string,
  search: string,
  startDate: string,
  endDate: string,
  status: string,
): AllTransactionsFilter => {
  if (!propertyId && !search && !startDate && !endDate && !status) {
    return undefined;
  }

  const orFilters = buildOrFilters(search, startDate, endDate);

  if (propertyId && status) {
    if (!search && !startDate && !endDate) {
      return {
        AND: [{ propertyId }, { status: TrxnStatus[status as TrxnStatus] }],
      };
    }
    return {
      AND: [{ propertyId }, { status: TrxnStatus[status as TrxnStatus] }],
      OR: orFilters,
    };
  } else if (status) {
    if (!search && !startDate && !endDate) {
      return { AND: [{ status: TrxnStatus[status as TrxnStatus] }] };
    }
    return {
      AND: [{ status: TrxnStatus[status as TrxnStatus] }],
      OR: orFilters,
    };
  } else if (propertyId) {
    if (!search && !startDate && !endDate) {
      return { AND: [{ propertyId }] };
    }
    return {
      AND: [{ propertyId }],
      OR: orFilters,
    };
  }

  return {
    OR: orFilters,
  };
};

export const transactionExportCol = [
  {
    header: "Facility",
    key: "facility",
    width: 30,
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
  {
    header: "Meter Number",
    key: "meter",
    width: 14,
  },
  {
    header: "Amount (₦)",
    key: "amount",
    width: 14,
  },
  {
    header: "Token Units",
    key: "units",
    width: 10,
  },
  {
    header: "Reference",
    key: "reference",
    width: 15,
  },
  {
    header: "Status",
    key: "status",
    width: 10,
  },
  {
    header: "Date Created",
    key: "created",
    width: 25,
  },
  {
    header: "Date Completed",
    key: "completed",
    width: 25,
  },
  {
    header: "Remark",
    key: "remark",
    width: 23,
  },
];
