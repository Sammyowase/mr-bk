import { House } from "../../prisma/generated/prisma";
import HouseRepository from "../repository/house.repository";
import PropertyRepository from "../repository/property.repository";
import { CreateHouseDto, HouseResident, UpdateHouseDto } from "../types/house";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "../utils/exceptions/customException";
import AuditLogService from "./audit.service";
import { injectable } from "tsyringe";

/**
 * Service class for managing house entities.
 *
 * Provides methods to create new houses and retrieve houses by property ID.
 * Handles validation to prevent duplicate house names within the same property.
 *
 * @remarks
 * This service interacts with the `Houses` model and is intended for use in backend business logic.
 */
@injectable()
class HouseService {
  constructor(
    private houseRepo: HouseRepository,
    private propertyRepo: PropertyRepository,
    private auditService: AuditLogService,
  ) {}

  /**
   * create
   * @param dto - Data Transfer Object containing house details.
   * @param propertyId - ID of the property to which the house belongs.
   * @param authorId - ID of the author creating the house.
   * @returns A promise that resolves to the created house entity.
   * @throws BadRequestException if a house with the same name already exists in the property.
   */
  public async create(
    dto: CreateHouseDto,
    propertyId: string,
    authorId: string,
  ): Promise<House> {
    const propertyExists = await this.propertyRepo.findById(propertyId);
    if (!propertyExists) {
      throw new BadRequestException(`Property does not exist`);
    }

    const houseExists = await this.houseRepo.findByNameAndPropertyId(
      dto.name,
      propertyId,
    );
    if (houseExists) {
      throw new ConflictException(
        `House with the name ${dto.name} already exists`,
      );
    }

    // Create a new house record
    const newHouse = await this.houseRepo.createHouse({
      name: dto.name,
      propertyId,
      type: dto.type,
      address: dto.address,
      authorId,
    });

    // Log House Creation
    await this.auditService.logAudit({
      action: "create",
      model: "house",
      userId: authorId,
      description: `New unit added (${newHouse.name})`,
      propertyId: propertyExists.id,
      metadata: {
        property: propertyExists.name,
      },
    });
    return newHouse;
  }

  /**
   * Retrieves all houses associated with a given property ID.
   *
   * @param propertyId - The ID of the property to fetch houses for.
   * @returns A promise that resolves to an array of house entities.
   */
  public async getHousesByPropertyId(propertyId: string): Promise<House[]> {
    const houses = await this.houseRepo.findAllByPropertyId(propertyId);
    return houses;
  }

  /**
   * Retrieves residents associated with a specific house ID.
   *
   * @param id - The ID of the house to fetch residents for.
   * @returns A promise that resolves to a HouseResident object or null if no residents are found.
   * @throws BadRequestException if the house is not found or has no residents.
   */
  public async getResidentsByHouseId(
    id: string,
  ): Promise<HouseResident | null> {
    const residents = await this.houseRepo.getResidentsByHouseId(id);
    if (!residents) {
      throw new BadRequestException(`House not found or has no resident`);
    }
    return residents;
  }

  /**
   * Updates a house by its ID.
   *
   * @param houseId - The ID of the house to update.
   * @param updateData - The data to update the house with.
   * @param userId - The ID of the user performing the update.
   * @returns A promise that resolves to the updated house.
   * @throws NotFoundException if the house is not found.
   */
  public async updateHouse(
    houseId: string,
    updateData: UpdateHouseDto,
    userId: string,
  ): Promise<House> {
    const house = await this.houseRepo.findById(houseId);
    if (!house) {
      throw new NotFoundException("House not found");
    }

    // If name is being updated, check for duplicates
    if (updateData.name) {
      const existingHouse = await this.houseRepo.findByNameAndPropertyId(
        updateData.name,
        house.propertyId,
      );
      if (existingHouse && existingHouse.id !== houseId) {
        throw new ConflictException(
          `House with the name ${updateData.name} already exists`,
        );
      }
    }

    const updatedHouse = await this.houseRepo.updateHouse(houseId, updateData);

    // Log house update
    await this.auditService.logAudit({
      action: "update",
      model: "house",
      userId: userId,
      description: `House updated (${house.name})`,
      propertyId: house.propertyId,
      metadata: {
        houseName: house.name,
        updates: updateData,
      },
    });

    return updatedHouse;
  }
}

export default HouseService;
