import { Response } from "express";
import config from "../../configs/app/env";

const ErrorResponseHandler = (
  res: Response,
  status: number = 500,
  message: string,
  stack?: string,
) => {
  res.status(status).json({
    status: "error",
    message: message || "Internal server error",
    stack: config.nodeEnv === "production" ? null : stack,
  });
};

export default ErrorResponseHandler;
