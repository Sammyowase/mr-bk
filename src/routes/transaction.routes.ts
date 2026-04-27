import express from "express";
import expressAsyncHandler from "express-async-handler";
import Authorize from "../middleware/authorization";
import RolesGuard from "../middleware/rolesGuard";
import { Role } from "../../prisma/generated/prisma";
import { getAllTransactions } from "../controllers/transactionControllers/getTransactions";

const transactionRoutes = express.Router();

transactionRoutes.get(
  "/",
  Authorize,
  RolesGuard([
    Role.super_admin,
    Role.admin,
    Role.manager,
    Role.user,
    Role.houseowner,
  ]),
  expressAsyncHandler(getAllTransactions)
);

export default transactionRoutes;
