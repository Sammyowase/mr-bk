import express from "express";
import { createProperty } from "../controllers/propertyControllers/createProperty";
import { deleteProperty } from "../controllers/propertyControllers/deleteProperty";
import { updateProperty } from "../controllers/propertyControllers/updateProperty";
import expressAsyncHandler from "express-async-handler";
import {
  addPropertyManagerValidator,
  createPropertyValidator,
  toggleVendingSuspensionValidator,
  updatePropertyValidator,
} from "../utils/validator/property";
import Validate from "../middleware/validate";
import Authorize from "../middleware/authorization";
import RolesGuard from "../middleware/rolesGuard";
import { Role } from "../../prisma/generated/prisma";
import { addPropertyManager } from "../controllers/propertyControllers/addPropertyManager";
import {
  getPropertyOverview,
  getPropertyOverviewByManagerId,
  getPropertyOverviewBySecurityId,
} from "../controllers/propertyControllers/propertyOverview";
import { getPropertyResidents } from "../controllers/propertyControllers/getPropertyResidents";
import { getPropertyResidentsTxns } from "../controllers/propertyControllers/getPropertyTransactions";
import { getAllProperty } from "../controllers/propertyControllers/getAllProperty";
import toggleVendingSuspension from "../controllers/propertyControllers/toggleVendingSuspension";

const propertiesRoutes = express.Router();

propertiesRoutes.get(
  "/:propertyId/overview",
  Authorize,
  RolesGuard([Role.super_admin, Role.admin, Role.manager]),
  expressAsyncHandler(getPropertyOverview),
);

propertiesRoutes.get(
  "/:propertyId/residents",
  Authorize,
  RolesGuard([Role.super_admin, Role.admin, Role.manager]),
  expressAsyncHandler(getPropertyResidents),
);

propertiesRoutes.get(
  "/:propertyId/residents/transactions",
  Authorize,
  RolesGuard([Role.super_admin, Role.admin, Role.manager]),
  expressAsyncHandler(getPropertyResidentsTxns),
);

propertiesRoutes.get(
  "/overview/manager",
  Authorize,
  RolesGuard([Role.super_admin, Role.manager]),
  expressAsyncHandler(getPropertyOverviewByManagerId),
);

propertiesRoutes.get(
  "/overview/security",
  Authorize,
  RolesGuard([Role.security]),
  expressAsyncHandler(getPropertyOverviewBySecurityId),
);

propertiesRoutes.post(
  "/",
  Authorize,
  RolesGuard([Role.super_admin, Role.admin, Role.manager]),
  createPropertyValidator,
  Validate,
  expressAsyncHandler(createProperty),
);
propertiesRoutes.delete(
  "/:id",
  Authorize,
  RolesGuard([Role.super_admin, Role.admin, Role.manager]),
  expressAsyncHandler(deleteProperty),
);
propertiesRoutes.patch(
  "/:id",
  Authorize,
  RolesGuard([Role.super_admin, Role.admin, Role.manager]),
  updatePropertyValidator,
  Validate,
  expressAsyncHandler(updateProperty),
);
propertiesRoutes.get("/", expressAsyncHandler(getAllProperty));
propertiesRoutes.post(
  "/managers",
  addPropertyManagerValidator,
  Validate,
  expressAsyncHandler(addPropertyManager),
);

propertiesRoutes.put(
  "/:id/toggle-vending-suspension",
  Authorize,
  RolesGuard([Role.super_admin, Role.admin, Role.manager]),
  toggleVendingSuspensionValidator,
  Validate,
  expressAsyncHandler(toggleVendingSuspension),
);

export default propertiesRoutes;
