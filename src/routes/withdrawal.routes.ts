import express from "express";
import { getAllSavedBanks } from "../controllers/withdrawalController/getBanks";
import { saveWithdrawalBank } from "../controllers/withdrawalController/createBank";
import expressAsyncHandler from "express-async-handler";
import { createWithdrawalBankValidator } from "../utils/validator/withdrawal";
import Validate from "../middleware/validate";
import Authorize from "../middleware/authorization";
import RolesGuard from "../middleware/rolesGuard";
import { Role } from "../../prisma/generated/prisma";

const withdrawalRoutes = express.Router();
withdrawalRoutes.post(
  "/withdrawal-banks",
  Authorize,
  RolesGuard([Role.super_admin, Role.manager]),
  createWithdrawalBankValidator,
  Validate,
  expressAsyncHandler(saveWithdrawalBank)
);
withdrawalRoutes.get(
  "/withdrawal-banks",
  Authorize,
  RolesGuard([Role.super_admin, Role.admin, Role.manager]),
  expressAsyncHandler(getAllSavedBanks)
);

export default withdrawalRoutes;
