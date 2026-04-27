import { body } from "express-validator";

export const LoginValidator = [
  body("identifier")
    .notEmpty()
    .withMessage("Identifier is required")
    .custom((value) => {
      // Check if value is a valid email, phone (en-NG), or string (username)
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      const isPhone = /^(\+234|0)[789][01]\d{8}$/.test(value); // Nigerian phone format
      const isUsername = typeof value === "string" && value.length > 0;
      if (!isEmail && !isPhone && !isUsername) {
        throw new Error(
          "Identifier must be a valid email, phone number, or username"
        );
      }
      return true;
    }),

  body("password").notEmpty().withMessage("Password is required"),
];

export const adminRegisterValidator = [
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
];

export const UpdateMailValidator = [
  body("updates")
    .isArray({ min: 1 })
    .withMessage("Updates must be a non-empty array of strings")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .custom((arr) => arr.every((item: any) => typeof item === "string"))
    .withMessage("Each update must be a string"),
];
