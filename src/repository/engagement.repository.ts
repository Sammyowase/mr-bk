import {
  EngagementInteraction,
  EngagementPost,
  Prisma,
} from "../../prisma/generated/prisma";
import { Database } from "../models/database";
import {
  CreateEngagementDto,
  CreateInteractionDto,
  UpdateEngagementDto,
} from "../types/engagement";
import { injectable } from "tsyringe";

@injectable()
class EngagementRepository {
  constructor(private db: Database) {}

  public async createEngagementPost(
    dto: CreateEngagementDto,
    createdBy: string,
  ): Promise<EngagementPost> {
    return await this.db.engagementPost.create({
      data: {
        ...dto,
        options: dto.options ? JSON.stringify(dto.options) : Prisma.JsonNull,
        createdBy,
      },
    });
  }

  public async findEngagementPostById(
    id: string,
  ): Promise<EngagementPost | null> {
    return await this.db.engagementPost.findUnique({
      where: {
        id,
      },
    });
  }

  public async updateEngagementPost(
    id: string,
    dto: UpdateEngagementDto,
  ): Promise<EngagementPost> {
    return await this.db.engagementPost.update({
      where: {
        id,
      },
      data: {
        ...dto,
      },
    });
  }

  public async deleteEngagementPost(id: string): Promise<EngagementPost> {
    return await this.db.engagementPost.delete({
      where: {
        id,
      },
    });
  }

  public async getEngagementPostsByAudience(
    audienceType: string,
    audienceId: string,
    limit: number = 20,
    offset: number = 0,
  ): Promise<EngagementPost[]> {
    return await this.db.engagementPost.findMany({
      where: {
        audienceType,
        audienceIds: {
          has: audienceId,
        },
        OR: [
          {
            expiresAt: {
              gt: new Date(),
            },
          },
          {
            expiresAt: null,
          },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: offset,
      take: limit,
    });
  }

  public async createInteraction(
    postId: string,
    userId: string,
    dto: CreateInteractionDto,
  ): Promise<EngagementInteraction> {
    return await this.db.engagementInteraction.create({
      data: {
        postId,
        userId,
        interactionType: dto.interactionType,
        content: dto.content,
      },
    });
  }

  public async getInteractionsByPostId(
    postId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<EngagementInteraction[]> {
    return await this.db.engagementInteraction.findMany({
      where: {
        postId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            userName: true,
          },
        },
      },
      skip: offset,
      take: limit,
    });
  }

  public async getInteractionCountByPostId(postId: string): Promise<number> {
    return await this.db.engagementInteraction.count({
      where: {
        postId,
      },
    });
  }

  public async hasUserInteractedWithPost(
    postId: string,
    userId: string,
  ): Promise<boolean> {
    const count = await this.db.engagementInteraction.count({
      where: {
        postId,
        userId,
      },
    });
    return count > 0;
  }

  public async getEngagementPostsWithInteractionData(
    userId: string,
    limit: number = 20,
    offset: number = 0,
  ): Promise<
    {
      post: EngagementPost;
      interactionCount: number;
      userInteracted: boolean;
    }[]
  > {
    const posts = await this.db.engagementPost.findMany({
      where: {
        OR: [
          {
            expiresAt: {
              gt: new Date(),
            },
          },
          {
            expiresAt: null,
          },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: offset,
      take: limit,
    });

    const postIds = posts.map((post) => post.id);

    // Get interaction counts for each post
    const interactionCounts = await Promise.all(
      postIds.map(async (postId) => {
        return {
          postId,
          count: await this.getInteractionCountByPostId(postId),
        };
      }),
    );

    // Check if user has interacted with each post
    const userInteractions = await Promise.all(
      postIds.map(async (postId) => {
        return {
          postId,
          interacted: await this.hasUserInteractedWithPost(postId, userId),
        };
      }),
    );

    // Create a map for faster lookups
    const countMap = new Map<string, number>();
    interactionCounts.forEach((item) => {
      countMap.set(item.postId, item.count);
    });

    const interactionMap = new Map<string, boolean>();
    userInteractions.forEach((item) => {
      interactionMap.set(item.postId, item.interacted);
    });

    return posts.map((post) => ({
      post,
      interactionCount: countMap.get(post.id) || 0,
      userInteracted: interactionMap.get(post.id) || false,
    }));
  }
}

export default EngagementRepository;
