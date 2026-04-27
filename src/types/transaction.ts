import {
  House,
  Property,
  Transaction,
  TrxnChannel,
  TrxnStatus,
  User,
} from "../../prisma/generated/prisma";

export interface CreateTransactionDto {
  userId: string;
  meterNumber: string;
  amount: number;
  propertyId?: string;
  trxnRef: string;
  trxnPayload: string;
  status: TrxnStatus;
  channel: TrxnChannel;
  houseId?: string;
  tokenPayload?: string;
}

export interface TransactionWhere {
  OR: [
    {
      createdAt: {
        gte: Date;
      };
    },
  ];
}

export type TransactionFilter = TransactionWhere | undefined;

export type TransactionsOrFilter = [
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
      gte: Date | undefined;
      lte: Date | undefined;
    };
  },
  {
    userId: {
      equals: string;
    };
  },
];

export interface TransactionsFilter {
  OR: TransactionsOrFilter;
}

export interface PropertyTransactionsWhere {
  AND: [{ propertyId: string }];
}

export interface StatusTransactionsWhere {
  AND: [{ status: TrxnStatus }];
}

export interface PropertyStatusTransactionsWhere {
  AND: [{ propertyId: string }, { status: TrxnStatus }];
}

export interface StatusTransactionsFilter extends StatusTransactionsWhere {
  OR: TransactionsOrFilter;
}

export interface PropertyStatusTransactionsFilter
  extends PropertyStatusTransactionsWhere {
  OR: TransactionsOrFilter;
}

export interface PropertyTransactionsFilter extends PropertyTransactionsWhere {
  OR: TransactionsOrFilter;
}

export type AllTransactionsFilter =
  | TransactionsFilter
  | PropertyTransactionsWhere
  | PropertyTransactionsFilter
  | StatusTransactionsWhere
  | StatusTransactionsFilter
  | PropertyStatusTransactionsWhere
  | PropertyStatusTransactionsFilter
  | undefined;

export interface TransactionExport extends Transaction {
  User: User;
  Property: Property | null;
  House: House | null;
}
