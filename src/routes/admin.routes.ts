import express from "express";
import { registerAdmin } from "../controllers/adminControllers/registerAdmin";
import { loginAdmin } from "../controllers/adminControllers/loginAdmin";
import expressAsyncHandler from "express-async-handler";
import Validate from "../middleware/validate";
import {
  adminRegisterValidator,
  LoginValidator,
  UpdateMailValidator,
} from "../utils/validator/admin";
import Authorize from "../middleware/authorization";
import RolesGuard from "../middleware/rolesGuard";
import { Role } from "../../prisma/generated/prisma";
import { getOverview } from "../controllers/adminControllers/getOverview";
import { sendUpdateMail } from "../controllers/adminControllers/sendUpdatesEmail";

const adminRoutes = express.Router();

adminRoutes.post(
  "/register",
  adminRegisterValidator,
  Validate,
  expressAsyncHandler(registerAdmin)
);
adminRoutes.post(
  "/login",
  LoginValidator,
  Validate,
  expressAsyncHandler(loginAdmin)
);

adminRoutes.get(
  "/overview",
  Authorize,
  RolesGuard([Role.admin, Role.super_admin]),
  expressAsyncHandler(getOverview)
);

adminRoutes.post(
  "/send-update-mail",
  Authorize,
  RolesGuard([Role.admin, Role.super_admin]),
  UpdateMailValidator,
  Validate,
  expressAsyncHandler(sendUpdateMail)
);

export default adminRoutes;
