import { NextFunction, Request, Response } from "express";
import { ForbiddenException } from "../utils/exceptions/customException";
import { Role } from "../../prisma/generated/prisma";

/**
 * A middleware function to guard routes based on user roles.
 * 
 * @param roles - An array of roles (`Role[]`) that are allowed to access the route.
 * 
 * @returns A middleware function that checks if the authenticated user has one of the required roles.
 * 
 * @throws {ForbiddenException} If the user is not authenticated or does not have the required role.
 * 
 * @example
 * ```typescript
 * import { RolesGuard } from './middleware/rolesGuard';
 * 
 * app.use('/admin', RolesGuard([Role.admin]));
 * ```
 */
const RolesGuard = (roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    // Check if the user is authenticated
    if (!user || !user.role) {
      throw new ForbiddenException("You are not authorized to view this page");
    }

    // Check if the user has one of the required roles
    const hasRole = roles.includes(user.role);

    if (!hasRole) {
      throw new ForbiddenException("You are not authorized to view this page");
    }

    next();
  };
};

export default RolesGuard;
