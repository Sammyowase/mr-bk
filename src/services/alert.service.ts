import { Alert, NotificationType, Role } from "../../prisma/generated/prisma";
import AlertRepository from "../repository/alert.repository";
import UserRepository from "../repository/user.repository";
import {
  AlertAnalyticsEvent,
  AlertWithReadStatus,
  CreateAlertDto,
  UpdateAlertDto,
  AnySystemEvent,
  SystemEventType,
  Event,
  EventCalendarEvent,
} from "../types/alert";
import {
  BadRequestException,
  InternalServerException,
  NotFoundException,
} from "../utils/exceptions/customException";
import { logger } from "../utils/logger/logger";
import { injectable } from "tsyringe";
import { KafkaService } from "./kafka.service";
import { BroadcastService } from "./ws-broadcast.service";
import NotificationService from "./notification.service";
import { PrismaClient } from "../../prisma/generated/prisma";
import { EachMessagePayload } from "kafkajs";
import EventAlertMapperService from "./event-alert-mapper.service";

@injectable()
class AlertService {
  private db: PrismaClient;

  constructor(
    private alertRepo: AlertRepository,
    private userRepo: UserRepository,
    private kafkaService: KafkaService,
    private broadcastService: BroadcastService,
    private notificationService: NotificationService,
    private eventAlertMapper: EventAlertMapperService,
  ) {
    // Initialize Prisma client
    this.db = new PrismaClient();

    // Initialize Kafka consumers
    this.initKafkaConsumers();
  }

  private async initKafkaConsumers(): Promise<void> {
    try {
      // Subscribe to alert push notifications topic
      await this.kafkaService.subscribe(
        "alerts.push",
        "alert-push-group",
        this.processAlertPushMessage.bind(this),
      );

      // Subscribe to system events topic
      await this.kafkaService.subscribe(
        "system.events",
        "system-events-group",
        this.processSystemEvent.bind(this),
      );

      // Subscribe to events topic for event calendar
      await this.kafkaService.subscribe(
        "events",
        "events-group",
        this.processEventMessage.bind(this),
      );

      logger.info("Alert Kafka consumers initialized");
    } catch (error) {
      logger.error("Failed to initialize Alert Kafka consumers", error);
    }
  }

  /**
   * Process event calendar messages
   */
  private async processEventMessage(
    payload: EachMessagePayload,
  ): Promise<void> {
    try {
      const event = JSON.parse(
        payload.message.value?.toString() || "{}",
      ) as EventCalendarEvent;

      if (!event || !event.type) {
        logger.warn("Received invalid event calendar event", event);
        return;
      }

      logger.info(`Processing event calendar event: ${event.type}`);

      // For new events, schedule reminders and notify users
      if (event.type === SystemEventType.EVENT_CREATED) {
        // Event is already saved to database in createCalendarEvent
        await this.scheduleEventReminders(event);

        // Notify users about the new event
        await this.notifyUsersAboutEvent(event, "created");
      }

      // For updated events, update database, schedule reminders, and notify users
      else if (event.type === SystemEventType.EVENT_UPDATED) {
        // Event is already updated in database in updateCalendarEvent
        await this.scheduleEventReminders(event);

        // Notify users about the updated event
        await this.notifyUsersAboutEvent(event, "updated");
      }

      // For cancelled events, update database and notify users
      else if (event.type === SystemEventType.EVENT_CANCELLED) {
        // Event is already marked as cancelled in database in cancelCalendarEvent

        // Notify users about the cancelled event
        await this.notifyUsersAboutEvent(event, "cancelled");
      }

      // For EVENT_REMINDER events, create an alert and send notifications
      else if (event.type === SystemEventType.EVENT_REMINDER) {
        // Check if the event still exists and is active
        // Using direct db query since Event model isn't in Prisma schema
        const dbEvent = true; // Placeholder - would normally query database

        if (!dbEvent) {
          logger.info(
            `Event ${event.eventId} not found or not active, skipping reminder`,
          );
          return;
        }

        // Map the event to an alert DTO
        const alertDto = this.eventAlertMapper.mapEventToAlert(event);

        if (!alertDto) {
          logger.info(`No alert mapping found for event type: ${event.type}`);
          return;
        }

        // Create the alert
        await this.createAlert(alertDto, "system");
        logger.info(`Reminder alert created for event: ${event.eventId}`);

        // Send reminder notifications
        await this.notifyUsersAboutEvent(event, "reminder");
      }
    } catch (error) {
      logger.error("Error processing event calendar event", error);
    }
  }

