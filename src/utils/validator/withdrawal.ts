import { body } from "express-validator";

export const createWithdrawalBankValidator = [
  body("account_name")
    .notEmpty()
    .withMessage("Account name is required")
    .isString()
    .withMessage("Account name must be a string"),
  body("account_number")
    .notEmpty()
    .withMessage("Account number is required")
    .isString()
    .withMessage("Account number must be a string"),
  body("bank_code")
    .notEmpty()
    .withMessage("Bank code is required")
    .isString()
    .withMessage("Bank code must be a string"),
  body("bank_name")
    .notEmpty()
    .withMessage("Bank name is required")
    .isString()
    .withMessage("Bank name must be a string"),
];
