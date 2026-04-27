import express from "express";
import expressAsyncHandler from "express-async-handler";
import Validate from "../middleware/validate";
import Authorize from "../middleware/authorization";
import RolesGuard from "../middleware/rolesGuard";
import {
  CreateAlertValidator,
  UpdateAlertValidator,
  SystemEventValidator,
  CreateCalendarEventValidator,
  UpdateCalendarEventValidator,
  CancelCalendarEventValidator,
} from "../utils/validator/alert";
import createAlert from "../controllers/alertControllers/createAlert";
import getAlerts from "../controllers/alertControllers/getAlerts";
import getAlertById from "../controllers/alertControllers/getAlertById";
import updateAlert from "../controllers/alertControllers/updateAlert";
import deleteAlert from "../controllers/alertControllers/deleteAlert";
import markAlertAsRead from "../controllers/alertControllers/markAlertAsRead";
import triggerSystemEvent from "../controllers/alertControllers/triggerSystemEvent";
import createCalendarEvent from "../controllers/alertControllers/createCalendarEvent";
import updateCalendarEvent from "../controllers/alertControllers/updateCalendarEvent";
import cancelCalendarEvent from "../controllers/alertControllers/cancelCalendarEvent";
import getUpcomingEvents from "../controllers/alertControllers/getUpcomingEvents";
import getEventById from "../controllers/alertControllers/getEventById";
import { Role } from "../../prisma/generated/prisma";

const alertRoutes = express.Router();

// Get all alerts for the current user
alertRoutes.get("/", Authorize, expressAsyncHandler(getAlerts));

// Get a specific alert by ID
alertRoutes.get("/:id", Authorize, expressAsyncHandler(getAlertById));

// Create a new alert (admin and manager only)
alertRoutes.post(
  "/",
  Authorize,
  RolesGuard([Role.admin, Role.manager]),
  CreateAlertValidator,
  Validate,
  expressAsyncHandler(createAlert),
);

// Update an existing alert (admin and manager only)
alertRoutes.patch(
  "/:id",
  Authorize,
  RolesGuard([Role.admin, Role.manager]),
  UpdateAlertValidator,
  Validate,
  expressAsyncHandler(updateAlert),
);

// Delete an alert (admin and manager only)
alertRoutes.delete(
  "/:id",
  Authorize,
  RolesGuard([Role.admin, Role.manager]),
  expressAsyncHandler(deleteAlert),
);

// Mark an alert as read
alertRoutes.post("/:id/read", Authorize, expressAsyncHandler(markAlertAsRead));

// Trigger a system event (admin only)
alertRoutes.post(
  "/system-event",
  Authorize,
  RolesGuard([Role.admin]),
  SystemEventValidator,
  Validate,
  expressAsyncHandler(triggerSystemEvent),
);

// Event calendar routes
// Create, update, delete (admin and manager only)
alertRoutes.post(
  "/events",
  Authorize,
  RolesGuard([Role.admin, Role.manager]),
  CreateCalendarEventValidator,
  Validate,
  expressAsyncHandler(createCalendarEvent),
);

alertRoutes.put(
  "/events",
  Authorize,
  RolesGuard([Role.admin, Role.manager]),
  UpdateCalendarEventValidator,
  Validate,
  expressAsyncHandler(updateCalendarEvent),
);

alertRoutes.delete(
  "/events/:eventId",
  Authorize,
  RolesGuard([Role.admin, Role.manager]),
  CancelCalendarEventValidator,
  Validate,
  expressAsyncHandler(cancelCalendarEvent),
);

// Get events (all authenticated users)
// Note: The order of these routes is important - more specific routes must come first
alertRoutes.get(
  "/events/upcoming",
  Authorize,
  expressAsyncHandler(getUpcomingEvents),
);

alertRoutes.get(
  "/events/:eventId",
  Authorize,
  expressAsyncHandler(getEventById),
);

export default alertRoutes;
