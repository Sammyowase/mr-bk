import { body } from "express-validator";

export const ForgotPasswordValidator = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email must be a valid email address"),
];

export const ResetPasswordValidator = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email must be a valid email address"),
  body("token").notEmpty().withMessage("Token is required"),
  body("newPassword")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[!@#$%^&*(),.?\":{}|<>]/)
    .withMessage("Password must contain at least one special character")
    .matches(/\d/)
    .withMessage("Password must contain at least one number"),
];

export const RefreshTokenValidator = [
  body("refreshToken")
    .notEmpty()
    .withMessage("Refresh token is required")
    .isString()
    .withMessage("Refresh token must be a string"),
];

export const ChangePasswordValidator = [
body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[!@#$%^&*(),.?\":{}|<>]/)
    .withMessage("Password must contain at least one special character")
    .matches(/\d/)
    .withMessage("Password must contain at least one number"),
];