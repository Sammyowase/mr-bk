import { body, param } from "express-validator";
import { HouseType } from "../../../prisma/generated/prisma";

export const createHouseValidator = [
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
    .isIn(Object.values(HouseType))
    .withMessage(`Type must be one of: ${Object.values(HouseType).join(", ")}`),

  body("address")
    .notEmpty()
    .withMessage("Address is required")
    .isString()
    .withMessage("Address must be a string"),
];

export const updateHouseValidator = [
  param("houseId")
    .notEmpty()
    .withMessage("House ID is required")
    .isUUID()
    .withMessage("House ID must be a valid UUID"),

  body("name").optional().isString().withMessage("Name must be a string"),

  body("type")
    .optional()
    .isString()
    .withMessage("Type must be a string")
    .isIn(Object.values(HouseType))
    .withMessage(`Type must be one of: ${Object.values(HouseType).join(", ")}`),

  body("address").optional().isString().withMessage("Address must be a string"),
];
