import express from "express";
import { getUserMeter } from "../controllers/meterControllers/getUserMeter";
import { verifyMeter } from "../controllers/meterControllers/verifyMeter";
import { updateMeter } from "../controllers/meterControllers/updateMeter";
import { getAllMeters } from "../controllers/meterControllers/getAllMeters";
import { getMetersByPropertyId } from "../controllers/meterControllers/getMetersByPropertyId";
import { searchMeters } from "../controllers/meterControllers/searchMeters";
import expressAsyncHandler from "express-async-handler";
import {
  updateMeterValidator,
  verifyMeterValidator,
} from "../utils/validator/vending";
import Validate from "../middleware/validate";
import Authorize from "../middleware/authorization";
import RolesGuard from "../middleware/rolesGuard";
import { Role } from "../../prisma/generated/prisma";

const meterRoutes = express.Router();

meterRoutes.get(
  "/",
  Authorize,
  RolesGuard([
    Role.super_admin,
    Role.admin,
    Role.manager,
    Role.user,
    Role.houseowner,
  ]),
  expressAsyncHandler(getUserMeter),
);

meterRoutes.get(
  "/all",
  Authorize,
  RolesGuard([Role.super_admin, Role.admin, Role.manager]),
  expressAsyncHandler(getAllMeters),
);

meterRoutes.get(
  "/property/:propertyId",
  Authorize,
  RolesGuard([Role.super_admin, Role.admin, Role.manager]),
  expressAsyncHandler(getMetersByPropertyId),
);

meterRoutes.get(
  "/search",
  Authorize,
  RolesGuard([Role.super_admin, Role.admin, Role.manager]),
  expressAsyncHandler(searchMeters),
);

meterRoutes.post(
  "/",
  verifyMeterValidator,
  Validate,
  expressAsyncHandler(verifyMeter),
);

meterRoutes.patch(
  "/:meterId",
  Authorize,
  RolesGuard([Role.super_admin, Role.admin, Role.manager]),
  updateMeterValidator,
  Validate,
  expressAsyncHandler(updateMeter),
);

export default meterRoutes;
