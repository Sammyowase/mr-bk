import express from "express";
import expressAsyncHandler from "express-async-handler";
import Validate from "../middleware/validate";
import Authorize from "../middleware/authorization";
import getNotificationPreference from "../controllers/notificationControllers/getUserNotificationPreference";
import updateNotificationPreference from "../controllers/notificationControllers/updateNotificationPreference";
import getNotifications from "../controllers/notificationControllers/getUserNotifications";
import {
  UpdateNotificationValidator,
  UpdatePreferenceValidator,
} from "../utils/validator/notification";
import updateNotification from "../controllers/notificationControllers/updateNotification";

const notificationRoutes = express.Router();

notificationRoutes.get("/me", Authorize, expressAsyncHandler(getNotifications));

notificationRoutes.patch(
  "/preference",
  Authorize,
  UpdatePreferenceValidator,
  Validate,
  expressAsyncHandler(updateNotificationPreference),
);

notificationRoutes.get(
  "/preference",
  Authorize,
  expressAsyncHandler(getNotificationPreference),
);

notificationRoutes.patch(
  "/:id",
  Authorize,
  UpdateNotificationValidator,
  Validate,
  expressAsyncHandler(updateNotification),
);

export default notificationRoutes;
