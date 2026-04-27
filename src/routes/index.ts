import express from "express";
import { index } from "../controllers";
import { swaggerUi, swaggerSpec } from "../docs/swagger";
import propertiesRoutes from "./property.routes";
import userRoutes from "./user.routes";
import adminRoutes from "./admin.routes";
import refreshToken from "../controllers/refreshToken";
import HousesRoutes from "./house.routes";
import { forgetPassword } from "../controllers/forgetPassword";
import { resetPassword } from "../controllers/resetPassword";
import vendRoutes from "./vend.routes";
import meterRoutes from "./meter.routes";
import { webhook } from "../controllers/paystack/payment";
import withdrawalRoutes from "./withdrawal.routes";
import expressAsyncHandler from "express-async-handler";
import {
  ChangePasswordValidator,
  ForgotPasswordValidator,
  RefreshTokenValidator,
  ResetPasswordValidator,
} from "../utils/validator/auth";
import Validate from "../middleware/validate";
import paymentRoutes from "./payment.routes";
import auditLogRoutes from "./audit.routes";
import userPermissionRoutes from "./userpermission.route";
import transactionRoutes from "./transaction.routes";
import { changePassword } from "../controllers/authControllers/changePassword";
import Authorize from "../middleware/authorization";
import accessPointRoutes from "./access-point.routes";
import billsRoutes from "./bills.routes";
import notificationRoutes from "./notification.routes";
import alertRoutes from "./alert.routes";
import engagementRoutes from "./engagement.routes";
import { startCron } from "../controllers/startCron";
import healthCheck from "../controllers/systemControllers/healthcheck";

const indexRoutes = express.Router();

indexRoutes.get("/", index);

indexRoutes.get("/health", expressAsyncHandler(healthCheck));

indexRoutes.get("/start-cron", expressAsyncHandler(startCron));

indexRoutes.post(
  "/refresh-token",
  RefreshTokenValidator,
  Validate,
  expressAsyncHandler(refreshToken),
);

indexRoutes.post(
  "/forget-password",
  ForgotPasswordValidator,
  Validate,
  expressAsyncHandler(forgetPassword),
);

indexRoutes.post(
  "/reset-password",
  ResetPasswordValidator,
  Validate,
  expressAsyncHandler(resetPassword),
);

indexRoutes.post(
  "/change-password",
  Authorize,
  ChangePasswordValidator,
  Validate,
  expressAsyncHandler(changePassword),
);
indexRoutes.post("/paystack/webhook", expressAsyncHandler(webhook));
indexRoutes.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
indexRoutes.use("/properties", propertiesRoutes);
indexRoutes.use("/payments", paymentRoutes);
indexRoutes.use("/meter", meterRoutes);
indexRoutes.use("/users", userRoutes);
indexRoutes.use("/admin", adminRoutes);
indexRoutes.use("/houses", HousesRoutes);
indexRoutes.use("/vend", vendRoutes);
indexRoutes.use("/wallets", withdrawalRoutes);
indexRoutes.use("/audit", auditLogRoutes);
indexRoutes.use("/user-permissions", userPermissionRoutes);
indexRoutes.use("/transactions", transactionRoutes);
indexRoutes.use("/access-points", accessPointRoutes);
indexRoutes.use("/bills", billsRoutes);
indexRoutes.use("/notifications", notificationRoutes);
indexRoutes.use("/alerts", alertRoutes);
indexRoutes.use("/engagement", engagementRoutes);
export default indexRoutes;
