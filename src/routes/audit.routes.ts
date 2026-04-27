import express from "express";
import expressAsyncHandler from "express-async-handler";
import Authorize from "../middleware/authorization";
import RolesGuard from "../middleware/rolesGuard";
import { Role } from "../../prisma/generated/prisma";
import { getAllAuditLogs } from "../controllers/auditControllers/getAllAuditLogs";

const auditLogRoutes = express.Router();

auditLogRoutes.get(
  "/logs",
  Authorize,
  RolesGuard([Role.super_admin, Role.admin, Role.manager]),
  expressAsyncHandler(getAllAuditLogs)
);

export default auditLogRoutes;
