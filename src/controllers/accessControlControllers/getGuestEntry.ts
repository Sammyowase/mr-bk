import { Request, Response } from "express";
import AccessControlService from "../../services/access-control.service";
import sendResponse from "../../utils/http/sendResponse";
import { container } from "../../utils/handler/container";

export const getGuestEntryLog = async (req: Request, res: Response) => {
  const { id } = req.params;

  const service = container.resolve(AccessControlService);

  const result = await service.getGuestEntryLog(id);

  if (!result) {
    sendResponse(res, 404, "Guest entry not found", null);
    return;
  }

  const plainResult = JSON.parse(JSON.stringify(result));

  const response = {
    ...plainResult,
    token: plainResult.accessToken?.code || null,
    accessToken: plainResult.accessToken
      ? {
          ...plainResult.accessToken,
          code: plainResult.accessToken.code,
        }
      : null,
  };

  sendResponse(res, 200, "Guest entry retrieved successfully", response);
  return;
};