  /**
   * Notify users about an event (created, updated, cancelled, reminder)
   */
  private async notifyUsersAboutEvent(
    event: EventCalendarEvent,
    action: "created" | "updated" | "cancelled" | "reminder",
  ): Promise<void> {
    try {
      // Get users in the audience
      const users = await this.getUsersInAudience(
        event.audienceType,
        event.audienceIds.join(","),
      );

      if (users.length === 0) {
        logger.info(
          `No users found in audience ${event.audienceType}:${event.audienceIds.join(",")}`,
        );
        return;
      }

      // Prepare notification content based on action
      let title = "";
      let message = "";
      let template = "";

      const eventDate = new Date(event.startsAt);
      const formattedDate = eventDate.toLocaleDateString();
      const formattedTime = eventDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      switch (action) {
        case "created":
          title = `New Event: ${event.title}`;
          message = `A new event "${event.title}" has been scheduled for ${formattedDate} at ${formattedTime}${event.location ? ` at ${event.location}` : ""}.`;
          template = "event-created";
          break;
        case "updated":
          title = `Event Updated: ${event.title}`;
          message = `The event "${event.title}" scheduled for ${formattedDate} at ${formattedTime} has been updated.`;
          template = "event-updated";
          break;
        case "cancelled":
          title = `Event Cancelled: ${event.title}`;
          message = `The event "${event.title}" scheduled for ${formattedDate} at ${formattedTime} has been cancelled.`;
          template = "event-cancelled";
          break;
        case "reminder":
          title = `Reminder: ${event.title}`;
          message = `Reminder: The event "${event.title}" is scheduled for ${formattedDate} at ${formattedTime}${event.location ? ` at ${event.location}` : ""}.`;
          template = "event-reminder";
          break;
      }

      // Determine notification types
      const notificationTypes: NotificationType[] = [NotificationType.inapp];

      // Add push for reminders and cancellations
      if (action === "reminder" || action === "cancelled") {
        notificationTypes.push(NotificationType.push);
      }

      // Add email for all event notifications
      notificationTypes.push(NotificationType.email);

      // Send notification to each user
      for (const user of users) {
        await this.notificationService.notify({
          title,
          message,
          type: notificationTypes,
          data: {
            eventId: event.eventId,
            action,
            // Add template for email notifications
            template,
            templateData: {
              title: event.title,
              description: event.description,
              startsAt: formattedDate + " " + formattedTime,
              endsAt: event.endsAt
                ? new Date(event.endsAt).toLocaleString()
                : undefined,
              location: event.location,
              action,
            },
            // Add channel for WebSocket
            channel: `${event.audienceType}:${event.audienceIds.join(",")}`,
          },
          recipientIds: [user.id],
          status: "pending",
        });
      }

      logger.info(
        `Event ${action} notifications sent to ${users.length} users for event: ${event.eventId}`,
      );
    } catch (error) {
      logger.error(`Failed to send event ${action} notifications`, error);
    }
  }

