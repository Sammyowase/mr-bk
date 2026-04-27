import {
  AddPropertyManagerDto,
  CreatePropertyDto,
  PropertiesWithMetadata,
  PropertyOverview,
  PropertyResidentExport,
  PropertyResidentHouse,
} from "../types/property";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "../utils/exceptions/customException";
import PropertyRepository from "../repository/property.repository";
import { NotificationType, Property } from "../../prisma/generated/prisma";
import UserRepository from "../repository/user.repository";
import MeterRepository from "../repository/meter.repository";
import HouseRepository from "../repository/house.repository";
import { allowedHouseSortBy } from "../utils/constants/house";
import { MetadataType } from "../utils/http/paginatedResponse";
import {
  allowedPropertySortBy,
  propertyFilter,
  propertySortBy,
  residentExportCol,
  residentFilter,
  residentSortBy,
  residentWhere,
} from "../utils/constants/property";
import { SortOrder } from "../types/misc";
import AuditLogService from "./audit.service";
import { Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import SpreadSheet from "./spreadsheet.service";
import { exportExcel } from "../utils/helper/exportExcel";
import { CreateNotifyDto } from "../types/notification";
import { injectable } from "tsyringe";
import NotificationService from "./notification.service";

/**
 * Service class for managing property entities.
 *
 * Provides methods to perform CRUD operations on properties,
 * including retrieving all properties, creating a new property,
 * updating an existing property, and deleting a property.
 *
 * Methods:
 * - getAllProperties: Retrieves all property records.
 * - createProperty: Creates a new property after checking for duplicates.
 * - updateProperty: Updates an existing property by its ID.
 * - deleteProperty: Deletes a property by its ID.
 * - addPropertyManager: Assigns a property manager to a property.
 * - getPropertyOverview: Retrieves the overview of a property, including total units and users.
 *
 * Throws:
 * - ConflictException: When attempting to create a duplicate property or delete a non-existent property.
 * - NotFoundException: When attempting to update a non-existent property.
 */
@injectable()
class PropertyService {
  constructor(
    private auditService: AuditLogService,
    private notificationService: NotificationService,
    private propertyRepo: PropertyRepository,
    private userRepo: UserRepository,
    private houseRepo: HouseRepository,
    private meterRepo: MeterRepository,
  ) {}

  /**
   * Retrieves all properties, either as a full list or paginated with sorting and search options.
   *
   * @param paginated - If truthy, returns paginated results; otherwise, returns all properties.
   * @param page - The page number for pagination (defaults to 1 if not provided or invalid).
   * @param size - The number of items per page for pagination (defaults to 10 if not provided or invalid).
   * @param sortBy - The field to sort the results by (defaults to "name" if not provided).
   * @param order - The sort order, either "asc" for ascending or "desc" for descending (defaults to descending).
   * @param search - A search string to filter properties.
   * @returns A promise that resolves to either an array of all properties or an object containing paginated data and metadata.
   * @throws {BadRequestException} If the provided sort field is not allowed.
   */
  public async getAllProperties(
    paginated: string | undefined,
    page: string,
    size: string,
    sortBy: string,
    order: string,
    search: string,
  ): Promise<PropertiesWithMetadata | Property[]> {
    if (!paginated) {
      return this.propertyRepo.findAllProperties();
    }

    const pageNumber = parseInt(page) || 1;
    const pageSize = parseInt(size) || 10;
    const sortByField = sortBy || "name";
    const sortOrder = order === "desc" ? SortOrder.DESC : SortOrder.ASC;

    const filter = search ? propertyFilter(search) : {};

    if (!allowedPropertySortBy.includes(sortByField)) {
      throw new BadRequestException("Invalid sort field");
    }

    const result = await this.propertyRepo.getAllPropertiesPaginated(
      filter,
      pageNumber,
      pageSize,
      propertySortBy(sortByField, sortOrder),
    );

    return {
      data: result.properties,
      metadata: {
        total: result.total,
        page: pageNumber,
        size: pageSize,
      },
    };
  }

  /**
   * Creates a new property record in the database.
   *
   * @param {CreatePropertyDto} dto - The data transfer object containing property details.
   * @param {string} userId - The ID of the user creating the property.
   * @returns {Promise<Properties>} - A promise that resolves to the created property record.
   * @throws {ConflictException} - If a property with the same name and address already exists for the user.
   */
  public async createProperty(
    req: JwtPayload,
    dto: CreatePropertyDto,
    userId: string,
  ): Promise<Property> {
    const propertyExist =
      await this.propertyRepo.findPropertyByNameAuthorIdAndAddress(
        dto.name,
        userId,
        dto.address,
      );

    if (propertyExist) {
      throw new ConflictException("Property already exists");
    }

    const property = await this.propertyRepo.createProperty(dto, userId);

    if (req.user) {
      // Log create property
      await this.auditService.logAudit({
        action: "create",
        model: "property",
        userId,
        propertyId: property.id,
        description: `New property added (${property.name})`,
      });
    }

    return property;
  }

  /**
   * Updates an existing property record in the database.
   *
   * @param {Partial<CreatePropertyDto>} dto - The data transfer object containing updated property details.
   * @param {string} id - The ID of the property to update.
   * @returns {Promise<Properties>} - A promise that resolves to the updated property record.
   * @throws {NotFoundException} - If the property with the specified ID does not exist.
   */
  public async updateProperty(
    req: Request,
    dto: Partial<CreatePropertyDto>,
    id: string,
  ): Promise<Property> {
    const property = await this.propertyRepo.findById(id);

    if (!property) {
      throw new NotFoundException("Property not found");
    }

    if (dto.minVend || dto.maxVend) {
      this._validateMinMaxVend(property, dto.minVend, dto.maxVend);
    }

    const updatedProperty = await this.propertyRepo.updatePropertyById(id, dto);

    if (req.user) {
      // Log update property
      await this.auditService.logAudit({
        action: "update",
        model: "property",
        userId: req.user.id,
        propertyId: updatedProperty.id,
        description: `${property.name} updated`,
        metadata: {
          ...dto,
        },
      });
    }

    // Notify residents
    this.notifyOfPropertyUpdate(dto, updatedProperty);

    return updatedProperty;
  }

  /**
   * Deletes a property record from the database.
   *
   * @param {string} id - The ID of the property to delete.
   * @throws {ConflictException} - If the property with the specified ID does not exist.
   */
  public async deleteProperty(req: Request, id: string) {
    const property = await this.propertyRepo.findById(id);

    if (!property) {
      throw new ConflictException("Property not found");
    }

    await this.propertyRepo.deleteProperty(id);

    if (req.user) {
      // Log delete property
      await this.auditService.logAudit({
        action: "delete",
        model: "property",
        userId: req.user.id,
        description: `${property.name} deleted`,
      });
    }

    return;
  }

  /**
   * Adds a property manager to a property.
   *
   * @param {AddPropertyManagerDto} dto - The data transfer object containing the manager's email and property ID.
   * @returns {Promise<Property>} - A promise that resolves to the updated property record.
   * @throws {NotFoundException} - If the manager or property does not exist, or if the manager is already assigned to the property.
   */
  public async addPropertyManager(
    dto: AddPropertyManagerDto,
  ): Promise<Property> {
    // Check if the manager exist
    const manager = await this.userRepo.findByEmail(dto.email);
    if (!manager) {
      throw new NotFoundException("Manager not found");
    }
    // Check if the user is a manager
    if (manager.role !== "manager") {
      throw new NotFoundException("This user is not a manager");
    }

    // Check if the property exist
    const property = await this.propertyRepo.findById(dto.propertyId);
    if (!property) {
      throw new NotFoundException("Facility not found");
    }
    // Check if a property manager already exist
    if (property.managerId && property.managerId !== manager.id) {
      throw new ConflictException(
        "Facility manager already exist for this property",
      );
    }

    const result = await this.propertyRepo.addPropertyManager(
      dto.propertyId,
      manager.id,
    );

    // Log property manager addition
    await this.auditService.logAudit({
      action: "update",
      model: "property",
      userId: manager.id,
      propertyId: dto.propertyId,
      description: `Manager (${manager.email}) added to ${property.name}`,
    });

    return result;
  }

  /**
   * Retrieves the overview of a property, including total units and users.
   *
   * @param {string} propertyId - The ID of the property to retrieve the overview for.
   * @returns {Promise<PropertyOverview>} - A promise that resolves to an object containing property info, total units, and total users.
   * @throws {NotFoundException} - If the property with the specified ID does not exist.
   */
  public async getPropertyOverview(
    propertyId: string,
  ): Promise<PropertyOverview> {
    const property = await this.propertyRepo.findById(propertyId);
    if (!property) {
      throw new NotFoundException("Property not found");
    }

    const metrics = await this.getMetrics(property.id);
    return {
      ...property,
      ...metrics,
    };
  }

  /**
   * Retrieves the property overview by manager ID.
   *
   * @param {string} managerId - The ID of the manager to retrieve the property overview for.
   * @returns {Promise<PropertyOverview>} - A promise that resolves to the property overview.
   * @throws {BadRequestException} - If the property overview cannot be retrieved.
   */
  public async getPropertyOverviewByManagerId(
    managerId: string,
  ): Promise<PropertyOverview> {
    const property = await this.propertyRepo.findPropertyByManagerId(managerId);
    if (!property) {
      throw new BadRequestException("Cannot get property overview");
    }

    const metrics = await this.getMetrics(property.id);
    return {
      ...property,
      ...metrics,
    };
  }

  /**
   * Retrieves the property overview by manager ID.
   *
   * @param {string} securityId - The ID of the manager to retrieve the property overview for.
   * @returns {Promise<PropertyOverview>} - A promise that resolves to the property overview.
   * @throws {BadRequestException} - If the property overview cannot be retrieved.
   */
  public async getPropertyOverviewBySecurityId(
    securityId: string,
  ): Promise<PropertyOverview> {
    const property =
      await this.propertyRepo.findPropertyBySecurityId(securityId);
    if (!property) {
      throw new BadRequestException("Cannot get property overview");
    }

    const metrics = await this.getMetrics(property.id);
    return {
      ...property,
      ...metrics,
    };
  }

  /**
   * Retrieves metrics for a property, including total units, total meters, and total active users.
   *
   * @param {string} propertyId - The ID of the property to retrieve metrics for.
   * @returns {Promise<object>} - A promise that resolves to an object containing the metrics.
   */
  public async getMetrics(propertyId: string) {
    const houses = await this.houseRepo.findAllByPropertyId(propertyId);
    const meters = await this.meterRepo.findAllMetersByPropertyId(propertyId);
    // Filter out meters with null House
    const activeMeters = meters.filter((meter) => meter.House !== null).length;
    // Filter out meters with null Owner
    const activeUsers = meters.filter((meter) => meter.Owner !== null).length;

    return {
      totalUnits: houses.length,
      totalMeters: meters.length,
      totalOccupiedUnits: activeMeters,
      totalActiveMeters: activeMeters,
      totalActiveUsers: activeUsers,
    };
  }

  /**
   * Retrieves residents of a property with pagination, sorting, and search options.
   *
   * @param {Response} res - The HTTP response object
   * @param {string} propertyId - The ID of the property to retrieve residents for.
   * @param {string} page - The page number for pagination.
   * @param {string} size - The number of items per page.
   * @param {string} sortBy - The field to sort by.
   * @param {string} order - The sort order (asc or desc).
   * @param {string} search - The search query for filtering residents.
   * @param {string} download - The download option for export
   * @returns {Promise<{ data: PropertyResidentHouse[]; metadata: MetadataType }>} - A promise that resolves to an object containing the residents and metadata.
   * @throws {NotFoundException} - If the property is not found.
   * @throws {BadRequestException} - If the sort field or pagination parameters are invalid.
   */
  public async getPropertyResidents(
    res: Response,
    propertyId: string,
    page: string,
    size: string,
    sortBy: string,
    order: string,
    search: string,
    download: string,
  ): Promise<{ data: PropertyResidentHouse[]; metadata: MetadataType } | void> {
    const property = await this.propertyRepo.findById(propertyId);
    if (!property) {
      throw new NotFoundException("Property not found");
    }

    const pageNumber = parseInt(page) || 1;
    const pageSize = parseInt(size) || 10;
    const sortByField = sortBy || "createdAt";
    const sortOrder = order === "desc" ? SortOrder.DESC : SortOrder.ASC;

    const filter = search
      ? residentFilter(search, propertyId)
      : residentWhere(propertyId);

    if (!allowedHouseSortBy.includes(sortByField)) {
      throw new BadRequestException("Invalid sort field");
    }

    // If Download specified
    if (download) {
      const sheetname = `${property.name} Residents`;
      const filename = `residents`;

      const sp = new SpreadSheet(`${sheetname} Lists`);

      // Retrieve the data
      const units = await this.propertyRepo.getPropertyResidentsExport(filter);

      if (units.length) {
        // Prepare the data
        const data = units.map((unit: PropertyResidentExport) => {
          return {
            firstname: unit.Meter?.Owner?.firstName,
            lastname: unit.Meter?.Owner?.lastName,
            unit: unit.name,
            email: unit.Meter?.Owner?.email,
            phone: unit.Meter?.Owner?.phone,
            meter: unit.Meter?.number,
            joined:
              unit.Meter?.Owner?.createdAt &&
              new Date(unit.Meter?.Owner?.createdAt).toLocaleString(),
          };
        });

        // Write to a file
        const filePath = await sp.writeExcel(
          filename,
          sheetname,
          residentExportCol,
          data,
        );

        // Export the file
        return exportExcel(res, filename, filePath);
      }
    }

    const residents = await this.propertyRepo.getPropertyResidents(
      filter,
      pageNumber,
      pageSize,
      residentSortBy(sortByField, sortOrder),
    );

    return {
      data: residents.houses,
      metadata: {
        total: residents.total,
        page: pageNumber,
        size: pageSize,
      },
    };
  }

  /**
   * Validates the minimum and maximum vending amounts for a property.
   *
   * @param {Property} property - The property object to validate.
   * @param {number} [minVend] - The minimum vending amount.
   * @param {number} [maxVend] - The maximum vending amount.
   * @throws {BadRequestException} - If the validation fails.
   */
  public _validateMinMaxVend(
    property: Property,
    minVend?: number,
    maxVend?: number,
  ): void {
    // Validate that minimum vending amount is not greater than maximum vending amount
    if (property.minVend && maxVend && property.minVend > maxVend) {
      throw new BadRequestException(
        "Maximum vending amount cannot be less than minimum vending amount",
      );
    }

    // Validate that maximum vending amount is not less than minimum vending amount
    if (property.maxVend && minVend && property.maxVend < minVend) {
      throw new BadRequestException(
        "Minimum vending amount cannot be greater than maximum vending amount",
      );
    }

    // Validate that minimum vending amount is not greater than maximum vending amount
    if (minVend && maxVend && minVend > maxVend) {
      throw new BadRequestException(
        "Minimum vending amount cannot be greater than maximum vending amount",
      );
    }
  }

  /**
   * Toggles the vending suspension status for a property.
   *
   * @param {Request} req - The HTTP request object.
   * @param {string} propertyId - The ID of the property to toggle vending suspension for.
   * @param {boolean} isVendingSuspended - Whether to suspend vending (true) or allow it (false).
   * @returns {Promise<Property>} - A promise that resolves to the updated property.
   * @throws {NotFoundException} - If the property with the specified ID does not exist.
   */
  public async toggleVendingSuspension(
    req: Request,
    propertyId: string,
    isVendingSuspended: boolean,
  ): Promise<Property> {
    const property = await this.propertyRepo.findById(propertyId);

    if (!property) {
      throw new NotFoundException("Property not found");
    }

    const updatedProperty = await this.propertyRepo.updatePropertyById(
      propertyId,
      {
        isVendingSuspended,
      },
    );

    if (req.user) {
      // Log the vending suspension toggle
      await this.auditService.logAudit({
        action: "update",
        model: "property",
        userId: req.user.id,
        propertyId: updatedProperty.id,
        description: isVendingSuspended
          ? `Vending suspended for ${property.name}`
          : `Vending resumed for ${property.name}`,
        metadata: {
          isVendingSuspended,
        },
      });
    }

    // Notify residents of the change
    await this.notifyOfPropertyUpdate({ isVendingSuspended }, updatedProperty);

    return updatedProperty;
  }

  public async notifyOfPropertyUpdate(
    updateDto: Partial<CreatePropertyDto>,
    updatedProperty: Property,
  ) {
    const residents = await this.propertyRepo.getPropertyResidentsIds(
      updatedProperty.id,
    );

    let msg;
    // Announce if min or max vending amount changes
    if (updateDto.maxVend && updateDto.minVend) {
      msg = `Your vending limit has been updated, you can now vend above #${updatedProperty.minVend} and up to #${updatedProperty.maxVend}`;
    } else if (updateDto.maxVend) {
      msg = `Your vending limit has been updated, maximum vending amount is now #${updateDto.maxVend}`;
    } else if (updateDto.minVend) {
      msg = `Your vending limit has been updated, minimum vending amount is now #${updateDto.minVend}`;
    }

    // Announce if tarrif changes
    if (updateDto.tarrif) {
      msg = `Electricity unit price has been updated to  #${updateDto.tarrif}/kWh`;
    }

    // Announce if vending suspension status changes
    if (updateDto.isVendingSuspended !== undefined) {
      msg = updateDto.isVendingSuspended
        ? `Vending has been temporarily suspended for ${updatedProperty.name}. Please contact your estate manager for more information.`
        : `Vending has been resumed for ${updatedProperty.name}. You can now purchase electricity tokens.`;
    }

    // Ignore if no message
    if (msg) {
      // Send notification to the user
      const notifyInfo: CreateNotifyDto = {
        title: "Price Update",
        message: msg,
        recipientIds: residents
          .map((r) => r.Meter?.ownerId)
          .filter((id): id is string => typeof id === "string"),
        status: "pending",
        type: [NotificationType.inapp],
        data: {
          channel: updatedProperty.id,
        },
      };

      await this.notificationService.notify(notifyInfo);
    }
  }
}

export default PropertyService;
