import { Request, Response } from "express";
import { container } from "tsyringe";
import EngagementService from "../../services/engagement.service";
import sendResponse from "../../utils/http/sendResponse";

export const createEngagementPost = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const postData = req.body;

  const service = container.resolve(EngagementService);

  const post = await service.createEngagementPost(postData, userId);

  sendResponse(res, 201, "Engagement post created successfully", post);
};

export default createEngagementPost;
