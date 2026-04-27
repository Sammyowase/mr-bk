import { Request, Response } from "express";
import { ToggleVendingSuspensionDto } from "../../types/property";
import PropertyService from "../../services/property.service";
import { container } from "tsyringe";
import sendResponse from "../../utils/http/sendResponse";

/**
 * Toggles the suspension status of a property's vending.
 *
 * @param {Request} req - The HTTP request object containing the property ID and suspension status.
 * @param {Response} res - The HTTP response object.
 * @returns {Promise<Response>} - A promise that resolves to the HTTP response.
 */
export const toggleVendingSuspension = async (req: Request, res: Response) => {
  const propertyId = req.params.id;
  const { isVendingSuspended } = req.body as ToggleVendingSuspensionDto;

  const propertyService = container.resolve(PropertyService);

  const updatedProperty = await propertyService.toggleVendingSuspension(
    req,
    propertyId,
    isVendingSuspended,
  );

  sendResponse(
    res,
    200,
    isVendingSuspended
      ? "Vending has been suspended for this estate"
      : "Vending has been resumed for this estate",
    updatedProperty,
  );
  return;
};

export default toggleVendingSuspension;
