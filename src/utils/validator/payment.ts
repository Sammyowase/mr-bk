import { body } from "express-validator";

export const addPaymentSplitValidator = [
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isString()
    .withMessage("Name must be a string"),

  body("split_code")
    .notEmpty()
    .withMessage("Split code is required")
    .isString()
    .withMessage("Split code must be a string"),

  body("propertyId")
    .notEmpty()
    .withMessage("Property id is required")
    .isString()
    .withMessage("Property id must be a string"),
];

export const updatePaymentSplitValidator = [
  body("name").optional().isString().withMessage("Name must be a string"),

  body("split_code")
    .optional()
    .isString()
    .withMessage("Split code must be a string"),

  body("propertyId")
    .optional()
    .isString()
    .withMessage("Property id must be a string"),
];


export const createFeeValidator = [
  body("type")
    .notEmpty()
    .withMessage("Type is required")
    .isString()
    .withMessage("Type must be a string"),

  body("rate")
    .notEmpty()
    .withMessage("Rate is required")
    .isFloat({ min: 0, max: 100 })
    .withMessage("Rate must be a decimal number between 0 and 100"),
];

export const updateFeeValidator = [
  body("rate")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("Rate must be a decimal number between 0 and 100"),
];