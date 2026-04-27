import express from "express";
import { getPropertyHouses } from "../controllers/HouseControllers/propertyHouses";
import { createHouse } from "../controllers/HouseControllers/createHouse";
import { updateHouse } from "../controllers/HouseControllers/updateHouse";
import expressAsyncHandler from "express-async-handler";
import {
  createHouseValidator,
  updateHouseValidator,
} from "../utils/validator/house";
import Validate from "../middleware/validate";
import Authorize from "../middleware/authorization";
import RolesGuard from "../middleware/rolesGuard";
import { Role } from "../../prisma/generated/prisma";
import { getHouseResident } from "../controllers/HouseControllers/houseResident";

const HousesRoutes = express.Router();

HousesRoutes.get(
  "/:id/resident",
  Authorize,
  RolesGuard([Role.super_admin, Role.admin, Role.manager]),
  expressAsyncHandler(getHouseResident),
);
HousesRoutes.get("/:id", expressAsyncHandler(getPropertyHouses));
HousesRoutes.post(
  "/:id",
  Authorize,
  RolesGuard([Role.super_admin, Role.admin]),
  createHouseValidator,
  Validate,
  expressAsyncHandler(createHouse),
);
HousesRoutes.patch(
  "/:houseId",
  Authorize,
  RolesGuard([Role.super_admin, Role.admin]),
  updateHouseValidator,
  Validate,
  expressAsyncHandler(updateHouse),
);

export default HousesRoutes;
