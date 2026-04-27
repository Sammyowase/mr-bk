import { Request, Response } from "express";
import { container } from "tsyringe";
import EngagementService from "../../services/engagement.service";
import sendResponse from "../../utils/http/sendResponse";

export const getEngagementPosts = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
  const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;

  const service = container.resolve(EngagementService);

  const posts = await service.getEngagementPostsForUser(userId, limit, offset);

  sendResponse(res, 200, "Engagement posts retrieved successfully", posts);
};

export default getEngagementPosts;
