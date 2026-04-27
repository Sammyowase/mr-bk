import { Request, Response } from "express";
import { container } from "tsyringe";
import HouseService from "../../services/house.service";
import { UpdateHouseDto } from "../../types/house";
import sendResponse from "../../utils/http/sendResponse";

/**
 * Updates a house by its ID.
 *
 * @param req - Express request object containing house ID and update data
 * @param res - Express response object
 * @returns A response with the updated house data
 */
export const updateHouse = async (req: Request, res: Response) => {
  const houseId = req.params.houseId;
  const updateData: UpdateHouseDto = req.body;
  const userId = req.user?.id as string;

  const houseService = container.resolve(HouseService);
  const updatedHouse = await houseService.updateHouse(
    houseId,
    updateData,
    userId,
  );

  sendResponse(res, 200, "House updated successfully", updatedHouse);
  return;
};
