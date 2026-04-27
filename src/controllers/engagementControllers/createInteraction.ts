import { Request, Response } from "express";
import { container } from "tsyringe";
import EngagementService from "../../services/engagement.service";
import sendResponse from "../../utils/http/sendResponse";

export const createInteraction = async (req: Request, res: Response) => {
  const postId = req.params.id;
  const userId = req.user?.id;
  const interactionData = req.body;

  const service = container.resolve(EngagementService);

  const interaction = await service.createInteraction(
    postId,
    userId,
    interactionData,
  );

  sendResponse(res, 201, "Interaction created successfully", interaction);
};

export default createInteraction;
