import { injectable } from "tsyringe";
import { AlertCategory, AlertPriority } from "../../prisma/generated/prisma";
import {
  AnySystemEvent,
  EventAlertMapping,
  MaintenanceEvent,
  MeterEvent,
  PaymentEvent,
  PropertyEvent,
  SecurityEvent,
  SystemEventType,
  SystemMaintenanceEvent,
  UserEvent,
  CreateAlertDto,
  EventCalendarEvent,
} from "../types/alert";
import { logger } from "../utils/logger/logger";

@injectable()
class EventAlertMapperService {
  private eventAlertMappings: EventAlertMapping[] = [];

  constructor() {
    this.initializeMappings();
  }

  /**
   * Initialize the mappings between system events and alerts
   */
  private initializeMappings(): void {
    this.eventAlertMappings = [
      // Payment events
      {
        eventType: SystemEventType.PAYMENT_FAILED,
        generateAlert: (event: AnySystemEvent) => {
          const paymentEvent = event as PaymentEvent;
          return {
            title: "Payment Failed",
            body: `Your payment of ${paymentEvent.amount} ${paymentEvent.currency} could not be processed. Please update your payment method.`,
            category: AlertCategory.general,
            priority: AlertPriority.high,
            audienceType: "user",
            audienceIds: [paymentEvent.userId],
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          };
        },
      },
      {
        eventType: SystemEventType.PAYMENT_OVERDUE,
        generateAlert: (event: AnySystemEvent) => {
          const paymentEvent = event as PaymentEvent;
          return {
            title: "Payment Overdue",
            body: `Your payment of ${paymentEvent.amount} ${paymentEvent.currency} is overdue. Please make payment as soon as possible to avoid service interruption.`,
            category: AlertCategory.general,
            priority: AlertPriority.high,
            audienceType: "user",
            audienceIds: [paymentEvent.userId],
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          };
        },
      },
      {
        eventType: SystemEventType.LOW_BALANCE,
        generateAlert: (event: AnySystemEvent) => {
          const paymentEvent = event as PaymentEvent;
          return {
            title: "Low Balance Alert",
            body: `Your account balance is running low. Current balance: ${paymentEvent.amount} ${paymentEvent.currency}. Please top up to avoid service interruption.`,
            category: AlertCategory.general,
            priority: AlertPriority.medium,
            audienceType: "user",
            audienceIds: [paymentEvent.userId],
            expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
          };
        },
      },

      // Security events
      {
        eventType: SystemEventType.SECURITY_BREACH,
        generateAlert: (event: AnySystemEvent) => {
          const securityEvent = event as SecurityEvent;
          return {
            title: "Security Alert: Potential Breach",
            body: `A potential security breach has been detected at ${securityEvent.location || "your property"}. ${securityEvent.details}`,
            category: AlertCategory.security,
            priority: AlertPriority.critical,
            audienceType: "property",
            audienceIds: [securityEvent.propertyId],
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          };
        },
      },
      {
        eventType: SystemEventType.UNAUTHORIZED_ACCESS,
        generateAlert: (event: AnySystemEvent) => {
          const securityEvent = event as SecurityEvent;
          return {
            title: "Security Alert: Unauthorized Access",
            body: `Unauthorized access detected at ${securityEvent.location || "your property"}. ${securityEvent.details}`,
            category: AlertCategory.security,
            priority: AlertPriority.high,
            audienceType: "property",
            audienceIds: [securityEvent.propertyId],
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          };
        },
      },

      // Maintenance events
      {
        eventType: SystemEventType.MAINTENANCE_SCHEDULED,
        generateAlert: (event: AnySystemEvent) => {
          const maintenanceEvent = event as MaintenanceEvent;
          const startDate = maintenanceEvent.scheduledStart
            ? new Date(maintenanceEvent.scheduledStart).toLocaleString()
            : "soon";
          const endDate = maintenanceEvent.scheduledEnd
            ? new Date(maintenanceEvent.scheduledEnd).toLocaleString()
            : "to be determined";

          return {
            title: "Scheduled Maintenance",
            body: `Maintenance (${maintenanceEvent.maintenanceType}) is scheduled from ${startDate} to ${endDate}. ${maintenanceEvent.description}`,
            category: AlertCategory.maintenance,
            priority: AlertPriority.medium,
            audienceType: "property",
            audienceIds: [maintenanceEvent.propertyId],
            expiresAt:
              maintenanceEvent.scheduledEnd ||
              new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // End of maintenance or 7 days
          };
        },
      },
      {
        eventType: SystemEventType.MAINTENANCE_DELAYED,
        generateAlert: (event: AnySystemEvent) => {
          const maintenanceEvent = event as MaintenanceEvent;
          return {
            title: "Maintenance Delayed",
            body: `The scheduled maintenance (${maintenanceEvent.maintenanceType}) has been delayed. ${maintenanceEvent.description}`,
            category: AlertCategory.maintenance,
            priority: AlertPriority.low,
            audienceType: "property",
            audienceIds: [maintenanceEvent.propertyId],
            expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
          };
        },
      },

      // Property events
      {
        eventType: SystemEventType.PROPERTY_DAMAGE,
        generateAlert: (event: AnySystemEvent) => {
          const propertyEvent = event as PropertyEvent;
          return {
            title: "Property Damage Reported",
            body: `Damage has been reported at your property: ${propertyEvent.description}`,
            category: AlertCategory.maintenance,
            priority: this.mapSeverityToPriority(propertyEvent.severity),
            audienceType: propertyEvent.houseId ? "unit" : "property",
            audienceIds: [propertyEvent.houseId || propertyEvent.propertyId],
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          };
        },
      },
      {
        eventType: SystemEventType.PROPERTY_INSPECTION,
        generateAlert: (event: AnySystemEvent) => {
          const propertyEvent = event as PropertyEvent;
          return {
            title: "Upcoming Property Inspection",
            body: `A property inspection is scheduled: ${propertyEvent.description}`,
            category: AlertCategory.general,
            priority: AlertPriority.medium,
            audienceType: propertyEvent.houseId ? "unit" : "property",
            audienceIds: [propertyEvent.houseId || propertyEvent.propertyId],
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          };
        },
      },

      // Meter events
      {
        eventType: SystemEventType.METER_DISCONNECTED,
        generateAlert: (event: AnySystemEvent) => {
          const meterEvent = event as MeterEvent;
          return {
            title: "Meter Disconnected",
            body: `Your meter has been disconnected. Please contact support for assistance.`,
            category: AlertCategory.maintenance,
            priority: AlertPriority.high,
            audienceType: meterEvent.userId
              ? "user"
              : meterEvent.houseId
                ? "unit"
                : "property",
            audienceIds: [
              meterEvent.userId || meterEvent.houseId || meterEvent.propertyId,
            ],
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          };
        },
      },
      {
        eventType: SystemEventType.METER_LOW_UNITS,
        generateAlert: (event: AnySystemEvent) => {
          const meterEvent = event as MeterEvent;
          return {
            title: "Low Meter Units",
            body: `Your meter is running low on units. Current units: ${meterEvent.currentUnits}. Please recharge soon to avoid disconnection.`,
            category: AlertCategory.general,
            priority: AlertPriority.medium,
            audienceType: meterEvent.userId
              ? "user"
              : meterEvent.houseId
                ? "unit"
                : "property",
            audienceIds: [
              meterEvent.userId || meterEvent.houseId || meterEvent.propertyId,
            ],
            expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
          };
        },
      },
      {
        eventType: SystemEventType.METER_TAMPERED,
        generateAlert: (event: AnySystemEvent) => {
          const meterEvent = event as MeterEvent;
          return {
            title: "Meter Tampering Detected",
            body: `Potential tampering detected with your meter. This is a serious violation that may result in penalties. Please contact support immediately.`,
            category: AlertCategory.security,
            priority: AlertPriority.critical,
            audienceType: "property",
            audienceIds: [meterEvent.propertyId],
            expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
          };
        },
      },

      // System events
      {
        eventType: SystemEventType.SYSTEM_UPGRADE,
        generateAlert: (event: AnySystemEvent) => {
          const systemEvent = event as SystemMaintenanceEvent;
          const startTime = new Date(systemEvent.startTime).toLocaleString();
          const endTime = new Date(systemEvent.endTime).toLocaleString();

          return {
            title: "Scheduled System Upgrade",
            body: `A system upgrade is scheduled from ${startTime} to ${endTime}. ${systemEvent.description}. Affected services: ${systemEvent.affectedServices.join(", ")}.`,
            category: AlertCategory.maintenance,
            priority: AlertPriority.medium,
            audienceType: "all",
            audienceIds: ["all"],
            expiresAt: systemEvent.endTime,
          };
        },
      },
      {
        eventType: SystemEventType.SYSTEM_DOWNTIME,
        generateAlert: (event: AnySystemEvent) => {
          const systemEvent = event as SystemMaintenanceEvent;
          const startTime = new Date(systemEvent.startTime).toLocaleString();
          const endTime = new Date(systemEvent.endTime).toLocaleString();

          return {
            title: "Scheduled System Downtime",
            body: `The system will be unavailable from ${startTime} to ${endTime}. ${systemEvent.description}. Affected services: ${systemEvent.affectedServices.join(", ")}.`,
            category: AlertCategory.maintenance,
            priority: AlertPriority.high,
            audienceType: "all",
            audienceIds: ["all"],
            expiresAt: systemEvent.endTime,
          };
        },
      },

      // User events
      {
        eventType: SystemEventType.USER_REGISTERED,
        generateAlert: (event: AnySystemEvent) => {
          const userEvent = event as UserEvent;
          return {
            title: "Welcome to Miratonrose",
            body: `Thank you for registering with Miratonrose. We're excited to have you on board!`,
            category: AlertCategory.general,
            priority: AlertPriority.low,
            audienceType: "user",
            audienceIds: [userEvent.userId],
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          };
        },
      },
      {
        eventType: SystemEventType.USER_PROFILE_INCOMPLETE,
        generateAlert: (event: AnySystemEvent) => {
          const userEvent = event as UserEvent;
          return {
            title: "Complete Your Profile",
            body: `Your profile is incomplete. Please update the following information: ${userEvent.missingFields?.join(", ")}.`,
            category: AlertCategory.general,
            priority: AlertPriority.medium,
            audienceType: "user",
            audienceIds: [userEvent.userId],
            expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
          };
        },
      },

      // Event calendar events
      {
        eventType: SystemEventType.EVENT_CREATED,
        generateAlert: (event: AnySystemEvent) => {
          const calendarEvent = event as EventCalendarEvent;
          const startDate = new Date(calendarEvent.startsAt).toLocaleString();
          const endDate = calendarEvent.endsAt
            ? new Date(calendarEvent.endsAt).toLocaleString()
            : "to be determined";

          return {
            title: "New Event: " + calendarEvent.title,
            body: `A new event has been scheduled: ${calendarEvent.title}. ${calendarEvent.description || ""}\n\nWhen: ${startDate} to ${endDate}\nLocation: ${calendarEvent.location || "TBD"}`,
            category: AlertCategory.general,
            priority: AlertPriority.medium,
            audienceType: calendarEvent.audienceType,
            audienceIds: calendarEvent.audienceIds,
            expiresAt: new Date(
              calendarEvent.startsAt instanceof Date
                ? calendarEvent.startsAt.getTime()
                : calendarEvent.startsAt,
            ),
          };
        },
      },
      {
        eventType: SystemEventType.EVENT_UPDATED,
        generateAlert: (event: AnySystemEvent) => {
          const calendarEvent = event as EventCalendarEvent;
          const startDate = new Date(calendarEvent.startsAt).toLocaleString();
          const endDate = calendarEvent.endsAt
            ? new Date(calendarEvent.endsAt).toLocaleString()
            : "to be determined";

          return {
            title: "Event Updated: " + calendarEvent.title,
            body: `An event has been updated: ${calendarEvent.title}. ${calendarEvent.description || ""}\n\nWhen: ${startDate} to ${endDate}\nLocation: ${calendarEvent.location || "TBD"}`,
            category: AlertCategory.general,
            priority: AlertPriority.medium,
            audienceType: calendarEvent.audienceType,
            audienceIds: calendarEvent.audienceIds,
            expiresAt: new Date(
              calendarEvent.startsAt instanceof Date
                ? calendarEvent.startsAt.getTime()
                : calendarEvent.startsAt,
            ),
          };
        },
      },
      {
        eventType: SystemEventType.EVENT_CANCELLED,
        generateAlert: (event: AnySystemEvent) => {
          const calendarEvent = event as EventCalendarEvent;

          return {
            title: "Event Cancelled: " + calendarEvent.title,
            body: `The following event has been cancelled: ${calendarEvent.title}. ${calendarEvent.description || ""}`,
            category: AlertCategory.general,
            priority: AlertPriority.high,
            audienceType: calendarEvent.audienceType,
            audienceIds: calendarEvent.audienceIds,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          };
        },
      },
      {
        eventType: SystemEventType.EVENT_REMINDER,
        generateAlert: (event: AnySystemEvent) => {
          const calendarEvent = event as EventCalendarEvent;
          const startDate = new Date(calendarEvent.startsAt).toLocaleString();
          const reminderText = calendarEvent.reminderOffset
            ? `This event starts in ${calendarEvent.reminderOffset} minutes.`
            : "This is a reminder for your upcoming event.";

          return {
            title: "Event Reminder: " + calendarEvent.title,
            body: `${reminderText}\n\nEvent: ${calendarEvent.title}\nWhen: ${startDate}\nLocation: ${calendarEvent.location || "TBD"}\n\n${calendarEvent.description || ""}`,
            category: AlertCategory.general,
            priority: AlertPriority.medium,
            audienceType: calendarEvent.audienceType,
            audienceIds: calendarEvent.audienceIds,
            expiresAt: new Date(
              calendarEvent.startsAt instanceof Date
                ? calendarEvent.startsAt.getTime()
                : calendarEvent.startsAt,
            ),
          };
        },
      },
    ];
  }

  /**
   * Map a system event to an alert DTO
   * @param event The system event
   * @returns Alert DTO or null if no mapping exists
   */
  public mapEventToAlert(event: AnySystemEvent): CreateAlertDto | null {
    try {
      const mapping = this.eventAlertMappings.find(
        (mapping) => mapping.eventType === event.type,
      );

      if (!mapping) {
        logger.warn(`No alert mapping found for event type: ${event.type}`);
        return null;
      }

      return mapping.generateAlert(event);
    } catch (error) {
      logger.error(`Error mapping event to alert: ${error}`);
      return null;
    }
  }

  /**
   * Map severity string to AlertPriority
   */
  private mapSeverityToPriority(
    severity?: "low" | "medium" | "high" | "critical",
  ): AlertPriority {
    switch (severity) {
      case "critical":
        return AlertPriority.critical;
      case "high":
        return AlertPriority.high;
      case "medium":
        return AlertPriority.medium;
      case "low":
      default:
        return AlertPriority.low;
    }
  }
}

export default EventAlertMapperService;
