import { body } from "express-validator";

export const restrictUserValidator = [
    body("userId")
        .notEmpty()
        .withMessage("User ID is required")
        .isString()
        .withMessage("User ID must be a string"),
    body("restrictionId")
        .notEmpty()
        .withMessage("Restriction ID is required")
        .isString()
        .withMessage("Restriction ID must be a string"),
];

export const removeRestrictionValidator = [
    body("userId")
        .notEmpty()
        .withMessage("User ID is required")
        .custom((value) => {
            if (typeof value === "string") return true;
            if (Array.isArray(value) && value.every((v) => typeof v === "string")) return true;
            throw new Error("User ID must be a string or an array of strings");
        }),
    body("restrictionType")
        .notEmpty()
        .withMessage("Restriction type is required")
        .isString()
        .withMessage("Restriction type must be a string"),
];
