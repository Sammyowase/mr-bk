import { Otp } from "../../prisma/generated/prisma";
import { Database } from "../models/database";
import { CreateOtpDto } from "../types/auth";
import { VerifyEmailDto } from "../types/user";
import { injectable } from "tsyringe";

@injectable()
class OtpRepository {
  constructor(private db: Database) {}

  public async createOtp(dto: CreateOtpDto): Promise<CreateOtpDto> {
    return await this.db.otp.create({
      data: {
        ...dto,
      },
    });
  }

  public async findByOtpOrEmail(dto: VerifyEmailDto): Promise<Otp | null> {
    return await this.db.otp.findFirst({
      where: {
        ...dto,
      },
    });
  }

  public async deleteOtp(id: string): Promise<void> {
    await this.db.otp.delete({
      where: {
        id,
      },
    });
  }
}

export default OtpRepository;
