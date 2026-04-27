import { Property } from "../../prisma/generated/prisma";
import { Database } from "../models/database";
import {
  CreatePropertyDto,
  Properties,
  PropertyFilter,
  PropertyResident,
  PropertyResidentExport,
  PropertyResidentId,
  PropertySortByOptions,
  ResidentFilter,
  ResidentSortByOptions,
  ResidentWhere,
} from "../types/property";
import { injectable } from "tsyringe";

@injectable()
class PropertyRepository {
  constructor(private db: Database) {}

  public async createProperty(
    dto: CreatePropertyDto,
    authorId: string,
  ): Promise<Property> {
    return await this.db.property.create({
      data: {
        ...dto,
        authorId,
      },
    });
  }
  public async updatePropertyById(
    id: string,
    data: Partial<CreatePropertyDto>,
  ): Promise<Property> {
    return await this.db.property.update({
      where: {
        id,
      },
      data,
    });
  }

  public async deleteProperty(id: string): Promise<Property> {
    return await this.db.property.delete({
      where: {
        id,
      },
    });
  }

  public async findAllProperties(): Promise<Property[]> {
    return await this.db.property.findMany({
      orderBy: {
        name: "asc",
      },
    });
  }

  public async findById(id: string): Promise<Property | null> {
    return await this.db.property.findUnique({
      where: {
        id,
      },
    });
  }

  public async findPropertyByNameAuthorIdAndAddress(
    name: string,
    authorId: string,
    address: string,
  ): Promise<Property | null> {
    return await this.db.property.findFirst({
      where: {
        name,
        authorId,
        address,
      },
    });
  }

  public async findPropertyManagerByPropertyId(
    propertyId: string,
    managerId: string,
  ): Promise<Property | null> {
    return await this.db.property.findFirst({
      where: {
        id: propertyId,
        managerId,
      },
    });
  }

  public async addPropertyManager(
    propertyId: string,
    managerId: string,
  ): Promise<Property> {
    return await this.db.property.update({
      where: {
        id: propertyId,
      },
      data: {
        managerId,
      },
    });
  }

  private propertyOverviewInclude = {
    _count: {
      select: {
        Houses: true,
        Meters: true,
      },
    },
  };

  public async findPropertyByManagerId(
    managerId: string,
  ): Promise<Property | null> {
    return await this.db.property.findFirst({
      where: {
        managerId,
      },
    });
  }

  public async findPropertyBySecurityId(
    securityId: string,
  ): Promise<Property | null> {
    return await this.db.property.findFirst({
      where: {
        SecurityAssignments: {
          some: {
            userId: securityId,
          },
        },
      },
    });
  }

  public async getPropertyOverview(
    propertyId: string,
  ): Promise<
    (Property & { _count: { Houses: number; Meters: number } }) | null
  > {
    return await this.db.property.findUnique({
      where: { id: propertyId },
      include: this.propertyOverviewInclude,
    });
  }

  public async getPropertyOverviewByManagerId(
    managerId: string,
  ): Promise<
    (Property & { _count: { Houses: number; Meters: number } }) | null
  > {
    return await this.db.property.findFirst({
      where: { managerId },
      include: this.propertyOverviewInclude,
    });
  }
  public async getPropertyOverviewBySecurityId(
    securityId: string,
  ): Promise<
    (Property & { _count: { Houses: number; Meters: number } }) | null
  > {
    return await this.db.property.findFirst({
      where: {
        SecurityAssignments: {
          some: {
            userId: securityId,
          },
        },
      },
      include: this.propertyOverviewInclude,
    });
  }

  public async getPropertyResidents(
    filter: ResidentFilter | ResidentWhere,
    page: number,
    size: number,
    orderBy: ResidentSortByOptions,
  ): Promise<PropertyResident> {
    // Find all houses in the property with their meters and owners
    const houses = await this.db.house.findMany({
      take: size,
      skip: (page - 1) * size,
      orderBy,
      where: filter,
      select: {
        // Select the house id, name, and address
        id: true,
        name: true,
        address: true,
        Meter: {
          select: {
            // Select the meter id, name, and number
            id: true,
            name: true,
            number: true,
            Owner: {
              // Omit the role, password, and updatedAt fields from the Owner
              omit: {
                role: true,
                password: true,
                updatedAt: true,
              },
            },
          },
        },
      },
    });

    // Count the total number of houses with meters and owners
    const total = await this.db.house.count({
      where: filter,
    });

    return {
      houses,
      total,
    };
  }

  public async getPropertyResidentsIds(
    propertyId: string,
  ): Promise<PropertyResidentId[]> {
    return await this.db.house.findMany({
      where: {
        propertyId,
        AND: [
          {
            Meter: {
              isNot: null,
            },
          },
          {
            Meter: {
              Owner: {
                isNot: null,
              },
            },
          },
          {
            Meter: {
              Owner: {
                deletedAt: null,
              },
            },
          },
        ],
      },
      select: {
        Meter: {
          select: {
            ownerId: true,
          },
        },
      },
    });
  }

  public async getPropertyResidentsExport(
    filter: ResidentFilter | ResidentWhere,
  ): Promise<PropertyResidentExport[]> {
    // Find all houses in the property with their meters and owners
    return await this.db.house.findMany({
      where: filter,
      select: {
        name: true,
        address: true,
        Meter: {
          select: {
            name: true,
            number: true,
            Owner: {
              // Omit the role, password, and updatedAt fields from the Owner
              omit: {
                role: true,
                password: true,
                updatedAt: true,
              },
            },
          },
        },
      },
    });
  }

  public async getAllPropertiesCount(): Promise<number> {
    return await this.db.property.count();
  }

  public async getNewPropertiesCount(): Promise<number> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    return await this.db.property.count({
      where: {
        createdAt: {
          gte: startOfMonth,
        },
      },
    });
  }

  public async getNewWeekPropertiesCount(startOfWeek: Date): Promise<number> {
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);
    endOfWeek.setHours(0, 0, 0, 0);

    return await this.db.property.count({
      where: {
        AND: [
          {
            createdAt: {
              gte: startOfWeek,
            },
          },
          {
            createdAt: {
              lte: endOfWeek,
            },
          },
        ],
      },
    });
  }

  public async getAllPropertiesWithManagerCount(): Promise<number> {
    return await this.db.property.count({
      where: {
        managerId: {
          not: null,
        },
      },
    });
  }

  public async getAllPropertiesWithoutManagerCount(): Promise<number> {
    return await this.db.property.count({
      where: {
        managerId: null,
      },
    });
  }

  public async getAllPropertiesPaginated(
    filter: PropertyFilter | object,
    page: number,
    size: number,
    orderBy: PropertySortByOptions,
  ): Promise<Properties> {
    // Find all properties with the manager
    const properties = await this.db.property.findMany({
      take: size,
      skip: (page - 1) * size,
      orderBy,
      where: filter,
      include: {
        Manager: {
          omit: {
            password: true,
          },
        },
      },
    });

    // Count the total number of houses with meters and owners
    const total = await this.db.property.count({
      where: filter,
    });

    return {
      properties,
      total,
    };
  }
}

export default PropertyRepository;
