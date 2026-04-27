import express from "express";
import { makePayment } from "../controllers/vendingControllers/makePayment";
import { buyToken } from "../controllers/vendingControllers/buyToken";
import expressAsyncHandler from "express-async-handler";
import {
  buyTokenValidator,
  makePaymentValidator,
} from "../utils/validator/vending";
import Validate from "../middleware/validate";
import RolesGuard from "../middleware/rolesGuard";
import Authorize from "../middleware/authorization";
import { Role } from "../../prisma/generated/prisma";

const vendRoutes = express.Router();

vendRoutes.post(
  "/pay",
  Authorize,
  RolesGuard([Role.super_admin, Role.admin, Role.manager, Role.user, Role.houseowner]),
  makePaymentValidator,
  Validate,
  expressAsyncHandler(makePayment)
);

vendRoutes.post(
  "/token",
  Authorize,
  RolesGuard([Role.super_admin, Role.admin, Role.manager, Role.user, Role.houseowner]),
  buyTokenValidator,
  Validate,
  expressAsyncHandler(buyToken)
);

export default vendRoutes;
