import { AlertCategory, AlertPriority } from "../../prisma/generated/prisma";

/**
 * System events that can trigger automatic alerts
 */
export enum SystemEventType {
  // Payment events
  PAYMENT_FAILED = "payment.failed",
  PAYMENT_SUCCESSFUL = "payment.successful",
  PAYMENT_OVERDUE = "payment.overdue",
  LOW_BALANCE = "payment.low_balance",

  // Security events
  SECURITY_BREACH = "security.breach",
  UNAUTHORIZED_ACCESS = "security.unauthorized_access",
  SUSPICIOUS_ACTIVITY = "security.suspicious_activity",

  // Maintenance events
  MAINTENANCE_SCHEDULED = "maintenance.scheduled",
  MAINTENANCE_COMPLETED = "maintenance.completed",
  MAINTENANCE_DELAYED = "maintenance.delayed",

  // Property events
  PROPERTY_DAMAGE = "property.damage",
  PROPERTY_INSPECTION = "property.inspection",

  // Meter events
  METER_DISCONNECTED = "meter.disconnected",
  METER_LOW_UNITS = "meter.low_units",
  METER_TAMPERED = "meter.tampered",

  // System events
  SYSTEM_UPGRADE = "system.upgrade",
  SYSTEM_DOWNTIME = "system.downtime",

  // User events
  USER_REGISTERED = "user.registered",
  USER_PROFILE_INCOMPLETE = "user.profile_incomplete",
}

/**
 * Base interface for all system events
 */
export interface SystemEvent {
  type: SystemEventType;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

/**
 * Payment-related events
 */
export interface PaymentEvent extends SystemEvent {
  type:
    | SystemEventType.PAYMENT_FAILED
    | SystemEventType.PAYMENT_SUCCESSFUL
    | SystemEventType.PAYMENT_OVERDUE
    | SystemEventType.LOW_BALANCE;
  userId: string;
  amount: number;
  currency: string;
  paymentId?: string;
  propertyId?: string;
  houseId?: string;
  dueDate?: Date;
}

/**
 * Security-related events
 */
export interface SecurityEvent extends SystemEvent {
  type:
    | SystemEventType.SECURITY_BREACH
    | SystemEventType.UNAUTHORIZED_ACCESS
    | SystemEventType.SUSPICIOUS_ACTIVITY;
  propertyId: string;
  location?: string;
  deviceId?: string;
  userId?: string;
  ipAddress?: string;
  details: string;
}

/**
 * Maintenance-related events
 */
export interface MaintenanceEvent extends SystemEvent {
  type:
    | SystemEventType.MAINTENANCE_SCHEDULED
    | SystemEventType.MAINTENANCE_COMPLETED
    | SystemEventType.MAINTENANCE_DELAYED;
  propertyId: string;
  buildingIds?: string[];
  maintenanceType: string;
  scheduledStart?: Date;
  scheduledEnd?: Date;
  description: string;
  affectedServices?: string[];
}

/**
 * Property-related events
 */
export interface PropertyEvent extends SystemEvent {
  type: SystemEventType.PROPERTY_DAMAGE | SystemEventType.PROPERTY_INSPECTION;
  propertyId: string;
  buildingId?: string;
  houseId?: string;
  description: string;
  severity?: "low" | "medium" | "high" | "critical";
  reportedBy?: string;
}

/**
 * Meter-related events
 */
export interface MeterEvent extends SystemEvent {
  type:
    | SystemEventType.METER_DISCONNECTED
    | SystemEventType.METER_LOW_UNITS
    | SystemEventType.METER_TAMPERED;
  meterId: string;
  propertyId: string;
  houseId?: string;
  userId?: string;
  currentUnits?: number;
  lastReading?: Date;
}

/**
 * System-related events
 */
export interface SystemMaintenanceEvent extends SystemEvent {
  type: SystemEventType.SYSTEM_UPGRADE | SystemEventType.SYSTEM_DOWNTIME;
  startTime: Date;
  endTime: Date;
  affectedServices: string[];
  description: string;
}

/**
 * User-related events
 */
export interface UserEvent extends SystemEvent {
  type:
    | SystemEventType.USER_REGISTERED
    | SystemEventType.USER_PROFILE_INCOMPLETE;
  userId: string;
  email: string;
  missingFields?: string[];
}

/**
 * Union type of all possible system events
 */
export type AnySystemEvent =
  | PaymentEvent
  | SecurityEvent
  | MaintenanceEvent
  | PropertyEvent
  | MeterEvent
  | SystemMaintenanceEvent
  | UserEvent;

/**
 * Configuration for mapping system events to alerts
 */
export interface EventAlertMapping {
  eventType: SystemEventType;
  generateAlert: (event: AnySystemEvent) => {
    title: string;
    body: string;
    category: AlertCategory;
    priority: AlertPriority;
    audienceType: string;
    audienceIds: string[];
    expiresAt?: Date;
  };
}
