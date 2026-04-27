import { Request, Response } from "express";
import { container } from "tsyringe";
import EngagementService from "../../services/engagement.service";
import sendResponse from "../../utils/http/sendResponse";

export const getEngagementPostById = async (req: Request, res: Response) => {
  const postId = req.params.id;
  // Get the user ID from the authenticated request
  const userId = req.user?.id;

  const service = container.resolve(EngagementService);

  const post = await service.getEngagementPostById(postId, userId);

  sendResponse(res, 200, "Engagement post retrieved successfully", post);
};

export default getEngagementPostById;
