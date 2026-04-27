import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { UnprocessableEntityException } from "../utils/exceptions/customException";

export default function Validate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const err = validationResult(req);
  if (!err.isEmpty()) {
    throw new UnprocessableEntityException(err.array()[0].msg);
  }

  return next();
}
