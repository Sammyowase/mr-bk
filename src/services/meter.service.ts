import { Meter } from "../../prisma/generated/prisma";
import MeterRepository from "../repository/meter.repository";
import { NotFoundException } from "../utils/exceptions/customException";
import { previewMeter } from "../utils/service/meterServices/previewMeter";
import { injectable } from "tsyringe";
import { UpdateMeterDto } from "../types/vending";
import AuditLogService from "./audit.service";
/**
 * Service class for handling operations related to meters.
 *
 * @remarks
 * This class provides methods to interact with meter data,
 * including fetching a user's meter, verifying meter numbers,
 * updating meters, and retrieving meters by various criteria.
 *
 * @example
 * ```typescript
 * const meter = await MeterService['getUserMeter'](userId);
 * const verified = await MeterService['verifyMeter'](meterNumber);
 * const allMeters = await MeterService['getAllMetersWithDetails']();
 * const propertyMeters = await MeterService['getMetersByPropertyId'](propertyId);
 * ```
 */
@injectable()
class MeterService {
  constructor(
    private meterRepo: MeterRepository,
    private auditService: AuditLogService,
  ) {}

  /**
   * Fetches the meter number associated with the authenticated user.
   *
   * @param ownerId - The ID of the user whose meter is to be fetched.
   * @returns A promise that resolves to the user's meter data.
   * @throws NotFoundException if the meter is not found.
   */
  public async getUserMeter(ownerId: string): Promise<Meter> {
    // Fetch the meter number associated with the authenticated user
    const meterNumber = await this.meterRepo.findMeterByOwnerId(ownerId);
    if (!meterNumber) {
      throw new NotFoundException("Meter not found");
    }
    return meterNumber;
  }

  /**
   * Verifies if a given meter number exists in the database.
   *
   * @param meterNumber - The meter number to be verified.
   * @returns A promise that resolves to the verified meter data or null if not found.
   * @throws NotFoundException if the meter does not exist.
   */
  public async verifyMeter(meterNumber: string) {
    const verifyMeter = await previewMeter(meterNumber);
    if (!verifyMeter) {
      throw new NotFoundException("Meter does not exist");
    }
    if (verifyMeter.meter_number === meterNumber) {
      return verifyMeter;
    } else {
      return null;
    }
  }

  /**
   * Updates a meter by its ID.
   *
   * @param meterId - The ID of the meter to update.
   * @param updateData - The data to update the meter with.
   * @param userId - The ID of the user performing the update.
   * @returns A promise that resolves to the updated meter.
   * @throws NotFoundException if the meter is not found.
   */
  public async updateMeter(
    meterId: string,
    updateData: UpdateMeterDto,
    userId: string,
  ): Promise<Meter> {
    const meter = await this.meterRepo.findById(meterId);
    if (!meter) {
      throw new NotFoundException("Meter not found");
    }

    const updatedMeter = await this.meterRepo.updateMeterById(
      meterId,
      updateData,
    );

    // Log meter update
    await this.auditService.logAudit({
      action: "update",
      model: "meter",
      userId: userId,
      description: `Meter updated (${meter.number})`,
      propertyId: meter.propertyId || undefined,
      metadata: {
        meterNumber: meter.number,
        updates: updateData,
      },
    });

    return updatedMeter;
  }

  /**
   * Retrieves all meters with their associated houses, properties, and owners.
   *
   * @returns A promise that resolves to an array of meters with their house, property, and owner details.
   */
  public async getAllMetersWithDetails() {
    return await this.meterRepo.findAllMetersWithDetails();
  }

  /**
   * Retrieves all meters associated with a specific property.
   *
   * @param propertyId - The ID of the property to get meters for
   * @returns A promise that resolves to an array of meters with their house and owner details
   */
  public async getMetersByPropertyId(propertyId: string) {
    return await this.meterRepo.findAllMetersByPropertyId(propertyId);
  }

  /**
   * Searches for meters based on user, property, or house information.
   *
   * @param searchTerm - The search term to look for in user, property, or house data
   * @returns A promise that resolves to an array of meters matching the search criteria
   */
  public async searchMeters(searchTerm: string) {
    return await this.meterRepo.searchMeters(searchTerm);
  }
}

export { MeterService };
export default MeterService;
