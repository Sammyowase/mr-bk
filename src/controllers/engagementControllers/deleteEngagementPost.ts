import { Request, Response } from "express";
import { container } from "tsyringe";
import EngagementService from "../../services/engagement.service";
import sendResponse from "../../utils/http/sendResponse";

export const deleteEngagementPost = async (req: Request, res: Response) => {
  const postId = req.params.id;

  const service = container.resolve(EngagementService);

  await service.deleteEngagementPost(postId);

  sendResponse(res, 200, "Engagement post deleted successfully");
};

export default deleteEngagementPost;
