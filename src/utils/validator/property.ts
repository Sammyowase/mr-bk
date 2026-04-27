import { body } from "express-validator";
import { PropertyType } from "../../../prisma/generated/prisma";

export const createPropertyValidator = [
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isString()
    .withMessage("Name must be a string"),

  body("type")
    .notEmpty()
    .withMessage("Type is required")
    .isString()
    .withMessage("Type must be a string")
    .isIn(Object.values(PropertyType))
    .withMessage(
      `Type must be one of: ${Object.values(PropertyType).join(", ")}`,
    ),

  body("address")
    .notEmpty()
    .withMessage("Address is required")
    .isString()
    .withMessage("Address must be a string"),

  body("city").optional().isString().withMessage("City must be a string"),

  body("state").optional().isString().withMessage("State must be a string"),

  body("country").optional().isString().withMessage("Country must be a string"),

  body("tarrif")
    .notEmpty()
    .withMessage("Tarrif is required")
    .isNumeric()
    .withMessage("Tarrif must be a number")
    .toFloat(),

  body("tax")
    .notEmpty()
    .withMessage("Tax is required")
    .isNumeric()
    .withMessage("Tax must be a number")
    .toFloat(),

  body("minVend")
    .optional()
    .isNumeric()
    .withMessage("Minimum vending amount must be a number")
    .toFloat(),

  body("maxVend")
    .optional()
    .isNumeric()
    .withMessage("Maximum vending amount must be a number")
    .toFloat(),

  body().custom((value) => {
    if (
      value.minVend !== undefined &&
      value.maxVend !== undefined &&
      typeof value.minVend === "number" &&
      typeof value.maxVend === "number"
    ) {
      if (value.minVend > value.maxVend) {
        throw new Error(
          "Minimum vending amount cannot be greater than maximum vending amount",
        );
      } else if (value.minVend < 0 || value.maxVend < 0) {
        throw new Error("Vending amounts must be positive numbers");
      }
    }
    return true;
  }),
];

export const updatePropertyValidator = [
  body("name").optional().isString().withMessage("Name must be a string"),

  body("type")
    .optional()
    .isString()
    .withMessage("Type must be a string")
    .isIn(Object.values(PropertyType))
    .withMessage(
      `Type must be one of: ${Object.values(PropertyType).join(", ")}`,
    ),

  body("address").optional().isString().withMessage("Address must be a string"),

  body("city").optional().isString().withMessage("City must be a string"),

  body("state").optional().isString().withMessage("State must be a string"),

  body("country").optional().isString().withMessage("Country must be a string"),

  body("tarrif")
    .optional()
    .isNumeric()
    .withMessage("Tarrif must be a number")
    .toFloat()
    .custom((v) => {
      if (v < 0) {
        throw new Error("Tarrif must be a positive number");
      }
      if (v < 0.01 || v > 1000000) {
        throw new Error("Tarrif must be between 0.01 and 1,000,000");
      }
      const decimalPart = v.toString().split(".")[1];
      if (decimalPart && decimalPart.length > 2) {
        throw new Error("Tarrif must have at most two decimal places");
      }
      return true;
    }),

  body("tax")
    .optional()
    .isNumeric()
    .withMessage("Tax must be a number")
    .toFloat()
    .custom((v) => {
      if (v < 0) {
        throw new Error("Tax must be a positive number");
      }
      if (v < 0.01 || v > 1000000) {
        throw new Error("Tax must be between 0.01 and 1,000,000");
      }
      const decimalPart = v.toString().split(".")[1];
      if (decimalPart && decimalPart.length > 2) {
        throw new Error("Tax must have at most two decimal places");
      }
      return true;
    }),

  body("minVend")
    .optional()
    .isNumeric()
    .withMessage("Minimum vending amount must be a number")
    .toFloat()
    .custom((v) => {
      if (v < 0) {
        throw new Error("Minimum vending amount must be a positive number");
      }
      if (v < 0 || v > 1000000) {
        throw new Error(
          "Minimum vending amount must be between 0 and 1,000,000",
        );
      }
      const decimalPart = v.toString().split(".")[1];
      if (decimalPart && decimalPart.length > 2) {
        throw new Error(
          "Minimum vending amount must have at most two decimal places",
        );
      }
      return true;
    }),

  body("maxVend")
    .optional()
    .isNumeric()
    .withMessage("Maximum vending amount must be a number")
    .toFloat()
    .custom((v) => {
      if (v < 0) {
        throw new Error("Maximum vending amount must be a positive number");
      }
      if (v < 0 || v > 1000000) {
        throw new Error(
          "Maximum vending amount must be between 0 and 1,000,000",
        );
      }
      const decimalPart = v.toString().split(".")[1];
      if (decimalPart && decimalPart.length > 2) {
        throw new Error(
          "Maximum vending amount must have at most two decimal places",
        );
      }
      return true;
    }),
];

export const addPropertyManagerValidator = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email must be a valid email address"),
  body("propertyId")
    .notEmpty()
    .withMessage("Property ID is required")
    .isString()
    .withMessage("Property ID must be a string"),
];

export const toggleVendingSuspensionValidator = [
  body("isVendingSuspended")
    .notEmpty()
    .withMessage("Vending suspension status is required")
    .isBoolean()
    .withMessage("Vending suspension status must be a boolean"),
];
