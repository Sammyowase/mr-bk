import { body, param, query } from "express-validator";
import {
  MeterStatus,
  MeterType,
  TrxnChannel,
} from "../../../prisma/generated/prisma";
import {
  AirtimeDisco,
  CableDisco,
  PaymentType,
  VendCategory,
  VendType,
} from "../../types/vending";

export const buyTokenValidator = [
  body("trxnRef")
    .notEmpty()
    .withMessage("trxnRef is required")
    .isString()
    .withMessage("trxnRef must be a string"),
];

export const makePaymentValidator = [
  body("amount")
    .notEmpty()
    .withMessage("Amount is required")
    .isNumeric()
    .withMessage("Amount must be a number"),
  body("meterNumber")
    .notEmpty()
    .withMessage("Meter number is required")
    .isString()
    .withMessage("Meter number must be a string"),
  body("callback_url")
    .optional()
    .isString()
    .withMessage("Callback URL must be a string"),
];

export const verifyMeterValidator = [
  body("meterNumber")
    .notEmpty()
    .withMessage("Meter number is required")
    .isString()
    .withMessage("Meter number must be a string"),
];

export const makeBillPaymentValidator = [
  body("callback_url")
    .optional()
    .isString()
    .withMessage("Callback URL must be a string"),

  body("channel")
    .notEmpty()
    .withMessage("Channel is required")
    .isIn(Object.values(TrxnChannel))
    .withMessage(
      `Channel must be one of: ${Object.values(TrxnChannel).join(", ")}`,
    ),

  body("orderId")
    .notEmpty()
    .withMessage("Order ID is required")
    .isString()
    .withMessage("Order ID must be a string"),

  body("meter")
    .notEmpty()
    .withMessage("Meter is required")
    .isString()
    .withMessage("Meter must be a string"),

  body("disco")
    .notEmpty()
    .withMessage("Disco is required")
    .isIn([...Object.values(AirtimeDisco), ...Object.values(CableDisco)])
    .withMessage(
      `Disco must be one of: ${[...Object.values(AirtimeDisco), ...Object.values(CableDisco)].join(", ")}`,
    ),

  body("phone")
    .notEmpty()
    .withMessage("Phone is required")
    .isString()
    .withMessage("Phone must be a string")
    .matches(/^\d{10,11}$/)
    .withMessage("Phone must be a valid Nigerian phone number"),

  body("paymentType")
    .notEmpty()
    .withMessage("Payment type is required")
    .isIn(Object.values(PaymentType))
    .withMessage(
      `Payment type must be one of: ${Object.values(PaymentType).join(", ")}`,
    ),

  body("vendType")
    .notEmpty()
    .withMessage("Vend type is required")
    .isIn(Object.values(VendType))
    .withMessage(
      `Vend type must be one of: ${Object.values(VendType).join(", ")}`,
    ),

  body("vertical")
    .notEmpty()
    .withMessage("Vertical is required")
    .isIn(Object.values(VendCategory))
    .withMessage(
      `Vertical must be one of: ${Object.values(VendCategory).join(", ")}`,
    ),

  body("amount")
    .notEmpty()
    .withMessage("Amount is required")
    .isNumeric()
    .withMessage("Amount must be a number"),

  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email must be a valid email address"),

  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isString()
    .withMessage("Name must be a string"),

  body("tariffClass")
    .optional()
    .isString()
    .withMessage("Tariff class must be a string"),
];

export const requeryBPValidator = [
  param("orderId")
    .notEmpty()
    .withMessage("Order ID is required")
    .isString()
    .withMessage("Order ID must be a string"),
];

export const getBPHistoryValidator = [
  query("size")
    .notEmpty()
    .withMessage("Size is required")
    .isNumeric()
    .withMessage("Size must be a number"),

  query("start")
    .notEmpty()
    .withMessage("Start is required")
    .isISO8601()
    .withMessage("Start must be a valid ISO8601 date"),

  query("end")
    .notEmpty()
    .withMessage("End is required")
    .isISO8601()
    .withMessage("End must be a valid ISO8601 date"),
];

export const getProductListValidator = [
  query("vertical")
    .notEmpty()
    .withMessage("Vertical is required")
    .isIn(Object.values(VendCategory))
    .withMessage(
      `Vertical must be one of: ${Object.values(VendCategory).join(", ")}`,
    ),

  query("provider")
    .notEmpty()
    .withMessage("Provider is required")
    .isString()
    .withMessage("Provider must be a string"),
];

export const getMeterStatusValidator = [
  query("vertical")
    .notEmpty()
    .withMessage("Vertical is required")
    .isIn(Object.values(VendCategory))
    .withMessage(
      `Vertical must be one of: ${Object.values(VendCategory).join(", ")}`,
    ),

  query("disco")
    .notEmpty()
    .withMessage("Disco is required")
    .isString()
    .withMessage("Disco must be a string"),

  query("vendType")
    .notEmpty()
    .withMessage("Vend type is required")
    .isIn(Object.values(VendType))
    .withMessage(
      `Vend type must be one of: ${Object.values(VendType).join(", ")}`,
    ),

  query("meterNumber")
    .notEmpty()
    .withMessage("Meter number is required")
    .isNumeric()
    .withMessage("Meter number must be a number"),
];

export const updateMeterValidator = [
  param("meterId")
    .notEmpty()
    .withMessage("Meter ID is required")
    .isUUID()
    .withMessage("Meter ID must be a valid UUID"),

  body("type")
    .optional()
    .isIn(Object.values(MeterType))
    .withMessage(`Type must be one of: ${Object.values(MeterType).join(", ")}`),

  body("name").optional().isString().withMessage("Name must be a string"),

  body("price").optional().isNumeric().withMessage("Price must be a number"),

  body("vat").optional().isNumeric().withMessage("VAT must be a number"),

  body("status")
    .optional()
    .isIn(Object.values(MeterStatus))
    .withMessage(
      `Status must be one of: ${Object.values(MeterStatus).join(", ")}`,
    ),
];
