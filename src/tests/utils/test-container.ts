import "reflect-metadata";
import { container, DependencyContainer } from "tsyringe";
import AuditLogService from "../../services/audit.service";
import UserRepository from "../../repository/user.repository";
import CacheService from "../../services/cache.service";
import { BaseQueueService } from "../../services/base-queue.service";

export function createTestContainer(
  overrides?: (c: DependencyContainer) => void,
): DependencyContainer {
  const testContainer = container.createChildContainer();

  // Default mocks
  const mockRedisConnection = {
    on: jest.fn(),
    quit: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };
  const mockQueue = {
    add: jest.fn(),
    getJobSchedulers: jest.fn().mockResolvedValue([]),
    removeJobScheduler: jest.fn(),
  };

  const mockBaseQueueService = {
    connection: mockRedisConnection,
    createQueue: jest.fn().mockReturnValue(mockQueue),
    createWorker: jest.fn(),
  } as unknown as BaseQueueService;

  const mockCacheService = {};

  const mockAuditService = {
    userRepo: {},
    meterRepo: {},
    propertyRepo: {},
    auditRepo: {},
    logAudit: jest.fn(),
    getAllLogs: jest.fn(),
  } as unknown as AuditLogService;

  const mockUserRepo = {};

  // Register defaults
  testContainer.registerInstance(BaseQueueService, mockBaseQueueService);
  testContainer.registerInstance(CacheService, mockCacheService);
  testContainer.registerInstance(AuditLogService, mockAuditService);
  testContainer.registerInstance(UserRepository, mockUserRepo);
  //   testContainer.registerSingleton(QueueService);
  testContainer.register("RedisConnection", { useValue: mockRedisConnection });

  // --- Allow per-test overrides ---
  if (overrides) {
    overrides(testContainer);
  }

  return testContainer;
}
