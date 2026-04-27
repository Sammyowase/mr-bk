import express from "express";
import expressAsyncHandler from "express-async-handler";
import Authorize from "../middleware/authorization";
import RolesGuard from "../middleware/rolesGuard";
import { Role } from "../../prisma/generated/prisma";
import { resolvePendingTransactions } from "../controllers/paymentController/resolvePendingTxn";
import { addPaymentSplit } from "../controllers/paymentController/addPaymentSplit";
import Validate from "../middleware/validate";
import {
  addPaymentSplitValidator,
  createFeeValidator,
  updateFeeValidator,
  updatePaymentSplitValidator,
} from "../utils/validator/payment";
import { updatePaymentSplit } from "../controllers/paymentController/updatePaymentSplit";
import { updatePaymentFee } from "../controllers/paymentController/updatePaymentFee";
import { addPaymentFee } from "../controllers/paymentController/addPaymentFee";
import { getAllPaymentFees } from "../controllers/paymentController/getAllPaymentFees";

const paymentRoutes = express.Router();

paymentRoutes.get(
  "/resolve-pending",
  Authorize,
  RolesGuard([Role.super_admin, Role.admin]),
  expressAsyncHandler(resolvePendingTransactions)
);

paymentRoutes.post(
  "/split",
  Authorize,
  RolesGuard([Role.super_admin, Role.admin]),
  addPaymentSplitValidator,
  Validate,
  expressAsyncHandler(addPaymentSplit)
);

paymentRoutes.patch(
  "/split/:id",
  Authorize,
  RolesGuard([Role.super_admin, Role.admin]),
  updatePaymentSplitValidator,
  Validate,
  expressAsyncHandler(updatePaymentSplit)
);

paymentRoutes.patch(
  "/fee/:id",
  Authorize,
  RolesGuard([Role.super_admin]),
  updateFeeValidator,
  Validate,
  expressAsyncHandler(updatePaymentFee)
);

paymentRoutes.post(
  "/fee",
  Authorize,
  RolesGuard([Role.super_admin]),
  createFeeValidator,
  Validate,
  expressAsyncHandler(addPaymentFee)
);

paymentRoutes.get(
  "/fees",
  Authorize,
  RolesGuard([Role.super_admin, Role.admin]),
  expressAsyncHandler(getAllPaymentFees)
);

export default paymentRoutes;
