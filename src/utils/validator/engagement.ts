import { body } from "express-validator";
import {
  EngagementType,
  InteractionType,
} from "../../../prisma/generated/prisma";

export const CreateEngagementValidator = [
  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .isString()
    .withMessage("Title must be a string")
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters"),

  body("content")
    .notEmpty()
    .withMessage("Content is required")
    .isString()
    .withMessage("Content must be a string")
    .isLength({ min: 5, max: 2000 })
    .withMessage("Content must be between 5 and 2000 characters"),

  body("type")
    .notEmpty()
    .withMessage("Type is required")
    .isIn(Object.values(EngagementType))
    .withMessage("Invalid engagement type"),

  body("options")
    .optional()
    .isArray()
    .withMessage("Options must be an array")
    .custom((value, { req }) => {
      if (
        req.body.type === EngagementType.poll &&
        (!value || value.length < 2)
      ) {
        throw new Error("Poll must have at least 2 options");
      }
      return true;
    }),

  body("audienceType")
    .notEmpty()
    .withMessage("Audience type is required")
    .isString()
    .withMessage("Audience type must be a string")
    .isIn(["all", "building", "property", "unit", "user"])
    .withMessage("Invalid audience type"),

  body("audienceIds")
    .notEmpty()
    .withMessage("Audience IDs are required")
    .isArray()
    .withMessage("Audience IDs must be an array"),

  body("expiresAt")
    .optional()
    .isISO8601()
    .withMessage("Expires at must be a valid date")
    .custom((value) => {
      if (value && new Date(value) <= new Date()) {
        throw new Error("Expires at must be in the future");
      }
      return true;
    }),
];

export const UpdateEngagementValidator = [
  body("title")
    .optional()
    .isString()
    .withMessage("Title must be a string")
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters"),

  body("content")
    .optional()
    .isString()
    .withMessage("Content must be a string")
    .isLength({ min: 5, max: 2000 })
    .withMessage("Content must be between 5 and 2000 characters"),

  body("expiresAt")
    .optional()
    .custom((value) => {
      if (value === null) return true;
      if (value && new Date(value) <= new Date()) {
        throw new Error("Expires at must be in the future");
      }
      return true;
    }),
];

export const CreateInteractionValidator = [
  body("interactionType")
    .notEmpty()
    .withMessage("Interaction type is required")
    .isIn(Object.values(InteractionType))
    .withMessage("Invalid interaction type"),

  body("content")
    .optional()
    .isString()
    .withMessage("Content must be a string")
    .custom((value, { req }) => {
      if (
        req.body.interactionType === InteractionType.comment &&
        (!value || value.trim() === "")
      ) {
        throw new Error("Comment content is required");
      }
      if (
        req.body.interactionType === InteractionType.vote &&
        (!value || value.trim() === "")
      ) {
        throw new Error("Vote option is required");
      }
      return true;
    }),
];