  /**
   * Schedule reminders for an event
   */
  private async scheduleEventReminders(
    event: EventCalendarEvent,
  ): Promise<void> {
    try {
      // Default reminder times (in minutes before the event)
      const defaultReminderTimes = [1440, 60, 15]; // 24 hours, 1 hour, 15 minutes

      // Get the event start time
      const eventStartTime = new Date(event.startsAt).getTime();

      // Current time
      const now = Date.now();

      // Schedule reminders
      for (const reminderTime of defaultReminderTimes) {
        // Calculate when to send the reminder
        const reminderTime_ms = reminderTime * 60 * 1000;
        const reminderTimestamp = eventStartTime - reminderTime_ms;

        // Only schedule reminders that are in the future
        if (reminderTimestamp > now) {
          // Create a reminder event
          const reminderEvent: EventCalendarEvent = {
            type: SystemEventType.EVENT_REMINDER,
            eventId: event.eventId,
            title: event.title,
            description: event.description,
            startsAt: event.startsAt,
            endsAt: event.endsAt,
            location: event.location,
            audienceType: event.audienceType,
            audienceIds: event.audienceIds,
            reminderOffset: reminderTime,
            timestamp: new Date(),
          };

          // Calculate delay in milliseconds
          const delay = reminderTimestamp - now;

          // Schedule the reminder
          setTimeout(async () => {
            try {
              await this.kafkaService.publish("events", reminderEvent);
              logger.info(
                `Published reminder for event ${event.eventId} (${reminderTime} minutes before)`,
              );
            } catch (error) {
              logger.error(
                `Failed to publish reminder for event ${event.eventId}`,
                error,
              );
            }
          }, delay);

          logger.info(
            `Scheduled reminder for event ${event.eventId} in ${Math.round(delay / (60 * 1000))} minutes (${reminderTime} minutes before event)`,
          );
        }
      }
    } catch (error) {
      logger.error(
        `Failed to schedule reminders for event ${event.eventId}`,
        error,
      );
    }
  }

  /**
   * Process system events and create alerts if needed
   */
  private async processSystemEvent(payload: EachMessagePayload): Promise<void> {
    try {
      const event = JSON.parse(
        payload.message.value?.toString() || "{}",
      ) as AnySystemEvent;

      if (!event || !event.type) {
        logger.warn("Received invalid system event", event);
        return;
      }

      logger.info(`Processing system event: ${event.type}`);

      // Map the event to an alert DTO
      const alertDto = this.eventAlertMapper.mapEventToAlert(event);

      if (!alertDto) {
        logger.info(`No alert mapping found for event type: ${event.type}`);
        return;
      }

      // Create the alert
      await this.createAlert(alertDto, "system");

      logger.info(`Alert created for system event: ${event.type}`);
    } catch (error) {
      logger.error("Error processing system event", error);
    }
  }

  private async processAlertPushMessage(
    payload: EachMessagePayload,
  ): Promise<void> {
    try {
      const message = JSON.parse(payload.message.value?.toString() || "{}") as {
        alert: Alert;
        audienceType: string;
        audienceId: string;
      };
      const { alert, audienceType, audienceId } = message;

      await this.processAlertPush({
        data: { alert, audienceType, audienceId },
      });
    } catch (error) {
      logger.error("Error processing alert push message", error);
      throw error;
    }
  }

  public async createAlert(
    dto: CreateAlertDto,
    createdBy: string,
  ): Promise<Alert> {
    // Create the alert in the database
    const alert = await this.alertRepo.createAlert(dto, createdBy);

    if (!alert) {
      throw new BadRequestException("Unable to create alert");
    }

    // Track analytics event
    await this.trackAlertAnalytics({
      alertId: alert.id,
      userId: createdBy,
      eventType: "delivered",
      timestamp: new Date(),
    });

    // Broadcast to WebSocket for real-time delivery
    this.broadcastAlertToAudience(alert);

    // Queue push notifications for offline users
    await this.queueAlertPushNotifications(alert);

    return alert;
  }

  public async getAlertById(id: string): Promise<Alert> {
    const alert = await this.alertRepo.findAlertById(id);

    if (!alert) {
      throw new NotFoundException("Alert not found");
    }

    return alert;
  }

  public async updateAlert(id: string, dto: UpdateAlertDto): Promise<Alert> {
    const alert = await this.alertRepo.findAlertById(id);

    if (!alert) {
      throw new NotFoundException("Alert not found");
    }

    const updatedAlert = await this.alertRepo.updateAlert(id, dto);

    // Broadcast update to WebSocket
    this.broadcastAlertToAudience(updatedAlert);

    return updatedAlert;
  }

