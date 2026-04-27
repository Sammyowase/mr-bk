/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { HttpException } from "../utils/exceptions/httpException";
import ErrorStackParser from "error-stack-parser";
import discordLogger from "../utils/logger/discordLogger";
import ErrorResponseHandler from "../utils/http/errorResponseHandler";
import HandlePrismaError from "../utils/handler/prisma-error.handler";
import config from "../configs/app/env";

const ErrorHandler = async (
  err: Error | HttpException,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof HttpException) {
    ErrorResponseHandler(res, err.status, err.message, err.stack);
    return;
  }

  if (
    err.name === "PrismaClientKnownRequestError" ||
    err.name === "PrismaClientInitializationError" ||
    err.name === "PrismaClientValidationError"
  ) {
    const { status, message } = HandlePrismaError(err);
    ErrorResponseHandler(res, status, message, err.stack);
    return;
  }

  // Only log the error to Discord if the environment is production
  if (config.nodeEnv === "production") {
    const stackFrame = ErrorStackParser.parse(err as Error)[0];
    const moduleName = stackFrame.fileName?.split("mr-web-backend")[1];
    const lineNumber = stackFrame.lineNumber;
    // Create a custom error message for the logger
    const loggerMessage = `Error in ${moduleName} at line ${lineNumber}: ${err.message}`;
    // Log the error to Discord
    await discordLogger.logError(
      loggerMessage,
      (err.stack || "").split("\n").slice(0, 2).join("\n"),
    );
  }

  ErrorResponseHandler(res, 500, err.message, err.stack);
};

export default ErrorHandler;
