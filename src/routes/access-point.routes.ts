import express from "express";
import expressAsyncHandler from "express-async-handler";
import { getAllAccessPoints } from "../controllers/accessControlControllers/allAccessPoints";
import { createAccessPoint } from "../controllers/accessControlControllers/createAccessPoint";
import { updateAccessPoint } from "../controllers/accessControlControllers/updateAccessPoint";
import { deleteAccessPoint } from "../controllers/accessControlControllers/deleteAccessPoint";
import { generateAccessCode } from "../controllers/accessControlControllers/generateAccessCode";
import { getAllAccessCodes } from "../controllers/accessControlControllers/getAllAccessCodes";
import { deleteAccessCode } from "../controllers/accessControlControllers/deleteAccessCode";
import { revokeAccessCode } from "../controllers/accessControlControllers/revokeAccessCode";
import { generateQRCode } from "../controllers/accessControlControllers/generateQRCode";
import Authorize from "../middleware/authorization";
import Validate from "../middleware/validate";
import {
  createAccessPointValidator,
  updateAccessPointValidator,
  deleteAccessPointValidator,
  generateAccessCodeValidator,
  getAccessCodesValidator,
  deleteAccessCodeValidator,
  revokeAccessCodeValidator,
  generateQRCodeValidator,
  getResidentAccessCodesValidator,
  getPropertyAccessCodesValidator,
  verifyAccessCodeValidator,
  getAllGuestLogsValidator,
  getGuestLogValidator,
  guestEntryValidator,
  guestExitValidator,
} from "../utils/validator/access-control";
import { getResidentAccessCodes } from "../controllers/accessControlControllers/getResidentAccessCodes";
import { verifyAccessCode } from "../controllers/accessControlControllers/verifyAccessCode";
import { getAllGuestLogs } from "../controllers/accessControlControllers/getAllGuestLogs";
import { getGuestEntryLog } from "../controllers/accessControlControllers/getGuestEntry";
import { guestEntryRequest } from "../controllers/accessControlControllers/guestEntryRequest";
import { guestCheckout } from "../controllers/accessControlControllers/guestCheckout";
import { getResidentAccessPoints } from "../controllers/accessControlControllers/getResidentAccessPoints";
import { getPropertyAccessCodes } from "../controllers/accessControlControllers/getPropertyAccessCodes";

const accessPointRoutes = express.Router();

// Get all access points
accessPointRoutes.get("/", Authorize, expressAsyncHandler(getAllAccessPoints));

// Create an access point
accessPointRoutes.post(
  "/",
  Authorize,
  createAccessPointValidator,
  Validate,
  expressAsyncHandler(createAccessPoint),
);

// Get all guest entry logs
accessPointRoutes.get(
  "/guest/logs",
  Authorize,
  getAllGuestLogsValidator,
  Validate,
  expressAsyncHandler(getAllGuestLogs),
);

// Get a single guest entry log
accessPointRoutes.get(
  "/guest/logs/:id",
  Authorize,
  getGuestLogValidator,
  Validate,
  expressAsyncHandler(getGuestEntryLog),
);

// Guest entry request
accessPointRoutes.post(
  "/guest/entry",
  Authorize,
  guestEntryValidator,
  Validate,
  expressAsyncHandler(guestEntryRequest),
);

// Guest exit request
accessPointRoutes.patch(
  "/guest/exit/:id",
  Authorize,
  guestExitValidator,
  Validate,
  expressAsyncHandler(guestCheckout),
);

// Get all access codes associated with a specific house
accessPointRoutes.get(
  "/:houseId/codes",
  Authorize,
  getResidentAccessCodesValidator,
  Validate,
  expressAsyncHandler(getResidentAccessCodes),
);

// Get all access codes associated with a specific property
accessPointRoutes.get(
  "/property/:propertyId/codes",
  Authorize,
  getPropertyAccessCodesValidator,
  Validate,
  expressAsyncHandler(getPropertyAccessCodes),
);

// Get all access points associated with a specific house
accessPointRoutes.get(
  "/house/:houseId",
  Authorize,
  getResidentAccessCodesValidator,
  Validate,
  expressAsyncHandler(getResidentAccessPoints),
);

// Generate an access code for an access point
accessPointRoutes.post(
  "/code",
  Authorize,
  generateAccessCodeValidator,
  Validate,
  expressAsyncHandler(generateAccessCode),
);

// Get an access code details
accessPointRoutes.get(
  "/code/:token",
  Authorize,
  verifyAccessCodeValidator,
  Validate,
  expressAsyncHandler(verifyAccessCode),
);

// Get all access codes created for an access point
accessPointRoutes.get(
  "/code",
  Authorize,
  getAccessCodesValidator,
  Validate,
  expressAsyncHandler(getAllAccessCodes),
);

// Update an access point
accessPointRoutes.patch(
  "/:accesspointId",
  Authorize,
  updateAccessPointValidator,
  Validate,
  expressAsyncHandler(updateAccessPoint),
);

// Delete an access point
accessPointRoutes.delete(
  "/:accesspointId",
  Authorize,
  deleteAccessPointValidator,
  Validate,
  expressAsyncHandler(deleteAccessPoint),
);

// Delete an access code
accessPointRoutes.delete(
  "/code/:accesscodeId",
  Authorize,
  deleteAccessCodeValidator,
  Validate,
  expressAsyncHandler(deleteAccessCode),
);

// Revoke an access code
accessPointRoutes.patch(
  "/code/:accesscodeId",
  Authorize,
  revokeAccessCodeValidator,
  Validate,
  expressAsyncHandler(revokeAccessCode),
);

// Generate a QR code for an access point
accessPointRoutes.post(
  "/qr",
  Authorize,
  generateQRCodeValidator,
  Validate,
  expressAsyncHandler(generateQRCode),
);

export default accessPointRoutes;
