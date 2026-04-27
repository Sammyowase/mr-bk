import { body, param, query } from "express-validator";
import { Role } from "../../../prisma/generated/prisma";

export const VerifyEmailValidator = [
  body("otp")
    .notEmpty()
    .withMessage("OTP is required")
    .isString()
    .withMessage("OTP must be a string"),
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email must be a valid email address"),
];

export const AddUserMeterValidator = [
  body("propertyId")
    .notEmpty()
    .withMessage("Property ID is required")
    .isString()
    .withMessage("Property ID must be a string"),

  body("houseId")
    .notEmpty()
    .withMessage("House ID is required")
    .isString()
    .withMessage("House ID must be a string"),

  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email must be a valid email address"),

  body("number")
    .notEmpty()
    .withMessage("Number is required")
    .isString()
    .withMessage("Number must be a string"),
];

export const RegisterValidator = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email must be a valid email address"),

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

  body("firstName")
    .notEmpty()
    .withMessage("First name is required")
    .isString()
    .withMessage("First name must be a string"),

  body("lastName")
    .notEmpty()
    .withMessage("Last name is required")
    .isString()
    .withMessage("Last name must be a string"),

  body("userName")
    .notEmpty()
    .withMessage("Username is required")
    .isString()
    .withMessage("Username must be a string"),

  body("phone")
    .notEmpty()
    .withMessage("Phone number is required")
    .isMobilePhone("en-NG")
    .withMessage("Phone number must be a valid mobile number"),

  body("role")
    .notEmpty()
    .withMessage("Role is required")
    .isString()
    .withMessage("Role must be a string")
    .isIn(Object.values(Role))
    .withMessage(`Role must be one of: ${Object.values(Role).join(", ")}`),
];

export const UpdateUserValidator = [
  body("email")
    .optional()
    .isEmail()
    .withMessage("Email must be a valid email address"),

  body("firstName")
    .optional()
    .isString()
    .withMessage("First name must be a string"),

  body("lastName")
    .optional()
    .isString()
    .withMessage("Last name must be a string"),

  body("userName")
    .optional()
    .isString()
    .withMessage("Username must be a string"),

  body("phone")
    .optional()
    .isMobilePhone("en-NG")
    .withMessage("Phone number must be a valid mobile number"),

  body("role")
    .optional()
    .isString()
    .withMessage("Role must be a string")
    .isIn(Object.values(Role))
    .withMessage(`Role must be one of: ${Object.values(Role).join(", ")}`),

  body("password")
    .optional()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[!@#$%^&*(),.?\":{}|<>]/)
    .withMessage("Password must contain at least one special character")
    .matches(/\d/)
    .withMessage("Password must contain at least one number"),
];

export const CompleteRegistrationValidator = [
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

  body("firstName")
    .notEmpty()
    .withMessage("First name is required")
    .isString()
    .withMessage("First name must be a string"),

  body("lastName")
    .notEmpty()
    .withMessage("Last name is required")
    .isString()
    .withMessage("Last name must be a string"),

  body("phone")
    .notEmpty()
    .withMessage("Phone number is required")
    .isMobilePhone("en-NG")
    .withMessage("Phone number must be a valid mobile number"),

  body("role")
    .default(Role.security)
    .optional()
    .isString()
    .withMessage("Role must be a string")
    .isIn(Object.values(Role))
    .withMessage(`Role must be one of: ${Object.values(Role).join(", ")}`),

  body("token")
    .notEmpty()
    .withMessage("Token is required")
    .isString()
    .withMessage("Token must be a string"),
];

export const InviteUserValidator = [
  body("propertyId")
    .notEmpty()
    .withMessage("Property ID is required")
    .isUUID()
    .withMessage("Property ID must be a valid UUID"),

  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email must be a valid email address"),
];

export const GetUserDetailsValidator = [
  param("id")
    .notEmpty()
    .withMessage("User ID is required")
    .isUUID()
    .withMessage("User ID must be a valid UUID"),
];

export const DeleteUserValidator = [
  param("id")
    .notEmpty()
    .withMessage("User ID is required")
    .isUUID()
    .withMessage("User ID must be a valid UUID"),
];

export const RestoreUserValidator = [
  param("id")
    .notEmpty()
    .withMessage("User ID is required")
    .isUUID()
    .withMessage("User ID must be a valid UUID"),
];

export const GetResidentDetailsValidator = [
  param("userId")
    .notEmpty()
    .withMessage("User ID is required")
    .isUUID()
    .withMessage("User ID must be a valid UUID"),
];

export const GetResidentDetailsByQueryValidator = [
  query("residentId")
    .notEmpty()
    .withMessage("Resident ID is required")
    .isUUID()
    .withMessage("Resident ID must be a valid UUID")
    .withMessage(
      "Resident ID must be the Owner.id from the property residents endpoint",
    ),
];
