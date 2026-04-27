import {
  MeterStatus,
  MeterType,
  TrxnChannel,
} from "../../prisma/generated/prisma";

export interface MakePaymentDto {
  amount: number;
  meterNumber: string;
  callback_url?: string;
  channel?: TrxnChannel;
}

export interface VerifyMeterDto {
  meterNumber: string;
}

export interface BuyTokenDto {
  trxnRef: string;
}

export interface CreateMeterDto {
  propertyId: string;
  houseId: string;
  ownerId: string;
  type?: MeterType | undefined;
  name?: string;
  number: string;
  price?: number | null;
  vat?: number | null;
  status?: MeterStatus;
}

export interface UpdateMeterDto {
  type?: MeterType;
  name?: string;
  price?: number;
  vat?: number;
  status?: MeterStatus;
}

export interface InitBillPaymentDto extends VendReqDto {
  callback_url?: string;
  channel: TrxnChannel;
}

export interface VendReqDto {
  orderId: string;
  meter: string;
  disco: AirtimeDisco | CableDisco;
  phone: string; // 0801234567
  paymentType: PaymentType;
  vendType: VendType;
  vertical: VendCategory;
  amount: string;
  email: string;
  name: string;
  tariffClass?: string;
}

export enum AirtimeDisco {
  MTN = "MTN",
  GLO = "GLO",
  AIRTEL = "AIRTEL",
  ETISALAT = "9MOBILE",
}

export enum CableDisco {
  DSTV = "DSTV",
  GOTV = "GOTV",
  STARTIMES = "STARTIMES",
}
export enum VendType {
  PREPAID = "PREPAID",
  POSTPAID = "POSTPAID",
}

export enum VendCategory {
  VTU = "VTU",
  TV = "TV",
  DATA = "DATA",
  ELECTRICITY = "ELECTRICITY",
}

export enum PaymentType {
  USSD = "USSD",
  ONLINE = "ONLINE",
  BIZ = "B2B",
}

export interface VendResponseData {
  id: number;
  amountGenerated: number;
  tariff: null;
  debtAmount: number;
  debtRemaining: number;
  disco: string;
  freeUnits: number;
  orderId: string;
  receiptNo: string;
  tax: number;
  vendTime: string;
  token: null;
  totalAmountPaid: number;
  units: number;
  vendAmount: number;
  vendRef: string;
  responseCode: number;
  responseMessage: string;
}

export interface BPBalanceData {
  balance: number;
}

export interface RequeryTxnResponse {
  result: {
    status: boolean;
    data: RequeryTxnResponseData;
  };
}

export interface RequeryTxnResponseData {
  id: number;
  amountGenerated: string;
  disco: string;
  debtAmount: string;
  debtRemaining: string;
  orderId: string;
  receiptNo: string;
  tax: string;
  vendTime: string;
  token: string;
  totalAmountPaid: number;
  units: string;
  vendAmount: string;
  vendRef: string;
  responseCode: number;
  responseMessage: string;
}
export interface BPTxnHistoryData {
  id: number;
  order_id: string;
  phone: string;
  name: string;
  meter_no: string;
  amount: string;
  vend_type: VendType;
  vertical_type: VendCategory;
  disco_code: string;
  payment_status: string;
  vend_status: string;
  order_status: string;
  created_at: string;
  vendResponse: {
    id: number;
    payment_reference: string;
    token: string;
    order_id: number;
    rct_num: string;
    response_message: null;
    meter_category: string;
    amt_electricity: null;
    debt_rem: string;
  };
  walletTransactions: Array<BPWalletTransaction>;
}

interface BPWalletTransaction {
  id: number;
  ref: string;
  amount: string;
  operation: string;
  type: string;
  balance_before: string;
  balance_after: string;
  created_at: string;
}

export interface BPTxnHistory {
  status: string;
  message: string;
  data: Array<BPTxnHistoryData>;
  meta: {
    pages: number;
    total: number;
  };
}

export interface BPCheckMeter {
  error: boolean;
  discoCode: string;
  vendType: VendType;
  meterNo: string;
  minVendAmount: number;
  maxVendAmount: number;
  responseCode: number;
  outstanding: number;
  debtRepayment: number;
  name: string;
  address: string;
  tariff: string;
  tariffClass: string;
}

export interface BPCheckDisco {
  [key: string]: boolean;
}

export interface BPPrice {
  code: string;
  desc: string;
  price: number;
}
export interface BPPriceList {
  status: string;
  message: string;
  data: Array<BPPrice>;
}

export type BPGetResponse =
  | BPBalanceData
  | RequeryTxnResponse
  | BPTxnHistory
  | BPPriceList
  | BPCheckDisco
  | BPCheckMeter;

export interface PaystackPaymentResponse {
  status: string;
  message: string;
  data: PaystackPaymentResponseData;
}

export interface PaystackPaymentResponseData {
  authorization_url: string;
  access_code: string;
  reference: string;
}
