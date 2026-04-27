import MeterRepository from "../../repository/meter.repository";
import AuditLogService from "../../services/audit.service";
import { CreateMeterDto } from "../../types/vending";
import { logger } from "../logger/logger";
import { container } from "../../utils/handler/container";

export const addMeter = async (data: CreateMeterDto) => {
  const meterRepo = container.resolve(MeterRepository);
  const auditService = container.resolve(AuditLogService);

  try {
    const meterExist = await meterRepo.findByNumber(data.number);
    if (meterExist) {
      return "Meter already exist";
    }
    const newMeter = {
      propertyId: data.propertyId,
      houseId: data.houseId,
      ownerId: data.ownerId,
      type: data.type,
      name: data.name,
      number: data.number,
    };
    const obj = await meterRepo.createMeter(newMeter);

    // Log meter creation
    await auditService.logAudit({
      action: "create",
      model: "meter",
      userId: data.ownerId,
      description: `New meter added (${data.name})`,
      propertyId: data.propertyId,
    });

    return obj;
  } catch (error) {
    logger.error("Error adding meter:", error);
    return false;
  }
};
