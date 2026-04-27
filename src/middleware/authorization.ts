import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/service/token";
import { JwtPayload } from "jsonwebtoken";
import { UnauthorizedException } from "../utils/exceptions/customException";
import { User } from "../../prisma/generated/prisma";
import { userRepo } from "../utils/handler/resolveModule";

const Authorize = async (req: Request, res: Response, next: NextFunction) => {
  // Check if the request has an authorization header
  const authorization = req.headers.authorization;
  if (authorization === undefined) {
    throw new UnauthorizedException("You are not authorized to view this page");
  }

  // Check if the authorization header is in the correct format
  const tokenParts = authorization.split(" ");
  if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
    throw new UnauthorizedException("Invalid authorization format");
  }

  // Extract the token from the authorization header
  const mainToken = tokenParts[1];
  if (!mainToken || mainToken === "") {
    throw new UnauthorizedException("You are not authorized to view this page");
  }

  let decode: string | JwtPayload;
  try {
    // Verify the token using the verifyToken function
    decode = verifyToken(mainToken) as JwtPayload;
  } catch {
    throw new UnauthorizedException("Invalid or expired token");
  }

  // Check if the decoded token contains the required properties
  const user: Omit<User, "password"> | null = await userRepo.findById(
    decode.id,
  );
  if (!user) {
    throw new UnauthorizedException("Please check login credentials again");
  }

  // Store the decoded token in the request object for later use
  req.user = decode;

  next();
};

export default Authorize;
