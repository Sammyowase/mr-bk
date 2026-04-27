import express from "express";
import expressAsyncHandler from "express-async-handler";
import Validate from "../middleware/validate";
import Authorize from "../middleware/authorization";
import RolesGuard from "../middleware/rolesGuard";
import {
  CreateEngagementValidator,
  CreateInteractionValidator,
  UpdateEngagementValidator,
} from "../utils/validator/engagement";
import createEngagementPost from "../controllers/engagementControllers/createEngagementPost";
import getEngagementPosts from "../controllers/engagementControllers/getEngagementPosts";
import getEngagementPostById from "../controllers/engagementControllers/getEngagementPostById";
import updateEngagementPost from "../controllers/engagementControllers/updateEngagementPost";
import deleteEngagementPost from "../controllers/engagementControllers/deleteEngagementPost";
import createInteraction from "../controllers/engagementControllers/createInteraction";
import getInteractions from "../controllers/engagementControllers/getInteractions";
import { Role } from "../../prisma/generated/prisma";

const engagementRoutes = express.Router();

// Get all engagement posts
engagementRoutes.get(
  "/",
  Authorize,
  RolesGuard([Role.admin, Role.manager]),
  expressAsyncHandler(getEngagementPosts),
);

// Get a specific engagement post by ID
engagementRoutes.get(
  "/:id",
  Authorize,
  RolesGuard([Role.admin, Role.manager]),
  expressAsyncHandler(getEngagementPostById),
);

// Create a new engagement post (admin and manager only)
engagementRoutes.post(
  "/",
  Authorize,
  RolesGuard([Role.admin, Role.manager]),
  CreateEngagementValidator,
  Validate,
  expressAsyncHandler(createEngagementPost),
);

// Update an existing engagement post (admin and manager only)
engagementRoutes.patch(
  "/:id",
  Authorize,
  RolesGuard([Role.admin, Role.manager]),
  UpdateEngagementValidator,
  Validate,
  expressAsyncHandler(updateEngagementPost),
);

// Delete an engagement post (admin and manager only)
engagementRoutes.delete(
  "/:id",
  Authorize,
  RolesGuard([Role.admin, Role.manager]),
  expressAsyncHandler(deleteEngagementPost),
);

// Get all interactions for a specific engagement post
engagementRoutes.get(
  "/:id/interactions",
  Authorize,
  RolesGuard([Role.admin, Role.manager]),
  expressAsyncHandler(getInteractions),
);

// Create a new interaction for a specific engagement post
engagementRoutes.post(
  "/:id/interactions",
  Authorize,
  RolesGuard([Role.admin, Role.manager]),
  CreateInteractionValidator,
  Validate,
  expressAsyncHandler(createInteraction),
);

export default engagementRoutes;