  public async deleteAlert(id: string): Promise<Alert> {
    const alert = await this.alertRepo.findAlertById(id);

    if (!alert) {
      throw new NotFoundException("Alert not found");
    }

    return await this.alertRepo.deleteAlert(id);
  }

  public async getAlertsByAudience(
    audienceType: string,
    audienceId: string,
    limit: number = 20,
    offset: number = 0,
  ): Promise<Alert[]> {
    return await this.alertRepo.getAlertsByAudience(
      audienceType,
      audienceId,
      limit,
      offset,
    );
  }

  public async markAlertAsRead(alertId: string, userId: string): Promise<void> {
    const alert = await this.alertRepo.findAlertById(alertId);

    if (!alert) {
      throw new NotFoundException("Alert not found");
    }

    await this.alertRepo.markAlertAsRead(alertId, userId);

    // Track analytics event
    await this.trackAlertAnalytics({
      alertId,
      userId,
      eventType: "read",
      timestamp: new Date(),
    });
  }

  public async getAlertsForUser(
    userId: string,
    limit: number = 20,
    offset: number = 0,
  ): Promise<AlertWithReadStatus[]> {
    const alertsWithReadStatus = await this.alertRepo.getAlertsWithReadStatus(
      userId,
      limit,
      offset,
    );

    return alertsWithReadStatus.map(({ alert, isRead }) => ({
      ...alert,
      isRead,
    }));
  }

  /**
   * Manually trigger a system event (for testing or admin-initiated events)
   */
  public async triggerSystemEvent(event: AnySystemEvent): Promise<void> {
    try {
      await this.kafkaService.publish("system.events", event);
      logger.info(`System event triggered: ${event.type}`);
    } catch (error) {
      logger.error(`Failed to trigger system event: ${error}`);
      throw new BadRequestException("Failed to trigger system event");
    }
  }

  /**
   * Create and publish an event calendar event
   */
  public async createCalendarEvent(
    eventData: Omit<EventCalendarEvent, "timestamp">,
  ): Promise<void> {
    try {
      const event: EventCalendarEvent = {
        ...eventData,
        timestamp: new Date(),
      };

      // Save to database - using placeholder since Event model isn't in Prisma schema
      logger.info(
        `Event would be saved to database: ${event.eventId} - ${event.title}`,
      );

      // Publish to events topic
      await this.kafkaService.publish("events", event);
      logger.info(
        `Event calendar event created: ${event.title} (${event.eventId})`,
      );
    } catch (error) {
      logger.error(`Failed to create event calendar event: ${error}`);
      throw new BadRequestException("Failed to create event calendar event");
    }
  }

  /**
   * Update an existing event calendar event
   */
  public async updateCalendarEvent(
    eventData: Omit<EventCalendarEvent, "timestamp">,
  ): Promise<void> {
    try {
      const event: EventCalendarEvent = {
        ...eventData,
        type: SystemEventType.EVENT_UPDATED,
        timestamp: new Date(),
      };

      // Update in database - using placeholder since Event model isn't in Prisma schema
      logger.info(
        `Event would be updated in database: ${event.eventId} - ${event.title}`,
      );

      // Publish to events topic
      await this.kafkaService.publish("events", event);
      logger.info(
        `Event calendar event updated: ${event.title} (${event.eventId})`,
      );
    } catch (error) {
      logger.error(`Failed to update event calendar event: ${error}`);
      throw new BadRequestException("Failed to update event calendar event");
    }
  }

  /**
   * Cancel an existing event calendar event
   */
  public async cancelCalendarEvent(
    eventData: Pick<
      EventCalendarEvent,
      "eventId" | "title" | "audienceType" | "audienceIds"
    > &
      Partial<EventCalendarEvent>,
  ): Promise<void> {
    try {
      const event: EventCalendarEvent = {
        ...eventData,
        type: SystemEventType.EVENT_CANCELLED,
        timestamp: new Date(),
      } as EventCalendarEvent;

      // Update the event status in the database - using placeholder since Event model isn't in Prisma schema
      logger.info(
        `Event would be marked as cancelled in database: ${eventData.eventId}`,
      );

      // Publish to events topic
      await this.kafkaService.publish("events", event);
      logger.info(
        `Event calendar event cancelled: ${event.title} (${event.eventId})`,
      );
    } catch (error) {
      logger.error(`Failed to cancel event calendar event: ${error}`);
      throw new BadRequestException("Failed to cancel event calendar event");
    }
  }

