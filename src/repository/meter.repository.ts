import { House, Meter, Property, User } from "../../prisma/generated/prisma";
import { Database } from "../models/database";
import { CreateMeterDto } from "../types/vending";
import { injectable } from "tsyringe";

/**
 * Repository class for handling database operations related to meters.
 *
 * @remarks
 * This class provides methods to create, find, update, and retrieve meters
 * from the database using various criteria such as owner ID, house ID,
 * meter number, and property ID.
 */
@injectable()
class MeterRepository {
  constructor(private db: Database) {}

  public async createMeter(dto: CreateMeterDto): Promise<Meter> {
    return await this.db.meter.create({
      data: {
        ...dto,
      },
    });
  }

  public async findMeterByOwnerId(ownerId: string): Promise<Meter | null> {
    return await this.db.meter.findFirst({
      where: {
        ownerId,
      },
    });
  }

  public async findMeterByHouseId(houseId: string): Promise<Meter | null> {
    return await this.db.meter.findFirst({
      where: {
        houseId,
      },
    });
  }

  public async findByNumber(meterNumber: string): Promise<Meter | null> {
    return await this.db.meter.findFirst({
      where: {
        number: meterNumber,
      },
    });
  }

  public async updateMeterByNumber(
    meterNumber: string,
    data: Partial<Meter>,
  ): Promise<Meter> {
    return await this.db.meter.update({
      where: {
        number: meterNumber,
      },
      data,
    });
  }

  public async findById(id: string): Promise<Meter | null> {
    return await this.db.meter.findUnique({
      where: {
        id,
      },
    });
  }

  public async updateMeterById(
    id: string,
    data: Partial<Meter>,
  ): Promise<Meter> {
    return await this.db.meter.update({
      where: {
        id,
      },
      data,
    });
  }

  /**
   * Retrieves all meters associated with a specific property.
   *
   * @param propertyId - The ID of the property to get meters for
   * @returns A promise that resolves to an array of meters with their house and owner details
   * The owner's password is excluded from the returned data for security reasons.
   */
  public async findAllMetersByPropertyId(propertyId: string): Promise<
    (Meter & {
      House: House | null;
      Owner: Omit<User, "password"> | null;
    })[]
  > {
    return await this.db.meter.findMany({
      where: {
        propertyId,
      },
      include: {
        House: {
          where: {
            propertyId,
          },
        },
        Owner: {
          omit: {
            password: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });
  }

  public async findAllMeters(): Promise<Meter[]> {
    return await this.db.meter.findMany({
      orderBy: {
        number: "asc",
      },
    });
  }

  /**
   * Searches for meters based on user, property, or house information.
   *
   * @param searchTerm - The search term to look for in user, property, or house data
   * @returns A promise that resolves to an array of meters matching the search criteria
   */
  public async searchMeters(searchTerm: string): Promise<
    (Meter & {
      House: House | null;
      Property: Property | null;
      Owner: Omit<User, "password"> | null;
    })[]
  > {
    const searchString = searchTerm.trim();

    const meters = await this.db.meter.findMany({
      where: {
        OR: [
          // Search in meter fields
          { number: { contains: searchString, mode: "insensitive" } },
          { name: { contains: searchString, mode: "insensitive" } },

          // Search in related house fields
          {
            House: {
              OR: [
                { name: { contains: searchString, mode: "insensitive" } },
                { address: { contains: searchString, mode: "insensitive" } },
              ],
            },
          },

          // Search in related property fields
          {
            Property: {
              OR: [
                { name: { contains: searchString, mode: "insensitive" } },
                { address: { contains: searchString, mode: "insensitive" } },
                { city: { contains: searchString, mode: "insensitive" } },
                { state: { contains: searchString, mode: "insensitive" } },
                { country: { contains: searchString, mode: "insensitive" } },
              ],
            },
          },

          // Search in related owner fields
          {
            Owner: {
              OR: [
                { firstName: { contains: searchString, mode: "insensitive" } },
                { lastName: { contains: searchString, mode: "insensitive" } },
                { userName: { contains: searchString, mode: "insensitive" } },
                { email: { contains: searchString, mode: "insensitive" } },
                { phone: { contains: searchString, mode: "insensitive" } },
              ],
            },
          },
        ],
      },
      include: {
        House: true,
        Property: true,
        Owner: {
          omit: {
            password: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return meters;
  }

  public async findAllMetersWithDetails(): Promise<
    (Meter & {
      House: House | null;
      Property: Property | null;
      Owner: Omit<User, "password"> | null;
    })[]
  > {
    return await this.db.meter.findMany({
      include: {
        House: true,
        Property: true,
        Owner: {
          omit: {
            password: true,
          },
        },
      },
      orderBy: {
        number: "asc",
      },
    });
  }
}

export default MeterRepository;
