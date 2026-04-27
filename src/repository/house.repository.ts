import { House } from "../../prisma/generated/prisma";
import { Database } from "../models/database";
import { CreateHouseData, HouseResident } from "../types/house";
import { injectable } from "tsyringe";

@injectable()
class HouseRepository {
  constructor(private db: Database) {}

  public async createHouse(dto: CreateHouseData): Promise<House> {
    return await this.db.house.create({
      data: {
        ...dto,
      },
    });
  }

  public async findByNameAndPropertyId(
    name: string,
    propertyId: string,
  ): Promise<House | null> {
    return await this.db.house.findFirst({
      where: {
        name,
        propertyId,
      },
    });
  }

  public async findById(id: string): Promise<House | null> {
    return await this.db.house.findUnique({
      where: {
        id,
      },
    });
  }

  public async findAllByPropertyId(propertyId: string): Promise<House[]> {
    return await this.db.house.findMany({
      where: {
        propertyId,
      },
    });
  }

  public async getResidentsByHouseId(
    id: string,
  ): Promise<HouseResident | null> {
    return await this.db.house.findUnique({
      where: {
        id,
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
        ],
      },
      include: {
        Meter: {
          include: {
            Owner: {
              omit: {
                password: true,
              },
            },
          },
        },
      },
    });
  }

  public async updateHouse(id: string, data: Partial<House>): Promise<House> {
    return await this.db.house.update({
      where: {
        id,
      },
      data,
    });
  }
}

export default HouseRepository;
