import { nanoid } from "nanoid";
import { TrxnType } from "../../../../prisma/generated/prisma";
import {
  AirtimeDisco,
  CableDisco,
  PaymentType,
  VendCategory,
  VendReqDto,
  VendType,
} from "../../../types/vending";

export const billsTestData: Array<[VendReqDto, TrxnType]> = [
  [
    {
      meter: "08000000000",
      disco: AirtimeDisco.MTN,
      phone: "08000000000",
      paymentType: PaymentType.BIZ,
      vendType: VendType.PREPAID,
      vertical: VendCategory.VTU,
      amount: "100",
      email: "test@example.com",
      name: "John Doe",
      orderId: nanoid(15),
    },
    TrxnType.airtime,
  ],
  [
    {
      meter: "12345678910",
      disco: "ABUJA" as CableDisco,
      phone: "08000000000",
      paymentType: PaymentType.BIZ,
      vendType: VendType.PREPAID,
      vertical: VendCategory.ELECTRICITY,
      amount: "500",
      email: "test@example.com",
      name: "John Doe",
      orderId: nanoid(15),
    },
    TrxnType.electricity,
  ],
  //   [
  //     {
  //       meter: "08000000000",
  //       disco: AirtimeDisco.MTN,
  //       phone: "08000000000",
  //       paymentType: PaymentType.BIZ,
  //       vendType: VendType.PREPAID,
  //       vertical: VendCategory.DATA,
  //       amount: "1000",
  //       email: "test@example.com",
  //       name: "John Doe",
  //       orderId: nanoid(15),
  //       tariffClass: "TMSIE20"
  //     },
  //     TrxnType.internet,
  //   ],
  //   [
  //     {
  //       meter: "8093245829",
  //       disco: CableDisco.DSTV,
  //       phone: "08000000000",
  //       paymentType: PaymentType.BIZ,
  //       vendType: VendType.PREPAID,
  //       vertical: VendCategory.TV,
  //       amount: "17150",
  //       email: "test@example.com",
  //       name: "John Doe",
  //       orderId: nanoid(15),
  //     },
  //     TrxnType.tv,
  //   ],
];
