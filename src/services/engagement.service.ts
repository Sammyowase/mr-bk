import {
  EngagementInteraction,
  EngagementPost,
  PrismaClient,
  Role,
  NotificationType,
} from "../../prisma/generated/prisma";
import EngagementRepository from "../repository/engagement.repository";
import UserRepository from "../repository/user.repository";
import {
  CreateEngagementDto,
  CreateInteractionDto,
  EngagementAnalyticsEvent,
  EngagementWithInteractions,
  UpdateEngagementDto,
} from "../types/engagement";
import {
  BadRequestException,
  NotFoundException,
} from "../utils/exceptions/customException";
import { logger } from "../utils/logger/logger";
import { injectable } from "tsyringe";
import { BroadcastService } from "./ws-broadcast.service";
import { KafkaService } from "./kafka.service";
import { EachMessagePayload } from "kafkajs";
import NotificationService from "./notification.service";

@injectable()
class EngagementService {
  private db: PrismaClient;

  constructor(
    private engagementRepo: EngagementRepository,
    private userRepo: UserRepository,
    private kafkaService: KafkaService,
    private broadcastService: BroadcastService,
    private notificationService: NotificationService,
  ) {
    // Initialize Prisma client
    this.db = new PrismaClient();

    // Initialize Kafka consumers
    this.initKafkaConsumers();
  }

  private async initKafkaConsumers(): Promise<void> {
    try {
      // Subscribe to engagement analytics (for future analytics processing)
      await this.kafkaService.subscribe(
        "engagement.analytics",
        "engagement-analytics-group",
        this.processEngagementAnalyticsMessage.bind(this),
      );

      // Subscribe to engagement posts to notify via NotificationService (mirrors AlertService)
      await this.kafkaService.subscribe(
        "engagement.posts",
        "engagement-notify-group",
        this.processEngagementPostMessage.bind(this),
      );

      // Subscribe to engagement interactions to notify post owners
      await this.kafkaService.subscribe(
        "engagement.interactions",
        "engagement-interactions-notify-group",
        this.processEngagementInteractionMessage.bind(this),
      );

      logger.info("Engagement Kafka consumers initialized");
    } catch (error) {
      logger.error("Failed to initialize Engagement Kafka consumers", error);
    }
  }

  private async processEngagementAnalyticsMessage(
    payload: EachMessagePayload,
  ): Promise<void> {
    try {
      const event = JSON.parse(
        payload.message.value?.toString() || "{}",
      ) as EngagementAnalyticsEvent;
      logger.info(
        `Processed engagement analytics event: ${event.eventType} for post ${event.postId}`,
      );
    } catch (error) {
      logger.error("Error processing engagement analytics message", error);
    }
  }

  // NEW: consume engagement.posts and notify users like AlertService
  private async processEngagementPostMessage(
    payload: EachMessagePayload,
  ): Promise<void> {
    try {
      const msg = JSON.parse(
        payload.message.value?.toString() || "{}",
      ) as Partial<EngagementPost> & {
        action?: "update" | "delete";
      };

      if (
        !msg ||
        !msg.id ||
        !msg.audienceType ||
        !Array.isArray(msg.audienceIds)
      ) {
        logger.warn("Received invalid engagement post message", msg);
        return;
      }

      if (msg.action === "delete") return; // nothing to notify for deletions

      await this.notifyUsersAboutEngagementPost(
        msg as EngagementPost,
        msg.action === "update",
      );
    } catch (error) {
      logger.error("Error processing engagement post message", error);
    }
  }

  // Notify on interactions (e.g., comments) to post author
  private async processEngagementInteractionMessage(
    payload: EachMessagePayload,
  ): Promise<void> {
    try {
      const interaction = JSON.parse(
        payload.message.value?.toString() || "{}",
      ) as EngagementInteraction;
      if (
        !interaction ||
        !interaction.id ||
        !interaction.postId ||
        !interaction.userId
      ) {
        logger.warn(
          "Received invalid engagement interaction message",
          interaction,
        );
        return;
      }

      // Fetch post to get audience and owner
      const post = await this.engagementRepo.findEngagementPostById(
        interaction.postId,
      );
      if (!post) {
        logger.warn(
          `Post ${interaction.postId} not found for interaction notify`,
        );
        return;
      }

      // Notify post creator if available and not the same user
      const recipients = new Set<string>();
      if (post.createdBy && post.createdBy !== interaction.userId) {
        recipients.add(post.createdBy);
      }

      if (recipients.size === 0) return;

      const channel = `post:${interaction.postId}`;
      const title = "New interaction on your post";
      const message = interaction.content
        ? interaction.content.slice(0, 160)
        : `${interaction.interactionType} on your post`;

      for (const userId of recipients) {
        await this.notificationService.notify({
          title,
          message,
          type: [NotificationType.inapp],
          data: {
            postId: interaction.postId,
            interactionId: interaction.id,
            interactionType: interaction.interactionType,
            channel,
          },
          recipientIds: [userId],
          status: "pending",
        });
      }

      logger.info(
        `Engagement interaction notifications sent for post: ${interaction.postId}`,
      );
    } catch (error) {
      logger.error("Error processing engagement interaction message", error);
    }
  }

