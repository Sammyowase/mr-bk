import "reflect-metadata";

import NotificationRepository from "../../repository/notification.repository";
import NotificationService from "../../services/notification.service";
import { UpdateNotifyStatus } from "../../types/notification";
import { NotFoundException } from "../../utils/exceptions/customException";
import { createTestContainer } from "../utils/test-container";

describe("NotificationService", () => {
  let container: ReturnType<typeof createTestContainer>;

  afterAll(() => {
    container.clearInstances();
  });

  beforeAll(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    container = createTestContainer();
    container.register(NotificationService, NotificationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("UpdateNotification", () => {
    it("should throws NotFoundException when the notification does not exist", async () => {
      const mockNotifyRepo = {
        findNotificationById: jest.fn().mockResolvedValue(null),
        updateNotification: jest.fn(),
      } as unknown as NotificationRepository;

      container = createTestContainer((c) => {
        c.registerInstance(NotificationRepository, mockNotifyRepo);
      });

      const service = container.resolve(NotificationService);

      await expect(
        service.updateNotification("missing-id", { status: "sent" }, "user-1"),
      ).rejects.toBeInstanceOf(NotFoundException);

      expect(mockNotifyRepo.updateNotification).not.toHaveBeenCalled();
    });

    it("should updates status and readAt; does not duplicate readBy when user already present", async () => {
      const existing = {
        id: "n-1",
        readBy: ["user-1"], // already contains the user
        status: "sent",
        readAt: null,
      };

      const mockNotifyRepo = {
        findNotificationById: jest.fn().mockResolvedValue(existing),
        updateNotification: jest
          .fn()
          .mockImplementation(
            async (_id: string, data: Partial<Notification>) => ({
              ...existing,
              ...data,
            }),
          ),
      } as unknown as NotificationRepository;

      container = createTestContainer((c) => {
        c.registerInstance(NotificationRepository, mockNotifyRepo);
      });

      const service = container.resolve(NotificationService);

      const dto = {
        status: "read",
        readAt: new Date(),
      } as unknown as UpdateNotifyStatus;
      const result = await service.updateNotification(
        existing.id,
        dto,
        "user-1",
      );

      // Ensure repo was called with expected payload
      expect(mockNotifyRepo.updateNotification).toHaveBeenCalledWith(
        existing.id,
        expect.objectContaining({
          status: "read",
          readAt: dto.readAt,
          // Should remain the same array (no duplicate)
          readBy: existing.readBy,
        }),
      );

      expect(result.status).toBe("read");
      expect(result.readAt).toEqual(dto.readAt);
      expect(result.readBy).toEqual(["user-1"]);
    });

    it("should does not modify readBy when userId is undefined", async () => {
      const existing = {
        id: "n-2",
        readBy: ["user-9"],
        status: "sent",
        readAt: null,
      };

      const mockNotifyRepo = {
        findNotificationById: jest.fn().mockResolvedValue(existing),
        updateNotification: jest
          .fn()
          .mockImplementation(
            async (_id: string, data: Partial<Notification>) => ({
              ...existing,
              ...data,
            }),
          ),
      } as unknown as NotificationRepository;

      container = createTestContainer((c) => {
        c.registerInstance(NotificationRepository, mockNotifyRepo);
      });

      const service = container.resolve(NotificationService);
      const dto = { status: "read" } as unknown as UpdateNotifyStatus;
      const result = await service.updateNotification(
        existing.id,
        dto,
        undefined,
      );

      expect(mockNotifyRepo.updateNotification).toHaveBeenCalledWith(
        existing.id,
        expect.objectContaining({
          status: "read",
          readAt: undefined,
          readBy: existing.readBy,
        }),
      );

      expect(result.readBy).toEqual(["user-9"]);
    });

    it("should add userId to readBy when not present", async () => {
      const existing = {
        id: "n-3",
        readBy: ["user-2"],
        status: "sent",
        readAt: null,
      };

      const mockNotifyRepo = {
        findNotificationById: jest.fn().mockResolvedValue(existing),
        updateNotification: jest
          .fn()
          .mockResolvedValue({ ...existing, readBy: ["user-2", "user-3"] }),
      } as unknown as NotificationRepository;

      container = createTestContainer((c) => {
        c.registerInstance(NotificationRepository, mockNotifyRepo);
      });

      const service = container.resolve(NotificationService);

      const dto = {
        status: "read",
        readAt: new Date(),
      } as unknown as UpdateNotifyStatus;
      const result = await service.updateNotification(
        existing.id,
        dto,
        "user-3",
      );

      expect(result.readBy).toEqual(["user-2", "user-3"]);
    });
  });
});
