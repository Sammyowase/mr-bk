import { User, Role } from "../../prisma/generated/prisma";
import { Database } from "../models/database";
import {
  CreateUserDto,
  RegisterResponse,
  UserFilter,
  Users,
  UserSortByOptions,
} from "../types/user";
import { injectable } from "tsyringe";

@injectable()
class UserRepository {
  constructor(private db: Database) {}

  public async createUser(dto: CreateUserDto): Promise<RegisterResponse> {
    return await this.db.user.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        userName: dto.userName,
        password: dto.password,
        email: dto.email,
        phone: dto.phone,
        role: dto.role,
      },
      omit: {
        password: true,
      },
    });
  }

  public async updateUserByEmail(
    email: string,
    data: Partial<User>,
  ): Promise<User> {
    return await this.db.user.update({
      where: {
        email,
      },
      data,
    });
  }

  public async updateUserRole(
    userId: string,
    role: Role,
  ): Promise<Omit<User, "password">> {
    return await this.db.user.update({
      where: {
        id: userId,
      },
      data: {
        role,
      },
      omit: {
        password: true,
      },
    });
  }

  public async findById(id: string): Promise<Omit<User, "password"> | null> {
    return await this.db.user.findUnique({
      where: {
        id,
      },
      omit: {
        password: true,
      },
    });
  }

  public async findByEmail(email: string): Promise<User | null> {
    return await this.db.user.findUnique({
      where: {
        email,
      },
    });
  }

  public async findByEmailOrUserNameOrPhone(
    email?: string,
    userName?: string,
    phone?: string,
  ): Promise<User | null> {
    return await this.db.user.findFirst({
      where: {
        OR: [{ email }, { userName }, { phone }],
      },
    });
  }

  public async getAllUsersCount(): Promise<number> {
    return await this.db.user.count({
      where: {
        AND: [
          {
            role: {
              notIn: ["admin", "super_admin"],
            },
          },
          {
            deletedAt: null,
          },
        ],
      },
    });
  }

  public async getNewMonthUsersCount(): Promise<number> {
    const now = new Date();
    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
      0,
      0,
      0,
    );

    return await this.db.user.count({
      where: {
        createdAt: {
          gte: startOfMonth,
        },
        role: {
          notIn: ["admin", "super_admin"],
        },
      },
    });
  }

  public async getNewWeekUsersCount(startOfWeek: Date): Promise<number> {
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);
    endOfWeek.setHours(0, 0, 0, 0);

    return await this.db.user.count({
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
        role: {
          notIn: ["admin", "super_admin"],
        },
      },
    });
  }

  public async getAllUsers(): Promise<User[]> {
    return await this.db.user.findMany({
      where: {
        AND: [
          {
            role: {
              in: ["user", "manager"],
            },
          },
          {
            deletedAt: null,
          },
        ],
      },
    });
  }

  public async getAllUsersPaginated(
    filter: UserFilter | undefined,
    page: number,
    size: number,
    orderBy: UserSortByOptions,
  ): Promise<Users> {
    // Find all users
    const users = await this.db.user.findMany({
      take: size,
      skip: (page - 1) * size,
      orderBy,
      where: { ...filter, deletedAt: null },
      omit: {
        password: true,
      },
    });

    // Count the total number of users
    const total = await this.db.user.count({
      where: filter,
    });

    return {
      users,
      total,
    };
  }

  public async deleteUser(id: string): Promise<Omit<User, "password">> {
    return await this.db.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
      omit: {
        password: true,
      },
    });
  }

  public async restoreUser(id: string): Promise<Omit<User, "password">> {
    return await this.db.user.update({
      where: {
        id,
      },
      data: {
        deletedAt: null,
      },
      omit: {
        password: true,
      },
    });
  }
}

export default UserRepository;