  public async createEngagementPost(
    dto: CreateEngagementDto,
    createdBy: string,
  ): Promise<EngagementPost> {
    // Create the engagement post in the database
    const post = await this.engagementRepo.createEngagementPost(dto, createdBy);

    if (!post) {
      throw new BadRequestException("Unable to create engagement post");
    }

    // Publish to Kafka
    await this.kafkaService.publish("engagement.posts", post);

    // Broadcast to WebSocket for real-time delivery
    this.broadcastEngagementToAudience(post);

    return post;
  }

  public async getEngagementPostById(
    id: string,
    userId?: string,
  ): Promise<EngagementPost> {
    const post = await this.engagementRepo.findEngagementPostById(id);

    if (!post) {
      throw new NotFoundException("Engagement post not found");
    }

    // Track view analytics with the actual user ID if available
    await this.trackEngagementAnalytics({
      postId: post.id,
      userId: userId || "anonymous", // Use the provided user ID or 'anonymous' if not available
      eventType: "viewed",
      timestamp: new Date(),
    });

    return post;
  }

  public async updateEngagementPost(
    id: string,
    dto: UpdateEngagementDto,
  ): Promise<EngagementPost> {
    const post = await this.engagementRepo.findEngagementPostById(id);

    if (!post) {
      throw new NotFoundException("Engagement post not found");
    }

    const updatedPost = await this.engagementRepo.updateEngagementPost(id, dto);

    // Publish to Kafka
    await this.kafkaService.publish("engagement.posts", {
      ...updatedPost,
      action: "update",
    });

    // Broadcast update to WebSocket
    this.broadcastEngagementToAudience(updatedPost);

    return updatedPost;
  }

  public async deleteEngagementPost(id: string): Promise<EngagementPost> {
    const post = await this.engagementRepo.findEngagementPostById(id);

    if (!post) {
      throw new NotFoundException("Engagement post not found");
    }

    const deletedPost = await this.engagementRepo.deleteEngagementPost(id);

    // Publish to Kafka
    await this.kafkaService.publish("engagement.posts", {
      id: deletedPost.id,
      action: "delete",
    });

    return deletedPost;
  }

  public async getEngagementPostsByAudience(
    audienceType: string,
    audienceId: string,
    limit: number = 20,
    offset: number = 0,
  ): Promise<EngagementPost[]> {
    return await this.engagementRepo.getEngagementPostsByAudience(
      audienceType,
      audienceId,
      limit,
      offset,
    );
  }

  public async createInteraction(
    postId: string,
    userId: string,
    dto: CreateInteractionDto,
  ): Promise<EngagementInteraction> {
    const post = await this.engagementRepo.findEngagementPostById(postId);

    if (!post) {
      throw new NotFoundException("Engagement post not found");
    }

    const interaction = await this.engagementRepo.createInteraction(
      postId,
      userId,
      dto,
    );

    // Track interaction analytics
    await this.trackEngagementAnalytics({
      postId,
      userId,
      eventType: "interacted",
      interactionType: dto.interactionType,
      timestamp: new Date(),
    });

    // Publish to Kafka
    await this.kafkaService.publish("engagement.interactions", interaction);

    // Broadcast interaction to WebSocket
    this.broadcastInteraction(interaction);

    return interaction;
  }

