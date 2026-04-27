import { body, param, query } from "express-validator";
import {
  AccessDecision,
  AccessPointType,
  AccessType,
} from "../../../prisma/generated/prisma";

export const createAccessPointValidator = [
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isString()
    .withMessage("Name must be a string")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),

  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string")
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),

  body("type")
    .notEmpty()
    .withMessage("Type is required")
    .isString()
    .withMessage("Type must be a string")
    .isIn(Object.values(AccessPointType))
    .withMessage(
      `Type must be one of: ${Object.values(AccessPointType).join(", ")}`,
    ),

  body("propertyId")
    .notEmpty()
    .withMessage("Property is required")
    .isUUID()
    .withMessage("Property ID must be a valid UUID"),

  body("houseId")
    .optional()
    .isUUID()
    .withMessage("House ID must be a valid UUID"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean value"),
];

export const updateAccessPointValidator = [
  param("accesspointId")
    .notEmpty()
    .withMessage("Access point ID is required")
    .isUUID()
    .withMessage("Access point ID must be a valid UUID"),

  body("name")
    .optional()
    .isString()
    .withMessage("Name must be a string")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),

  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string")
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),

  body("type")
    .optional()
    .isString()
    .withMessage("Type must be a string")
    .isIn(Object.values(AccessPointType))
    .withMessage(
      `Type must be one of: ${Object.values(AccessPointType).join(", ")}`,
    ),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean value"),
];

export const deleteAccessPointValidator = [
  param("accesspointId")
    .notEmpty()
    .withMessage("Access point ID is required")
    .isUUID()
    .withMessage("Access point ID must be a valid UUID"),
];

export const generateAccessCodeValidator = [
  body("accesspointId")
    .notEmpty()
    .withMessage("Access point ID is required")
    .isUUID()
    .withMessage("Access point ID must be a valid UUID"),

  body("type")
    .notEmpty()
    .withMessage("Type is required")
    .isString()
    .withMessage("Type must be a string")
    .isIn(Object.values(AccessType))
    .withMessage(
      `Type must be one of: ${Object.values(AccessType).join(", ")}`,
    ),

  body("guestName")
    .notEmpty()
    .withMessage("Guest name is required")
    .isString()
    .withMessage("Guest name must be a string")
    .isLength({ min: 2, max: 100 })
    .withMessage("Guest name must be between 2 and 100 characters"),

  body("guestPhotoUrl")
    .optional()
    .isURL()
    .withMessage("Guest photo URL must be a valid URL"),

  body("validFrom")
    .notEmpty()
    .withMessage("Valid from date is required")
    .isISO8601()
    .withMessage("Valid from must be a valid ISO8601 date")
    .custom((value) => {
      const now = new Date();
      const validFrom = new Date(value);
      if (validFrom < now) {
        throw new Error("Valid from date cannot be in the past");
      }
      return true;
    }),

  body("validUntil")
    .notEmpty()
    .withMessage("Valid until date is required")
    .isISO8601()
    .withMessage("Valid until must be a valid ISO8601 date")
    .custom((value, { req }) => {
      const validFrom = new Date(req.body.validFrom);
      const validUntil = new Date(value);
      if (validUntil <= validFrom) {
        throw new Error("Valid until date must be after valid from date");
      }
      const maxDuration = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
      if (validUntil.getTime() - validFrom.getTime() > maxDuration) {
        throw new Error("Access code validity cannot exceed 30 days");
      }
      return true;
    }),
];

export const getAccessCodesValidator = [
  query("accesspointId")
    .notEmpty()
    .withMessage("Access point ID is required")
    .isUUID()
    .withMessage("Access point ID must be a valid UUID"),

  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("size")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Size must be between 1 and 100"),

  query("sortBy").optional().isString().withMessage("Sort by must be a string"),

  query("order")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("Order must be either 'asc' or 'desc'"),

  query("search").optional().isString().withMessage("Search must be a string"),

  query("status").optional().isString().withMessage("Status must be a string"),
];

export const deleteAccessCodeValidator = [
  param("accesscodeId")
    .notEmpty()
    .withMessage("Access code ID is required")
    .isUUID()
    .withMessage("Access code ID must be a valid UUID"),
];

export const revokeAccessCodeValidator = [
  param("accesscodeId")
    .notEmpty()
    .withMessage("Access code ID is required")
    .isUUID()
    .withMessage("Access code ID must be a valid UUID"),
];

export const assignSecurityRoleValidator = [
  body("userId")
    .notEmpty()
    .withMessage("User ID is required")
    .isUUID()
    .withMessage("User ID must be a valid UUID"),

  body("propertyId")
    .optional()
    .isUUID()
    .withMessage("Property ID must be a valid UUID"),

  body("houseId")
    .optional()
    .isUUID()
    .withMessage("House ID must be a valid UUID"),
];