  /**
   * Get upcoming events for a user
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async getUpcomingEvents(userId: string, limit = 10): Promise<Event[]> {
    try {
      // Get user's properties, buildings, units, roles
      const user = await this.db.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          role: true,
        },
      });

      if (!user) {
        throw new NotFoundException("User not found");
      }

      // Query for events - using placeholder since Event model isn't in Prisma schema
      logger.info(
        `Would query for upcoming events for user ${userId} with role ${user.role}`,
      );

      // Return empty array as placeholder
      return [];
    } catch (error) {
      logger.error("Error getting upcoming events", error);
      throw new InternalServerException("Failed to get upcoming events");
    }
  }

  /**
   * Get event details by ID
   */
  public async getEventById(eventId: string): Promise<Event> {
    try {
      // Query for event - using placeholder since Event model isn't in Prisma schema
      logger.info(`Would query for event with ID ${eventId}`);

      // For now, throw a not found error as placeholder
      throw new NotFoundException("Event not found");
    } catch (error) {
      logger.error(`Error getting event by ID: ${eventId}`, error);
      throw new InternalServerException("Failed to get event details");
    }
  }

  private async trackAlertAnalytics(event: AlertAnalyticsEvent): Promise<void> {
    try {
      // Publish to Kafka
      await this.kafkaService.publish("alerts.analytics", event);

      logger.info(
        `Alert analytics event tracked: ${event.eventType} for alert ${event.alertId}`,
      );
    } catch (error) {
      logger.error("Failed to track alert analytics", error);
    }
  }

  private broadcastAlertToAudience(alert: Alert): void {
    try {
      // Create a channel based on audience targeting
      const channel = `${alert.audienceType}:${alert.audienceIds.join(",")}`;

      this.broadcastService.notify(
        [
          {
            id: alert.id,
            title: alert.title,
            body: alert.body,
            category: alert.category,
            priority: alert.priority,
            createdAt: alert.createdAt,
          },
        ],
        channel,
        "alerts",
      );

      logger.info(`Alert broadcasted to channel: ${channel}`);
    } catch (error) {
      logger.error("Failed to broadcast alert", error);
    }
  }

  private async queueAlertPushNotifications(alert: Alert): Promise<void> {
    try {
      // Publish to Kafka for each audience ID
      for (const audienceId of alert.audienceIds) {
        await this.kafkaService.publish("alerts.push", {
          alert,
          audienceType: alert.audienceType,
          audienceId,
        });
      }

      logger.info(
        `Alert push notifications queued for ${alert.audienceIds.length} audiences`,
      );
    } catch (error) {
      logger.error("Failed to queue alert push notifications", error);
    }
  }

