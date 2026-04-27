import express from "express";
import expressAsyncHandler from "express-async-handler";
import Validate from "../middleware/validate";
import Authorize from "../middleware/authorization";
import RolesGuard from "../middleware/rolesGuard";
import { Role } from "../../prisma/generated/prisma";
import { getAllRestrictedUsers } from "../controllers/userpermissionControllers/getAllRestrictedUsers";
import { restrictUser } from "../controllers/userpermissionControllers/restrictUser";
import { removeUserRestrictions } from "../controllers/userpermissionControllers/removeUserRestrictions";
import { removeRestriction } from "../controllers/userpermissionControllers/removeRestriction";
import { removeRestrictions } from "../controllers/userpermissionControllers/removeRestrictions";
import {
  removeRestrictionValidator,
  restrictUserValidator,
} from "../utils/validator/userpermission";
import { getAllRestrictions } from "../controllers/userpermissionControllers/getAllRestrictions";

const userPermissionRoutes = express.Router();

userPermissionRoutes.get(
  "/restrictions",
  Authorize,
  expressAsyncHandler(getAllRestrictions)
);

userPermissionRoutes.post(
  "/restrict",
  Authorize,
  RolesGuard([Role.super_admin, Role.admin, Role.manager]),
  restrictUserValidator,
  Validate,
  expressAsyncHandler(restrictUser)
);

userPermissionRoutes.post(
  "/remove-restriction",
  Authorize,
  RolesGuard([Role.super_admin, Role.admin, Role.manager]),
  removeRestrictionValidator,
  Validate,
  expressAsyncHandler(removeRestriction)
);

userPermissionRoutes.delete(
  "/:userId/remove-restrictions",
  Authorize,
  RolesGuard([Role.super_admin]),
  expressAsyncHandler(removeUserRestrictions)
);

userPermissionRoutes.delete(
  "/restrictions/:restrictionId",
  Authorize,
  RolesGuard([Role.super_admin]),
  expressAsyncHandler(removeRestrictions)
);

userPermissionRoutes.get(
  "/restricted-users",
  expressAsyncHandler(getAllRestrictedUsers)
);

export default userPermissionRoutes;
