import { body } from "express-validator";

export const UpdatePreferenceValidator = [
  body("email").optional().isBoolean().withMessage("Email must be a boolean"),

  body("sms").optional().isBoolean().withMessage("SMS must be a boolean"),

  body("push").optional().isBoolean().withMessage("Push must be a boolean"),

  body("inApp").optional().isBoolean().withMessage("InApp must be a boolean"),

  body("newsletter")
    .optional()
    .isBoolean()
    .withMessage("Newsletter must be a boolean"),
];

export const UpdateNotificationValidator = [
  body("readAt")
    .optional()
    .isISO8601()
    .withMessage("readAt must be a valid date"),
];
