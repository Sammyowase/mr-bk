import { body } from "express-validator";
import { AlertCategory, AlertPriority } from "../../../prisma/generated/prisma";
import { SystemEventType } from "../../types/alert";

export const CreateAlertValidator = [
  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .isString()
    .withMessage("Title must be a string")
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters"),

  body("body")
    .notEmpty()
    .withMessage("Body is required")
    .isString()
    .withMessage("Body must be a string")
    .isLength({ min: 5, max: 1000 })
    .withMessage("Body must be between 5 and 1000 characters"),

  body("category")
    .notEmpty()
    .withMessage("Category is required")
    .isIn(Object.values(AlertCategory))
    .withMessage("Invalid category"),

  body("priority")
    .notEmpty()
    .withMessage("Priority is required")
    .isIn(Object.values(AlertPriority))
    .withMessage("Invalid priority"),

  body("audienceType")
    .notEmpty()
    .withMessage("Audience type is required")
    .isString()
    .withMessage("Audience type must be a string")
    .isIn(["all", "building", "property", "unit", "user"])
    .withMessage("Invalid audience type"),

  body("audienceIds")
    .notEmpty()
    .withMessage("Audience IDs are required")
    .isArray()
    .withMessage("Audience IDs must be an array"),

  body("expiresAt")
    .optional()
    .isISO8601()
    .withMessage("Expires at must be a valid date")
    .custom((value) => {
      if (value && new Date(value) <= new Date()) {
        throw new Error("Expires at must be in the future");
      }
      return true;
    }),
];

export const UpdateAlertValidator = [
  body("title")
    .optional()
    .isString()
    .withMessage("Title must be a string")
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters"),

  body("body")
    .optional()
    .isString()
    .withMessage("Body must be a string")
    .isLength({ min: 5, max: 1000 })
    .withMessage("Body must be between 5 and 1000 characters"),

  body("category")
    .optional()
    .isIn(Object.values(AlertCategory))
    .withMessage("Invalid category"),

  body("priority")
    .optional()
    .isIn(Object.values(AlertPriority))
    .withMessage("Invalid priority"),

  body("expiresAt")
    .optional()
    .custom((value) => {
      if (value === null) return true;
      if (value && new Date(value) <= new Date()) {
        throw new Error("Expires at must be in the future");
      }
      return true;
    }),
];

export const CreateCalendarEventValidator = [
  body("eventId")
    .notEmpty()
    .withMessage("Event ID is required")
    .isString()
    .withMessage("Event ID must be a string"),

  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .isString()
    .withMessage("Title must be a string")
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters"),

  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string"),

  body("startsAt")
    .notEmpty()
    .withMessage("Start time is required")
    .isISO8601()
    .withMessage("Start time must be a valid date")
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error("Start time must be in the future");
      }
      return true;
    }),

  body("endsAt")
    .optional()
    .isISO8601()
    .withMessage("End time must be a valid date")
    .custom((value, { req }) => {
      if (value && new Date(value) <= new Date(req.body.startsAt)) {
        throw new Error("End time must be after start time");
      }
      return true;
    }),

  body("location")
    .optional()
    .isString()
    .withMessage("Location must be a string"),

  body("audienceType")
    .notEmpty()
    .withMessage("Audience type is required")
    .isString()
    .withMessage("Audience type must be a string")
    .isIn(["all", "building", "property", "unit", "user", "role"])
    .withMessage("Invalid audience type"),

  body("audienceIds")
    .notEmpty()
    .withMessage("Audience IDs are required")
    .isArray()
    .withMessage("Audience IDs must be an array")
    .custom((value) => {
      if (value.length === 0) {
        throw new Error("Audience IDs array cannot be empty");
      }
      return true;
    }),
];

export const UpdateCalendarEventValidator = [
  body("eventId")
    .notEmpty()
    .withMessage("Event ID is required")
    .isString()
    .withMessage("Event ID must be a string"),

  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .isString()
    .withMessage("Title must be a string")
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters"),

  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string"),

  body("startsAt")
    .notEmpty()
    .withMessage("Start time is required")
    .isISO8601()
    .withMessage("Start time must be a valid date"),

  body("endsAt")
    .optional()
    .isISO8601()
    .withMessage("End time must be a valid date")
    .custom((value, { req }) => {
      if (value && new Date(value) <= new Date(req.body.startsAt)) {
        throw new Error("End time must be after start time");
      }
      return true;
    }),

  body("location")
    .optional()
    .isString()
    .withMessage("Location must be a string"),

  body("audienceType")
    .notEmpty()
    .withMessage("Audience type is required")
    .isString()
    .withMessage("Audience type must be a string")
    .isIn(["all", "building", "property", "unit", "user", "role"])
    .withMessage("Invalid audience type"),

  body("audienceIds")
    .notEmpty()
    .withMessage("Audience IDs are required")
    .isArray()
    .withMessage("Audience IDs must be an array")
    .custom((value) => {
      if (value.length === 0) {
        throw new Error("Audience IDs array cannot be empty");
      }
      return true;
    }),
];