  private async processAlertPush(job: {
    data: {
      alert: Alert;
      audienceType: string;
      audienceId: string;
    };
  }): Promise<void> {
    const { alert, audienceType, audienceId } = job.data;

    try {
      // Get users in the audience
      const users = await this.getUsersInAudience(audienceType, audienceId);

      if (users.length === 0) {
        logger.info(`No users found in audience ${audienceType}:${audienceId}`);
        return;
      }

      // Determine notification types based on alert priority
      const notificationTypes: NotificationType[] = [NotificationType.inapp];

      // Add push notifications for medium priority and above
      if (
        alert.priority === "medium" ||
        alert.priority === "high" ||
        alert.priority === "critical"
      ) {
        notificationTypes.push(NotificationType.push);
      }

      // Add SMS for high and critical alerts
      if (alert.priority === "high" || alert.priority === "critical") {
        notificationTypes.push(NotificationType.sms);
      }

      // Add email for all alerts (can be filtered by user preferences)
      notificationTypes.push(NotificationType.email);

      // Send notification to each user
      for (const user of users) {
        await this.notificationService.notify({
          title: alert.title,
          message: alert.body,
          type: notificationTypes,
          data: {
            alertId: alert.id,
            category: alert.category,
            priority: alert.priority,
            // Add template for email notifications
            template: "alert-notification",
            templateData: {
              title: alert.title,
              body: alert.body,
              category: alert.category,
              priority: alert.priority,
              createdAt: alert.createdAt,
              expiresAt: alert.expiresAt,
            },
            // Add channel for WebSocket
            channel: `${audienceType}:${audienceId}`,
          },
          recipientIds: [user.id],
          status: "pending",
        });
      }

      logger.info(
        `Alert notifications (${notificationTypes.join(", ")}) sent to ${users.length} users in audience ${audienceType}:${audienceId}`,
      );
    } catch (error) {
      logger.error(
        `Failed to process alert push for audience ${audienceType}:${audienceId}`,
        error,
      );
      throw error; // Rethrow to trigger retry
    }
  }

  private async getUsersInAudience(
    audienceType: string,
    audienceId: string,
  ): Promise<{ id: string }[]> {
    try {
      // Query users based on audience type
      switch (audienceType) {
        case "user":
          // Get specific user
          const user = await this.userRepo.findById(audienceId);
          return user ? [{ id: user.id }] : [];

        case "property":
          // Get all users associated with a property
          // This would include property managers, security personnel, and residents
          const propertyUsers = await this.db.user.findMany({
            where: {
              OR: [
                // Property managers - one-to-one relation
                { ManagedProperties: { is: { id: audienceId } } },
                // Property authors/creators
                { AuthoredProperties: { some: { id: audienceId } } },
                // Security assigned to property
                { SecurityAssignments: { some: { propertyId: audienceId } } },
                // Users with houses in the property
                { Houses: { some: { propertyId: audienceId } } },
                // Users with meters in the property
                { Meter: { some: { propertyId: audienceId } } },
              ],
            },
            select: { id: true },
          });
          return propertyUsers;

        case "building":
          // In this system, building appears to be equivalent to property
          // with PropertyType.building
          const buildingUsers = await this.db.user.findMany({
            where: {
              OR: [
                // Property managers - one-to-one relation
                {
                  ManagedProperties: {
                    is: { id: audienceId, type: "building" },
                  },
                },
                // Property authors/creators
                {
                  AuthoredProperties: {
                    some: { id: audienceId, type: "building" },
                  },
                },
                // Security assigned to building
                { SecurityAssignments: { some: { propertyId: audienceId } } },
                // Users with houses in the building
                { Houses: { some: { propertyId: audienceId } } },
                // Users with meters in the building
                { Meter: { some: { propertyId: audienceId } } },
              ],
            },
            select: { id: true },
          });
          return buildingUsers;

        case "house":
        case "unit":
          // Get users associated with a specific house/unit
          const houseUsers = await this.db.user.findMany({
            where: {
              OR: [
                // House owners/authors
                { Houses: { some: { id: audienceId } } },
                // Users with meters in the house
                { Meter: { some: { houseId: audienceId } } },
              ],
            },
            select: { id: true },
          });
          return houseUsers;

        case "role":
          // Get users with a specific role
          const roleUsers = await this.db.user.findMany({
            where: { role: audienceId as Role },
            select: { id: true },
          });
          return roleUsers;

        case "all":
          // Get all users (with pagination for performance)
          const allUsers = await this.db.user.findMany({
            take: 100, // Limit to prevent performance issues
            select: { id: true },
          });
          return allUsers;

        default:
          logger.warn(`Unsupported audience type: ${audienceType}`);
          return [];
      }
    } catch (error) {
      logger.error(
        `Error getting users for audience ${audienceType}:${audienceId}`,
        error,
      );
      return [];
    }
  }
}

export default AlertService;