export const generateQRCodeValidator = [
  body("accesspointId")
    .notEmpty()
    .withMessage("Access point ID is required")
    .isUUID()
    .withMessage("Access point ID must be a valid UUID"),

  body("guestName")
    .notEmpty()
    .withMessage("Guest name is required")
    .isString()
    .withMessage("Guest name must be a string")
    .isLength({ min: 2, max: 100 })
    .withMessage("Guest name must be between 2 and 100 characters"),

  body("guestPhotoUrl")
    .optional()
    .isURL()
    .withMessage("Guest photo URL must be a valid URL"),

  body("validFrom")
    .notEmpty()
    .withMessage("Valid from date is required")
    .isISO8601()
    .withMessage("Valid from must be a valid ISO8601 date")
    .custom((value) => {
      const now = new Date();
      const validFrom = new Date(value);
      if (validFrom < now) {
        throw new Error("Valid from date cannot be in the past");
      }
      return true;
    }),

  body("validUntil")
    .notEmpty()
    .withMessage("Valid until date is required")
    .isISO8601()
    .withMessage("Valid until must be a valid ISO8601 date")
    .custom((value, { req }) => {
      const validFrom = new Date(req.body.validFrom);
      const validUntil = new Date(value);
      if (validUntil <= validFrom) {
        throw new Error("Valid until date must be after valid from date");
      }
      const maxDuration = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
      if (validUntil.getTime() - validFrom.getTime() > maxDuration) {
        throw new Error("Access code validity cannot exceed 30 days");
      }
      return true;
    }),
];

export const getResidentAccessCodesValidator = [
  param("houseId")
    .notEmpty()
    .withMessage("House ID is required")
    .isUUID()
    .withMessage("House ID must be a valid UUID"),

  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("size")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Size must be between 1 and 100"),
];

export const getPropertyAccessCodesValidator = [
  param("propertyId")
    .notEmpty()
    .withMessage("Property ID is required")
    .isUUID()
    .withMessage("Property ID must be a valid UUID"),

  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("size")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Size must be between 1 and 100"),
];

export const verifyAccessCodeValidator = [
  param("token")
    .notEmpty()
    .withMessage("Access code is required")
    .isString()
    .withMessage("Access code must be a valid string")
    .isLength({ min: 6, max: 6 })
    .withMessage("Access code must be 6 characters long"),
];

export const getAllGuestLogsValidator = [
  query("propertyId")
    .optional()
    .isUUID()
    .withMessage("Property ID must be a valid UUID"),

  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("size")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Size must be greater than 1"),

  query("search").optional().isString().withMessage("Search must be a string"),

  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("Start date must be a valid ISO date"),

  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("End date must be a valid ISO date"),

  query("status").optional().isString().withMessage("Status must be a string"),

  query("download")
    .optional()
    .isBoolean()
    .withMessage("Download must be a boolean"),
];

export const guestEntryValidator = [
  body("code")
    .notEmpty()
    .withMessage("Code is required")
    .isString()
    .withMessage("Code must be a string")
    .isLength({ min: 6, max: 7 })
    .withMessage("Code must be between 6 and 7 characters"),

  body("accessStatus")
    .optional()
    .isString()
    .withMessage("Type must be a string")
    .isIn(Object.values(AccessDecision))
    .withMessage(
      `Type must be one of: ${Object.values(AccessDecision).join(", ")}`,
    ),

  body("guestItems")
    .optional()
    .isString()
    .withMessage("Guest Items must be a string")
    .isLength({ min: 2, max: 100 })
    .withMessage("Guest name must be between 2 and 100 characters"),

  body("photoCapturedUrl")
    .optional()
    .isURL()
    .withMessage("Photo captured URL must be a valid URL"),
];

export const guestExitValidator = [
  param("id")
    .notEmpty()
    .withMessage("Guest entry ID is required")
    .isUUID()
    .withMessage("Guest entry ID must be a valid UUID"),

  body("exitTime")
    .notEmpty()
    .withMessage("Exit time is required")
    .isISO8601()
    .withMessage("Exit time must be a valid ISO8601 date")
    .custom((value) => {
      const now = new Date();
      const exitTime = new Date(value);
      if (exitTime < now) {
        throw new Error("Exit time date cannot be in the past");
      }
      return true;
    }),

  body("checked")
    .notEmpty()
    .withMessage("Checked is required")
    .isBoolean()
    .withMessage("Checked must be a boolean"),
];

export const getGuestLogValidator = [
  param("id")
    .notEmpty()
    .withMessage("Guest entry ID is required")
    .isUUID()
    .withMessage("Guest entry ID must be a valid UUID"),
];