export const CancelCalendarEventValidator = [
  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .isString()
    .withMessage("Title must be a string"),

  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string"),

  body("audienceType")
    .notEmpty()
    .withMessage("Audience type is required")
    .isString()
    .withMessage("Audience type must be a string")
    .isIn(["all", "building", "property", "unit", "user", "role"])
    .withMessage("Invalid audience type"),

  body("audienceIds")
    .notEmpty()
    .withMessage("Audience IDs are required")
    .isArray()
    .withMessage("Audience IDs must be an array")
    .custom((value) => {
      if (value.length === 0) {
        throw new Error("Audience IDs array cannot be empty");
      }
      return true;
    }),
];

export const SystemEventValidator = [
  body("type")
    .notEmpty()
    .withMessage("Event type is required")
    .isIn(Object.values(SystemEventType))
    .withMessage("Invalid event type"),

  body("timestamp")
    .optional()
    .isISO8601()
    .withMessage("Timestamp must be a valid date"),

  // Validate based on event type
  body().custom((body) => {
    const { type } = body;

    // Payment events validation
    if (
      type === SystemEventType.PAYMENT_FAILED ||
      type === SystemEventType.PAYMENT_SUCCESSFUL ||
      type === SystemEventType.PAYMENT_OVERDUE ||
      type === SystemEventType.LOW_BALANCE
    ) {
      if (!body.userId) {
        throw new Error("userId is required for payment events");
      }
      if (typeof body.amount !== "number") {
        throw new Error("amount must be a number for payment events");
      }
      if (!body.currency) {
        throw new Error("currency is required for payment events");
      }
    }

    // Security events validation
    if (
      type === SystemEventType.SECURITY_BREACH ||
      type === SystemEventType.UNAUTHORIZED_ACCESS ||
      type === SystemEventType.SUSPICIOUS_ACTIVITY
    ) {
      if (!body.propertyId) {
        throw new Error("propertyId is required for security events");
      }
      if (!body.details) {
        throw new Error("details is required for security events");
      }
    }

    // Maintenance events validation
    if (
      type === SystemEventType.MAINTENANCE_SCHEDULED ||
      type === SystemEventType.MAINTENANCE_COMPLETED ||
      type === SystemEventType.MAINTENANCE_DELAYED
    ) {
      if (!body.propertyId) {
        throw new Error("propertyId is required for maintenance events");
      }
      if (!body.maintenanceType) {
        throw new Error("maintenanceType is required for maintenance events");
      }
      if (!body.description) {
        throw new Error("description is required for maintenance events");
      }
    }

    // Property events validation
    if (
      type === SystemEventType.PROPERTY_DAMAGE ||
      type === SystemEventType.PROPERTY_INSPECTION
    ) {
      if (!body.propertyId) {
        throw new Error("propertyId is required for property events");
      }
      if (!body.description) {
        throw new Error("description is required for property events");
      }
    }

    // Meter events validation
    if (
      type === SystemEventType.METER_DISCONNECTED ||
      type === SystemEventType.METER_LOW_UNITS ||
      type === SystemEventType.METER_TAMPERED
    ) {
      if (!body.meterId) {
        throw new Error("meterId is required for meter events");
      }
      if (!body.propertyId) {
        throw new Error("propertyId is required for meter events");
      }

      // Additional validation for METER_LOW_UNITS
      if (
        type === SystemEventType.METER_LOW_UNITS &&
        typeof body.currentUnits !== "number"
      ) {
        throw new Error(
          "currentUnits is required and must be a number for METER_LOW_UNITS events",
        );
      }
    }

    // System events validation
    if (
      type === SystemEventType.SYSTEM_UPGRADE ||
      type === SystemEventType.SYSTEM_DOWNTIME
    ) {
      if (!body.startTime) {
        throw new Error("startTime is required for system events");
      }
      if (!body.endTime) {
        throw new Error("endTime is required for system events");
      }
      if (!body.affectedServices || !Array.isArray(body.affectedServices)) {
        throw new Error("affectedServices array is required for system events");
      }
      if (!body.description) {
        throw new Error("description is required for system events");
      }
    }

    // User events validation
    if (
      type === SystemEventType.USER_REGISTERED ||
      type === SystemEventType.USER_PROFILE_INCOMPLETE
    ) {
      if (!body.userId) {
        throw new Error("userId is required for user events");
      }
      if (!body.email) {
        throw new Error("email is required for user events");
      }
    }

    // Event calendar events validation
    if (
      type === SystemEventType.EVENT_CREATED ||
      type === SystemEventType.EVENT_UPDATED ||
      type === SystemEventType.EVENT_CANCELLED ||
      type === SystemEventType.EVENT_REMINDER
    ) {
      if (!body.eventId) {
        throw new Error("eventId is required for event calendar events");
      }
      if (!body.title) {
        throw new Error("title is required for event calendar events");
      }
      if (type !== SystemEventType.EVENT_CANCELLED && !body.startsAt) {
        throw new Error("startsAt is required for event calendar events");
      }
      if (!body.audienceType) {
        throw new Error("audienceType is required for event calendar events");
      }
      if (
        !body.audienceIds ||
        !Array.isArray(body.audienceIds) ||
        body.audienceIds.length === 0
      ) {
        throw new Error(
          "audienceIds array is required for event calendar events",
        );
      }

      // Additional validation for EVENT_REMINDER
      if (
        type === SystemEventType.EVENT_REMINDER &&
        typeof body.reminderOffset !== "number"
      ) {
        throw new Error(
          "reminderOffset is required and must be a number for EVENT_REMINDER events",
        );
      }
    }

    return true;
  }),
];
