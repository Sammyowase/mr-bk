import { PrismaClientKnownRequestError } from "../../../prisma/generated/prisma/runtime/library";
import { logger } from "../logger/logger";

type PrismaErrorResponse = {
  status: number;
  message: string;
};
/**
 * Handle Prisma errors and return a standardized error response.
 * @param error - The Prisma error to handle.
 * @returns A standardized error response object.
 */
const HandlePrismaError = (error: Error): PrismaErrorResponse => {
  logger.error("Prisma Error: ", error);
  if (error.name === "PrismaClientInitializationError") {
    return {
      status: 500,
      message: `Prisma Client Initialization Error: ${error.message}`,
    };
  }
  if (error.name === "PrismaClientKnownRequestError") {
    const err = error as PrismaClientKnownRequestError;
    switch (err.code) {
      case "P2002":
        return {
          status: 409,
          message: "An error occurred while processing your request",
        };
      case "P2025":
        return {
          status: 404,
          message: `Record not found`,
        };
      case "P2003":
        return {
          status: 400,
          message: "Invalid input data",
        };
      case "P2016":
        return {
          status: 400,
          message: `Invalid input data`,
        };
      case "P2018":
        return {
          status: 400,
          message: `Invalid input data`,
        };
      case "P2020":
        return {
          status: 400,
          message: `Invalid input data`,
        };
      case "P2001":
        return {
          status: 400,
          message: `Invalid input data`,
        };
      case "P2021":
        return {
          status: 400,
          message: `The requested table does not exist`,
        };
      default:
        return {
          status: 500,
          message: `Unknown Prisma error: ${err.message}`,
        };
    }
  }
  if (error.name === "PrismaClientValidationError") {
    return {
      status: 400,
      message: "An error occurred while processing your request",
    };
  }
  return {
    status: 500,
    message: `Unknown error`,
  };
};
export default HandlePrismaError;
