import {
  EngagementPost,
  EngagementType,
  InteractionType,
} from "../../prisma/generated/prisma";

export interface CreateEngagementDto {
  title: string;
  content: string;
  type: EngagementType;
  options?: string[]; // For polls
  audienceType: string;
  audienceIds: string[];
  expiresAt?: Date;
}

export interface UpdateEngagementDto {
  title?: string;
  content?: string;
  expiresAt?: Date | null;
}

export interface CreateInteractionDto {
  interactionType: InteractionType;
  content?: string; // Comment text or selected option
}

export interface EngagementWithInteractions extends EngagementPost {
  interactionCount: number;
  userInteracted: boolean;
}

export interface EngagementAnalyticsEvent {
  postId: string;
  userId: string;
  eventType: "viewed" | "interacted";
  interactionType?: InteractionType;
  timestamp: Date;
}
