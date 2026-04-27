import { Request, Response } from "express";
import { container } from "tsyringe";
import EngagementService from "../../services/engagement.service";
import sendResponse from "../../utils/http/sendResponse";

export const getInteractions = async (req: Request, res: Response) => {
  const postId = req.params.id;
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
  const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;

  const service = container.resolve(EngagementService);

  const interactions = await service.getInteractionsByPostId(
    postId,
    limit,
    offset,
  );

  sendResponse(res, 200, "Interactions retrieved successfully", interactions);
};

export default getInteractions;