  public async getInteractionsByPostId(
    postId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<EngagementInteraction[]> {
    const post = await this.engagementRepo.findEngagementPostById(postId);

    if (!post) {
      throw new NotFoundException("Engagement post not found");
    }

    return await this.engagementRepo.getInteractionsByPostId(
      postId,
      limit,
      offset,
    );
  }

  public async getEngagementPostsForUser(
    userId: string,
    limit: number = 20,
    offset: number = 0,
  ): Promise<EngagementWithInteractions[]> {
    const postsWithInteractionData =
      await this.engagementRepo.getEngagementPostsWithInteractionData(
        userId,
        limit,
        offset,
      );

    return postsWithInteractionData.map(
      ({ post, interactionCount, userInteracted }) => ({
        ...post,
        interactionCount,
        userInteracted,
      }),
    );
  }

  private async trackEngagementAnalytics(
    event: EngagementAnalyticsEvent,
  ): Promise<void> {
    try {
      // Publish to Kafka
      await this.kafkaService.publish("engagement.analytics", event);

      logger.info(
        `Engagement analytics event tracked: ${event.eventType} for post ${event.postId}`,
      );
    } catch (error) {
      logger.error("Failed to track engagement analytics", error);
    }
  }

  // Mirror AlertService: resolve audience and use NotificationService
  private async notifyUsersAboutEngagementPost(
    post: EngagementPost,
    isUpdate: boolean,
  ): Promise<void> {
    try {
      // Aggregate distinct users across audienceIds
      const userMap = new Map<string, { id: string }>();
      for (const audienceId of post.audienceIds) {
        const users = await this.getUsersInAudience(
          post.audienceType,
          audienceId,
        );
        users.forEach((u) => userMap.set(u.id, u));
      }
      const users = Array.from(userMap.values());

      if (users.length === 0) {
        logger.info(
          `No users found in audience ${post.audienceType}:${post.audienceIds.join(",")}`,
        );
        return;
      }

      const title = isUpdate ? `Updated: ${post.title}` : `New: ${post.title}`;
      const message =
        post.type === "poll"
          ? "A new poll has been posted. Cast your vote."
          : (post.content || "").slice(0, 160);

      const channel = `${post.audienceType}:${post.audienceIds.join(",")}`;

      for (const user of users) {
        await this.notificationService.notify({
          title,
          message,
          type: [NotificationType.inapp], // follow AlertService baseline
          data: {
            postId: post.id,
            type: post.type,
            channel,
          },
          recipientIds: [user.id],
          status: "pending",
        });
      }

      logger.info(
        `Engagement ${isUpdate ? "update" : "create"} notifications sent to ${users.length} users for post: ${post.id}`,
      );
    } catch (error) {
      logger.error("Failed to send engagement post notifications", error);
    }
  }

  // Broadcast an engagement post to audience channels (real-time WS)
  private broadcastEngagementToAudience(post: EngagementPost): void {
    try {
      const channel = `${post.audienceType}:${post.audienceIds.join(",")}`;

      this.broadcastService.notify(
        [
          {
            id: post.id,
            title: post.title,
            content: post.content,
            type: post.type,
            options: post.options,
            createdAt: post.createdAt,
          },
        ],
        channel,
        "engagement",
      );

      logger.info(`Engagement post broadcasted to channel: ${channel}`);
    } catch (error) {
      logger.error("Failed to broadcast engagement post", error);
    }
  }

  // Broadcast an interaction to both post-specific and audience channels
  private async broadcastInteraction(
    interaction: EngagementInteraction,
  ): Promise<void> {
    try {
      const post = await this.engagementRepo.findEngagementPostById(
        interaction.postId,
      );

      if (!post) {
        logger.warn(
          `Post ${interaction.postId} not found for interaction broadcast`,
        );
        return;
      }

      const postChannel = `post:${interaction.postId}`;
      const audienceChannel = `${post.audienceType}:${post.audienceIds.join(",")}`;

      const interactionData = {
        id: interaction.id,
        postId: interaction.postId,
        userId: interaction.userId,
        interactionType: interaction.interactionType,
        content: interaction.content,
        createdAt: interaction.createdAt,
      };

      this.broadcastService.notify(
        [interactionData],
        postChannel,
        "engagement-interaction",
      );
      this.broadcastService.notify(
        [interactionData],
        audienceChannel,
        "engagement-interaction",
      );

      logger.info(
        `Interaction broadcasted to channels: ${postChannel}, ${audienceChannel}`,
      );
    } catch (error) {
      logger.error("Failed to broadcast interaction", error);
    }
  }

  // Reuse audience resolver logic (pattern copied from AlertService)
  private async getUsersInAudience(
    audienceType: string,
    audienceId: string,
  ): Promise<{ id: string }[]> {
    try {
      switch (audienceType) {
        case "user": {
          const user = await this.userRepo.findById(audienceId);
          return user ? [{ id: user.id }] : [];
        }
        case "property": {
          const propertyUsers = await this.db.user.findMany({
            where: {
              OR: [
                { ManagedProperties: { is: { id: audienceId } } },
                { AuthoredProperties: { some: { id: audienceId } } },
                { SecurityAssignments: { some: { propertyId: audienceId } } },
                { Houses: { some: { propertyId: audienceId } } },
                { Meter: { some: { propertyId: audienceId } } },
              ],
            },
            select: { id: true },
          });
          return propertyUsers;
        }
        case "building": {
          const buildingUsers = await this.db.user.findMany({
            where: {
              OR: [
                {
                  ManagedProperties: {
                    is: { id: audienceId, type: "building" },
                  },
                },
                {
                  AuthoredProperties: {
                    some: { id: audienceId, type: "building" },
                  },
                },
                { SecurityAssignments: { some: { propertyId: audienceId } } },
                { Houses: { some: { propertyId: audienceId } } },
                { Meter: { some: { propertyId: audienceId } } },
              ],
            },
            select: { id: true },
          });
          return buildingUsers;
        }
        case "house":
        case "unit": {
          const houseUsers = await this.db.user.findMany({
            where: {
              OR: [
                { Houses: { some: { id: audienceId } } },
                { Meter: { some: { houseId: audienceId } } },
              ],
            },
            select: { id: true },
          });
          return houseUsers;
        }
        case "role": {
          const roleUsers = await this.db.user.findMany({
            where: { role: audienceId as Role },
            select: { id: true },
          });
          return roleUsers;
        }
        case "all": {
          const allUsers = await this.db.user.findMany({
            take: 100,
            select: { id: true },
          });
          return allUsers;
        }
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

export default EngagementService;
