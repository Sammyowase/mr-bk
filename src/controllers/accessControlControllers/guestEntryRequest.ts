import { Request, Response } from "express";
import AccessControlService from "../../services/access-control.service";
import sendResponse from "../../utils/http/sendResponse";
import { EntryRequestDto } from "../../types/access-control";
import { container } from "../../utils/handler/container";

export const guestEntryRequest = async (req: Request, res: Response) => {
  const dto: EntryRequestDto = req.body;

  dto.securityId = req.user?.id;

  const service = container.resolve(AccessControlService);

  const accessPoint = await service.entryRequest(dto);

  sendResponse(
    res,
    201,
    "Guest entry request created successfully",
    accessPoint,
  );
  return;
};
