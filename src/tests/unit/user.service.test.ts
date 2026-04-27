import "reflect-metadata";
import { createTestContainer } from "../utils/test-container";
import UserService from "../../services/user.service";
import UserRepository from "../../repository/user.repository";
import { Request } from "express";
import { hashPassword, verifyPassword } from "../../utils/service/password";
import {
  BadRequestException,
  NotFoundException,
} from "../../utils/exceptions/customException";
import MeterRepository from "../../repository/meter.repository";
import { previewMeter } from "../../utils/service/meterServices/previewMeter";
import { addMeter } from "../../utils/service/addMeter";
import { generateRefreshToken, generateToken } from "../../utils/service/token";
import { UserPermissionRepository } from "../../repository/userpermission.repository";
import OtpRepository from "../../repository/otp.repository";
import { generateOtp } from "../../utils/service/otp";
import NotificationService from "../../services/notification.service";
import PropertyRepository from "../../repository/property.repository";
import { Property } from "../../../prisma/generated/prisma";
import { CompleteRegDto } from "../../types/auth";
import SecurityAssignmentRepository from "../../repository/security.repository";
import CacheService from "../../services/cache.service";

// Mock dependencies
jest.mock("../../utils/service/password", () => ({
  hashPassword: jest.fn(),
  verifyPassword: jest.fn(),
}));
jest.mock("../../utils/service/meterServices/previewMeter", () => ({
  previewMeter: jest.fn(),
}));
jest.mock("../../utils/service/addMeter", () => ({
  addMeter: jest.fn(),
}));
jest.mock("../../utils/service/token", () => ({
  generateToken: jest.fn(),
  generateRefreshToken: jest.fn(),
}));
jest.mock("../../utils/service/otp", () => ({
  generateOtp: jest.fn(),
}));

describe("UserService", () => {
  let container: ReturnType<typeof createTestContainer>;

  beforeEach(async () => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    container.clearInstances();
  });

  describe("login", () => {
    it("should log in a user with valid credentials", async () => {
      // Mock dependencies
      const mockUser = {
        id: 1,
        password: "hashedPassword",
        role: "user",
        firstName: "John",
        lastName: "Doe",
        userName: "johndoe",
        email: "john@example.com",
        phone: "1234567890",
      };
      const mockToken = "mockToken";
      const mockRefreshToken = "mockRefreshToken";

      const mockUserRepo = {
        findByEmailOrUserNameOrPhone: jest.fn().mockResolvedValue(mockUser),
      } as unknown as UserRepository;

      const mockUserRestrictionRepo = {
        findByTypeAndUserId: jest.fn().mockResolvedValue(null),
      } as unknown as UserPermissionRepository;

      const mockReq = {
        user: { id: "admin" },
        headers: { "user-agent": "" },
      } as unknown as Request;

      // Create container with mocked dependencies
      container = createTestContainer((c) => {
        c.registerInstance(UserRepository, mockUserRepo);
        c.registerInstance(UserPermissionRepository, mockUserRestrictionRepo);
      });

      const service = container.resolve(UserService);

      // Mock implementations
      (verifyPassword as jest.Mock).mockResolvedValue(true);
      (generateToken as jest.Mock).mockReturnValue(mockToken);
      (generateRefreshToken as jest.Mock).mockReturnValue(mockRefreshToken);

      const result = await service.login(mockReq, {
        identifier: "john@example.com",
        password: "password123",
      });

      expect(result).toEqual({
        user: {
          id: mockUser.id,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
          userName: mockUser.userName,
          email: mockUser.email,
          phone: mockUser.phone,
          role: mockUser.role,
        },
        token: mockToken,
        refreshToken: mockRefreshToken,
      });
    });

    it("should throw BadRequestException for invalid credentials", async () => {
      const mockUserRepo = {
        findByEmailOrUserNameOrPhone: jest.fn().mockResolvedValue(null),
      } as unknown as UserRepository;

      const mockReq = { user: { id: "123" } } as unknown as Request;

      const mockUserRestrictionRepo = {
        findByTypeAndUserId: jest.fn().mockResolvedValue(null),
      } as unknown as UserPermissionRepository;

      // Create container with mocked dependencies
      container = createTestContainer((c) => {
        c.registerInstance(UserRepository, mockUserRepo);
        c.registerInstance(UserPermissionRepository, mockUserRestrictionRepo);
      });

      const service = container.resolve(UserService);

      await expect(
        service.login(mockReq, {
          identifier: "invalid@example.com",
          password: "password123",
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException for incorrect password", async () => {
      const mockUser = { id: 1, password: "hashedPassword", role: "user" };
      const mockUserRepo = {
        findByEmailOrUserNameOrPhone: jest.fn().mockResolvedValue(mockUser),
      } as unknown as UserRepository;

      const mockReq = {
        user: { id: "123" },
        headers: { "user-agent": "" },
      } as unknown as Request;

      const mockUserRestrictionRepo = {
        findByTypeAndUserId: jest.fn().mockResolvedValue(null),
      } as unknown as UserPermissionRepository;

      // Create container with mocked dependencies
      container = createTestContainer((c) => {
        c.registerInstance(UserRepository, mockUserRepo);
        c.registerInstance(UserPermissionRepository, mockUserRestrictionRepo);
      });

      const service = container.resolve(UserService);

      (verifyPassword as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login(mockReq, {
          identifier: "john@example.com",
          password: "wrongpassword",
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("register", () => {
    it("should register a new user and send an OTP", async () => {
      const mockUserRepo = {
        findByEmailOrUserNameOrPhone: jest.fn().mockResolvedValue(null),
      } as unknown as UserRepository;

      const mockOtpRepo = {
        createOtp: jest.fn().mockResolvedValue(undefined),
      } as unknown as OtpRepository;

      const mockNotificationService = {
        sendDirectEmail: jest.fn().mockResolvedValue(undefined),
      } as unknown as NotificationService;

      // Create container with mocked dependencies
      container = createTestContainer((c) => {
        c.registerInstance(UserRepository, mockUserRepo);
        c.registerInstance(OtpRepository, mockOtpRepo);
        c.registerInstance(NotificationService, mockNotificationService);
      });

      const service = container.resolve(UserService);

      (generateOtp as jest.Mock).mockReturnValue(123456);

      await service.register({
        firstName: "John",
        lastName: "Doe",
        email: "test@miratonroseafrica.com",
        userName: "johndoe",
        phone: "1234567890",
        password: "password123",
        role: "user",
      });

      expect(mockOtpRepo.createOtp).toHaveBeenCalledWith(
        expect.objectContaining({
          otp: "123456",
          email: "test@miratonroseafrica.com",
        }),
      );
      expect(mockNotificationService.sendDirectEmail).toHaveBeenCalledWith(
        "registration",
        "test@miratonroseafrica.com",
        { expiresIn: 15, firstName: "John", lastName: "Doe", otp: 123456 },
      );
    });

    it("should throw BadRequestException if user already exists", async () => {
      const mockUser = {
        id: 1,
        password: "hashedPassword",
        role: "user",
        firstName: "John",
        lastName: "Doe",
        userName: "johndoe",
        email: "john@example.com",
        phone: "1234567890",
      };

      const mockUserRepo = {
        findByEmailOrUserNameOrPhone: jest.fn().mockResolvedValue(mockUser),
      } as unknown as UserRepository;

      const mockOtpRepo = {
        createOtp: jest.fn().mockResolvedValue(undefined),
      } as unknown as OtpRepository;

      const mockNotificationService = {
        sendDirectEmail: jest.fn().mockResolvedValue(undefined),
      } as unknown as NotificationService;

      // Create container with mocked dependencies
      container = createTestContainer((c) => {
        c.registerInstance(UserRepository, mockUserRepo);
        c.registerInstance(OtpRepository, mockOtpRepo);
        c.registerInstance(NotificationService, mockNotificationService);
      });

      const service = container.resolve(UserService);

      await expect(
        service.register({
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com",
          userName: "johndoe",
          phone: "1234567890",
          password: "password123",
          role: "user",
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("verifyEmail", () => {
    it("should verify email and create a user", async () => {
      const mockOtp = {
        id: 1,
        data: JSON.stringify({
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com",
          userName: "johndoe",
          phone: "1234567890",
          password: "password123",
        }),
        expiresAt: new Date(Date.now() + 10000),
      };
      const mockHashedPassword = "hashedPassword";
      const mockUser = {
        id: 1,
        firstName: "John",
        lastName: "Doe",
        userName: "johndoe",
        email: "john@example.com",
      };

      const mockUserRepo = {
        createUser: jest.fn().mockResolvedValue(mockUser),
      } as unknown as UserRepository;
      const mockOtpRepo = {
        findByOtpOrEmail: jest.fn().mockResolvedValue(mockOtp),
        deleteOtp: jest.fn().mockResolvedValue(undefined),
      } as unknown as OtpRepository;

      const mockNotificationService = {
        createNotifyPreference: jest.fn().mockResolvedValue(undefined),
        sendDirectEmail: jest.fn().mockResolvedValue(undefined),
      } as unknown as NotificationService;

      // Create container with mocked dependencies
      container = createTestContainer((c) => {
        c.registerInstance(UserRepository, mockUserRepo);
        c.registerInstance(OtpRepository, mockOtpRepo);
        c.registerInstance(NotificationService, mockNotificationService);
      });

      const service = container.resolve(UserService);

      (hashPassword as jest.Mock).mockResolvedValue(mockHashedPassword);

      const result = await service.verifyEmail({
        email: "john@example.com",
        otp: "123456",
      });

      expect(result).toEqual(mockUser);
      expect(mockOtpRepo.deleteOtp).toHaveBeenCalledWith(mockOtp.id);
      expect(mockNotificationService.sendDirectEmail).toHaveBeenCalledWith(
        "welcome",
        mockUser.email,
        { firstName: mockUser.firstName },
      );
    });

    it("should throw BadRequestException for invalid OTP", async () => {
      // Create container with mocked dependencies
      const mockOtpRepo = {
        findByOtpOrEmail: jest.fn().mockResolvedValue(null),
      } as unknown as OtpRepository;

      // Create container with mocked dependencies
      container = createTestContainer((c) => {
        c.registerInstance(OtpRepository, mockOtpRepo);
      });
      container = createTestContainer();

      const service = container.resolve(UserService);

      await expect(
        service.verifyEmail({ email: "john@example.com", otp: "123456" }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException for expired OTP", async () => {
      const mockOtp = { id: 1, expiresAt: new Date(Date.now() - 10000) };
      const mockOtpRepo = {
        findByOtpOrEmail: jest.fn().mockResolvedValue(mockOtp),
      } as unknown as OtpRepository;

      // Create container with mocked dependencies
      container = createTestContainer((c) => {
        c.registerInstance(OtpRepository, mockOtpRepo);
      });

      const service = container.resolve(UserService);

      await expect(
        service.verifyEmail({ email: "john@example.com", otp: "123456" }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("addUserMeter", () => {
    it("should add a meter to a user", async () => {
      const mockUser = { id: "238cec0c-c58e-4fc3-9ac6-1aedeaa0bd1a" };
      const mockMeter = null;
      const mockPreviewMeter = { customer_name: "John Doe" };
      const mockCreatedMeter = { id: "238cec0c-c58e-4fc3-9ac6-1aedeaa0bd1a" };
      const dto = {
        propertyId: "238cec0c-c58e-4fc3-9ac6-1aedeaa0bd1a",
        houseId: "238cec0c-c58e-4fc3-9ac6-1aedeaa0bd1a",
        email: "john@example.com",
        number: "123456789",
      };

      // Mock dependencies
      const mockUserRepo = {
        findByEmail: jest.fn().mockResolvedValue(mockUser),
      } as unknown as UserRepository;
      const mockMeterRepo = {
        findMeterByHouseId: jest.fn().mockResolvedValue(mockMeter),
        findByNumber: jest.fn().mockResolvedValue(null),
      } as unknown as MeterRepository;

      // Create container with mocked dependencies
      container = createTestContainer((c) => {
        c.registerInstance(UserRepository, mockUserRepo);
        c.registerInstance(MeterRepository, mockMeterRepo);
      });

      const service = container.resolve(UserService);

      (previewMeter as jest.Mock).mockResolvedValue(mockPreviewMeter);
      (addMeter as jest.Mock).mockResolvedValue(mockCreatedMeter);

      const result = await service.addUserMeter(dto);

      expect(result).toEqual(mockCreatedMeter);
    });

    it("should throw BadRequestException if user does not exist", async () => {
      // Mock dependencies
      const mockUserRepo = {
        findByEmail: jest.fn().mockResolvedValue(null),
      } as unknown as UserRepository;

      // Create container with mocked dependencies
      container = createTestContainer((c) => {
        c.registerInstance(UserRepository, mockUserRepo);
      });

      const service = container.resolve(UserService);

      await expect(
        service.addUserMeter({
          propertyId: "238cec0c-c58e-4fc3-9ac6-1aedeaa0bd1a",
          houseId: "238cec0c-c58e-4fc3-9ac6-1aedeaa0bd1a",
          email: "john@example.com",
          number: "1234456789",
        }),
      ).rejects.toThrow(BadRequestException);

      expect(mockUserRepo.findByEmail).toHaveBeenCalledWith("john@example.com");
    });

    it("should throw BadRequestException if meter is already attached to another house", async () => {
      const mockUser = { id: "238cec0c-c58e-4fc3-9ac6-1aedeaa0bd1a" };
      const mockExistingMeter = {
        houseId: "238cec0c-c58e-4fc3-9ac6-1aedeaa0bd1a",
      };

      // Mock dependencies
      const mockUserRepo = {
        findByEmail: jest.fn().mockResolvedValue(mockUser),
      } as unknown as UserRepository;
      const mockMeterRepo = {
        findMeterByHouseId: jest.fn().mockResolvedValue(mockExistingMeter),
      } as unknown as MeterRepository;

      // Create container with mocked dependencies
      container = createTestContainer((c) => {
        c.registerInstance(UserRepository, mockUserRepo);
        c.registerInstance(MeterRepository, mockMeterRepo);
      });

      const service = container.resolve(UserService);

      await expect(
        service.addUserMeter({
          propertyId: "238cec0c-c58e-4fc3-9ac6-1aedeaa0bd1a",
          houseId: "238cec0c-c58e-4fc3-9ac6-1aedeaa0bd1a",
          email: "johndoe@gmail.com",
          number: "123456789",
        }),
      ).rejects.toThrow(BadRequestException);

      expect(mockUserRepo.findByEmail).toHaveBeenCalledWith(
        "johndoe@gmail.com",
      );
      expect(mockMeterRepo.findMeterByHouseId).toHaveBeenCalledWith(
        "238cec0c-c58e-4fc3-9ac6-1aedeaa0bd1a",
      );
    });

    it("should throw NotFoundException if meter is not found", async () => {
      const mockUser = { id: "238cec0c-c58e-4fc3-9ac6-1aedeaa0bd1a" };

      // Mock dependencies
      const mockUserRepo = {
        findByEmail: jest.fn().mockResolvedValue(mockUser),
      } as unknown as UserRepository;
      const mockMeterRepo = {
        findMeterByHouseId: jest.fn().mockResolvedValue(null),
        findByNumber: jest.fn().mockResolvedValue(null),
      } as unknown as MeterRepository;

      // Create container with mocked dependencies
      container = createTestContainer((c) => {
        c.registerInstance(UserRepository, mockUserRepo);
        c.registerInstance(MeterRepository, mockMeterRepo);
      });

      const service = container.resolve(UserService);

      (previewMeter as jest.Mock).mockResolvedValue(null);

      await expect(
        service.addUserMeter({
          propertyId: "238cec0c-c58e-4fc3-9ac6-1aedeaa0bd1a",
          houseId: "238cec0c-c58e-4fc3-9ac6-1aedeaa0bd1a",
          email: "john@example.com",
          number: "123457789",
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw BadRequestException if meter is already assigned to another user", async () => {
      const mockUser = { id: "238cec0c-c58e-4fc3-9ac6-1aedeaa0bd1a" };
      const mockPreviewMeter = { customer_name: "John Doe" };
      const mockExistingMeter = {
        houseId: null,
        ownerId: "238cec0c-c58e-4fc3-9ac6-1aedeba0bd1a",
      };

      // Mock dependencies
      const mockUserRepo = {
        findByEmail: jest.fn().mockResolvedValue(mockUser),
      } as unknown as UserRepository;
      const mockMeterRepo = {
        findMeterByHouseId: jest.fn().mockResolvedValue(null),
        findByNumber: jest.fn().mockResolvedValue(mockExistingMeter),
      } as unknown as MeterRepository;

      // Create container with mocked dependencies
      container = createTestContainer((c) => {
        c.registerInstance(UserRepository, mockUserRepo);
        c.registerInstance(MeterRepository, mockMeterRepo);
      });

      const service = container.resolve(UserService);

      (previewMeter as jest.Mock).mockResolvedValue(mockPreviewMeter);

      await expect(
        service.addUserMeter({
          propertyId: "238cec0c-c58e-4fc3-9ac6-1aedeaa0bd1a",
          houseId: "238cec0c-c58e-4fc3-9ac6-1aedeab0bd1a",
          email: "johndoe@gmail.com",
          number: "123456789",
        }),
      ).rejects.toThrow(
        new BadRequestException(
          "This meter is already assigned to another user",
        ),
      );
    });

    it("should update the meter if it already exists and is assigned to the same user", async () => {
      const mockUser = { id: "238cec0c-c58e-4fc3-9ac6-1aedeaa0bd1a" };
      const mockPreviewMeter = { customer_name: "John Doe" };
      const mockExistingMeter = {
        houseId: "238cec0c-c58e-4fc3-9ac6-1aedeaa0bd1a",
        ownerId: "238cec0c-c58e-4fc3-9ac6-1aedeaa0bd1a",
      };
      const mockUpdatedMeter = { id: "238cec0c-c58e-4fc3-9ac6-1aedeaa0bd1a" };
      const dto = {
        propertyId: "238cec0c-c58e-4fc3-9ac6-1aedeaa0bd1a",
        houseId: "238cec0c-c58e-4fc3-9ac6-1aedeaa0bd1a",
        email: "johndoe@gmail.com",
        number: "123456789",
      };

      // Mock dependencies
      const mockUserRepo = {
        findByEmail: jest.fn().mockResolvedValue(mockUser),
      } as unknown as UserRepository;
      const mockMeterRepo = {
        findMeterByHouseId: jest.fn().mockResolvedValue(null),
        findByNumber: jest.fn().mockResolvedValue(mockExistingMeter),
        updateMeterByNumber: jest.fn().mockResolvedValue(mockUpdatedMeter),
      } as unknown as MeterRepository;

      // Create container with mocked dependencies
      container = createTestContainer((c) => {
        c.registerInstance(UserRepository, mockUserRepo);
        c.registerInstance(MeterRepository, mockMeterRepo);
      });

      const service = container.resolve(UserService);

      // Mock implementations
      (previewMeter as jest.Mock).mockResolvedValue(mockPreviewMeter);

      const result = await service.addUserMeter(dto);
      expect(result).toEqual(mockUpdatedMeter);
      expect(mockMeterRepo.updateMeterByNumber).toHaveBeenCalledWith(
        dto.number,
        {
          propertyId: dto.propertyId,
          houseId: dto.houseId,
          ownerId: mockUser.id,
        },
      );
      expect(mockMeterRepo.findByNumber).toHaveBeenCalledWith(dto.number);
      expect(mockMeterRepo.findMeterByHouseId).toHaveBeenCalledWith(
        dto.houseId,
      );
      expect(mockUserRepo.findByEmail).toHaveBeenCalledWith(dto.email);
      expect(previewMeter).toHaveBeenCalledWith(dto.number);
      expect(addMeter).not.toHaveBeenCalled();
      expect(mockMeterRepo.findMeterByHouseId).toHaveBeenCalledWith(
        dto.houseId,
      );
    });

    it("should throw NotFoundException if adding meter fails", async () => {
      const mockUser = { id: "238cec0c-c58e-4fc3-9ac6-1aedeaa0bd1a" };
      const mockPreviewMeter = { customer_name: "John Doe" };

      // Mock dependencies
      const mockUserRepo = {
        findByEmail: jest.fn().mockResolvedValue(mockUser),
      } as unknown as UserRepository;
      const mockMeterRepo = {
        findMeterByHouseId: jest.fn().mockResolvedValue(null),
        findByNumber: jest.fn().mockResolvedValue(null),
      } as unknown as MeterRepository;

      // Create container with mocked dependencies
      container = createTestContainer((c) => {
        c.registerInstance(UserRepository, mockUserRepo);
        c.registerInstance(MeterRepository, mockMeterRepo);
      });

      const service = container.resolve(UserService);

      // Mock implementations
      (previewMeter as jest.Mock).mockResolvedValue(mockPreviewMeter);
      (addMeter as jest.Mock).mockResolvedValue(null);
      await expect(
        service.addUserMeter({
          propertyId: "238cec0c-c58e-4fc3-9ac6-1aedeaa0bd1a",
          houseId: "238cec0c-c58e-4fc3-9ac6-1aedeaa0bd1a",
          email: "johndoe@gmail.com",
          number: "123456789",
        }),
      ).rejects.toThrow(new NotFoundException("Error adding meter to user"));
      expect(mockUserRepo.findByEmail).toHaveBeenCalledWith(
        "johndoe@gmail.com",
      );
      expect(mockMeterRepo.findMeterByHouseId).toHaveBeenCalledWith(
        "238cec0c-c58e-4fc3-9ac6-1aedeaa0bd1a",
      );
      expect(previewMeter).toHaveBeenCalledWith("123456789");
      expect(mockMeterRepo.findByNumber).toHaveBeenCalledWith("123456789");

      expect(addMeter).toHaveBeenCalledWith({
        propertyId: "238cec0c-c58e-4fc3-9ac6-1aedeaa0bd1a",
        houseId: "238cec0c-c58e-4fc3-9ac6-1aedeaa0bd1a",
        ownerId: "238cec0c-c58e-4fc3-9ac6-1aedeaa0bd1a",
        name: "John Doe",
        number: "123456789",
      });
    });
  });

  describe("updateUser", () => {
    it("should update user details", async () => {
      const mockUser = { id: "1", email: "john@example.com", role: "user" };
      const updatedUser = {
        id: "1",
        email: "john@example.com",
        firstName: "Jane",
        role: "user",
      };

      const mockUserRepo = {
        findById: jest.fn().mockResolvedValue(mockUser),
        updateUserByEmail: jest.fn().mockResolvedValue(updatedUser),
      } as unknown as UserRepository;

      container = createTestContainer((c) => {
        c.registerInstance(UserRepository, mockUserRepo);
      });

      const service = container.resolve(UserService);

      const mockReq = { user: { id: "admin" } } as unknown as Request;

      const result = await service.updateUser(mockReq, "1", {
        firstName: "Jane",
        role: "user",
      });

      expect(result).toEqual(updatedUser);
      expect(mockUserRepo.updateUserByEmail).toHaveBeenCalledWith(
        "john@example.com",
        { firstName: "Jane", role: "user" },
      );
    });

    it("should hash password if provided", async () => {
      const mockUser = { id: "1", email: "john@example.com", role: "user" };
      const updatedUser = {
        id: "1",
        email: "john@example.com",
        firstName: "Jane",
        role: "user",
      };

      const mockUserRepo = {
        findById: jest.fn().mockResolvedValue(mockUser),
        updateUserByEmail: jest.fn().mockResolvedValue(updatedUser),
      } as unknown as UserRepository;

      container = createTestContainer((c) => {
        c.registerInstance(UserRepository, mockUserRepo);
      });

      (hashPassword as jest.Mock).mockResolvedValue("hashedPassword");

      const service = container.resolve(UserService);

      const mockReq = { user: { id: "admin" } } as unknown as Request;

      const result = await service.updateUser(mockReq, "1", {
        password: "plainPassword",
      });

      expect(hashPassword).toHaveBeenCalledWith("plainPassword");
      expect(mockUserRepo.updateUserByEmail).toHaveBeenCalledWith(
        "john@example.com",
        { password: "hashedPassword" },
      );
      expect(result).toEqual(updatedUser);
    });

    it("should throw BadRequestException if user does not exist", async () => {
      const mockReq = { user: { id: "admin" } } as unknown as Request;
      const mockUserRepo = {
        findById: jest.fn().mockResolvedValue(null),
      } as unknown as UserRepository;

      container = createTestContainer((c) => {
        c.registerInstance(UserRepository, mockUserRepo);
      });

      const service = container.resolve(UserService);

      await expect(
        service.updateUser(mockReq, "1", { firstName: "Jane" }),
      ).rejects.toThrow(new BadRequestException("User does not exist"));
    });
  });

  describe("inviteUser", () => {
    it("should invite a new user", async () => {
      // mock data
      const mockUser = { id: "1", email: "john@example.com", role: "user" };
      const mockProperty = {
        id: "238cec0c-c58e-4fc3-9ac6-1aedeaa0bd1a",
        name: "Property 1",
      } as Property;

      // Mock dependencies
      const mockUserRepo = {
        findByEmail: jest.fn().mockResolvedValue(null),
      } as unknown as UserRepository;
      const mockPropertyRepo = {
        findById: jest.fn().mockResolvedValue(mockProperty),
      } as unknown as PropertyRepository;
      const mockCacheService = {
        set: jest.fn().mockResolvedValue(undefined),
      } as unknown as CacheService;
      const mockNotificationService = {
        sendDirectEmail: jest.fn().mockResolvedValue(undefined),
      } as unknown as NotificationService;

      // Create container with mocked dependencies
      container = createTestContainer((c) => {
        c.registerInstance(UserRepository, mockUserRepo);
        c.registerInstance(PropertyRepository, mockPropertyRepo);
        c.registerInstance(CacheService, mockCacheService);
        c.registerInstance(NotificationService, mockNotificationService);
      });

      const service = container.resolve(UserService);

      const input = {
        propertyId: mockProperty.id,
        email: mockUser.email,
      };
      const spy = jest.spyOn(service, "generateInvitationCode");

      // execute
      const result = await service.inviteUser(input);

      // assert
      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith(
        `${mockUser.email}:${mockProperty.id}`,
        7,
        1800000,
      );
      expect(result).toBeDefined();
      expect(result).toHaveLength(7);
    });

    it("should throw NotFoundException if property does not exist", async () => {
      // mock data
      const mockUser = { id: "1", email: "john@example.com", role: "user" };
      const input = {
        propertyId: "propertyId",
        email: mockUser.email,
      };

      // Mock dependencies
      const mockUserRepo = {
        findById: jest.fn().mockResolvedValue(mockUser),
      } as unknown as UserRepository;
      const mockPropertyRepo = {
        findById: jest.fn().mockResolvedValue(null),
      } as unknown as PropertyRepository;

      // Create container with mocked dependencies
      container = createTestContainer((c) => {
        c.registerInstance(UserRepository, mockUserRepo);
        c.registerInstance(PropertyRepository, mockPropertyRepo);
      });

      const service = container.resolve(UserService);

      // execute & assert
      await expect(service.inviteUser(input)).rejects.toThrow(
        new NotFoundException("Property not found"),
      );
    });

    it("should throw BadRequestException if user already exists", async () => {
      // mock data
      const mockUser = { id: "1", email: "john@example.com", role: "user" };
      const mockProperty = {
        id: "238cec0c-c58e-4fc3-9ac6-1aedeaa0bd1a",
        name: "Property 1",
      } as Property;
      // Mock dependencies
      const mockUserRepo = {
        findByEmail: jest.fn().mockResolvedValue(mockUser),
      } as unknown as UserRepository;
      const mockPropertyRepo = {
        findById: jest.fn().mockResolvedValue(mockProperty),
      } as unknown as PropertyRepository;

      // Create container with mocked dependencies
      container = createTestContainer((c) => {
        c.registerInstance(UserRepository, mockUserRepo);
        c.registerInstance(PropertyRepository, mockPropertyRepo);
      });

      const service = container.resolve(UserService);

      const input = {
        propertyId: mockProperty.id,
        email: mockUser.email,
      };

      // execute & assert
      await expect(service.inviteUser(input)).rejects.toThrow(
        new BadRequestException("User already exists"),
      );
    });
  });

  describe("completeRegistration", () => {
    it("should complete user registration", async () => {
      // mock data
      const mockEmail = "john@example.com";
      const mockProperty = { id: "propertyId" };
      const mockSecurity = { id: "securityId" };
      const mockDto: CompleteRegDto = {
        firstName: "John",
        lastName: "Doe",
        password: "password123",
        phone: "1234567890",
        role: "security",
        token: "token",
      };
      const mockUser = {
        id: "userId",
        email: mockEmail,
        firstName: mockDto.firstName,
      };
      const mockCacheResult = `${mockEmail}:${mockProperty.id}`;

      // Mock dependencies
      const mockUserRepo = {
        findByEmail: jest.fn().mockResolvedValue(null),
        createUser: jest.fn().mockResolvedValue(mockUser),
      } as unknown as UserRepository;

      const mockPropertyRepo = {
        findById: jest.fn().mockResolvedValue(mockProperty),
      } as unknown as PropertyRepository;

      const mockSecurityRepo = {
        assignGuardToProperty: jest.fn().mockResolvedValue(mockSecurity),
      } as unknown as SecurityAssignmentRepository;

      const mockCacheService = {
        get: jest.fn().mockResolvedValue(mockCacheResult),
        delete: jest.fn().mockResolvedValue(undefined),
      } as unknown as CacheService;

      const mockNotificationService = {
        sendDirectEmail: jest.fn().mockResolvedValue(undefined),
      } as unknown as NotificationService;

      // Create container with mocked dependencies
      container = createTestContainer((c) => {
        c.registerInstance(UserRepository, mockUserRepo);
        c.registerInstance(PropertyRepository, mockPropertyRepo);
        c.registerInstance(SecurityAssignmentRepository, mockSecurityRepo);
        c.registerInstance(CacheService, mockCacheService);
        c.registerInstance(NotificationService, mockNotificationService);
      });

      const service = container.resolve(UserService);

      // execute
      const result = await service.completeRegistration(mockDto);

      // assert
      expect(mockCacheService.get).toHaveBeenCalled();
      expect(mockCacheService.get).toHaveBeenCalledWith(mockDto.token);
      expect(mockUserRepo.createUser).toHaveBeenCalled();
      expect(result).toEqual({
        id: "userId",
        email: mockEmail,
        firstName: mockDto.firstName,
      });
    });

    it("should throw BadRequestException if token does not exist or invalid", async () => {
      // mock data
      const mockDto: CompleteRegDto = {
        firstName: "John",
        lastName: "Doe",
        password: "password123",
        phone: "1234567890",
        role: "security",
        token: "token",
      };
      const mockCacheResult = null;

      // Mock dependencies
      const mockCacheService = {
        get: jest.fn().mockResolvedValue(mockCacheResult),
      } as unknown as CacheService;

      // Create container with mocked dependencies
      container = createTestContainer((c) => {
        c.registerInstance(CacheService, mockCacheService);
      });

      const service = container.resolve(UserService);

      // execute and assert
      await expect(service.completeRegistration(mockDto)).rejects.toThrow(
        new BadRequestException("Invalid or expired code provided"),
      );
    });

    it("should throw BadRequestException if token does not contain email or propertyId", async () => {
      // mock data
      const mockDto: CompleteRegDto = {
        firstName: "John",
        lastName: "Doe",
        password: "password123",
        phone: "1234567890",
        role: "security",
        token: "token",
      };

      const mockCacheResult = "firstpart";

      // Mock dependencies
      const mockCacheService = {
        get: jest.fn().mockResolvedValue(mockCacheResult),
      } as unknown as CacheService;

      // Create container with mocked dependencies
      container = createTestContainer((c) => {
        c.registerInstance(CacheService, mockCacheService);
      });

      const service = container.resolve(UserService);

      // execute and assert
      await expect(service.completeRegistration(mockDto)).rejects.toThrow(
        new BadRequestException("Invalid code provided"),
      );
    });

    it("should throw BadRequestException if user already exists", async () => {
      // mock data
      const mockDto: CompleteRegDto = {
        firstName: "John",
        lastName: "Doe",
        password: "password123",
        phone: "1234567890",
        role: "security",
        token: "token",
      };
      const mockCacheResult = "email:propertyId";
      const mockUser = { id: "userId" };
      const mockUserRepo = {
        findByEmail: jest.fn().mockResolvedValue(mockUser),
      } as unknown as UserRepository;

      const mockCacheService = {
        get: jest.fn().mockResolvedValue(mockCacheResult),
      } as unknown as CacheService;

      // Create container with mocked dependencies
      container = createTestContainer((c) => {
        c.registerInstance(UserRepository, mockUserRepo);
        c.registerInstance(CacheService, mockCacheService);
      });

      const service = container.resolve(UserService);

      // execute and assert
      await expect(service.completeRegistration(mockDto)).rejects.toThrow(
        new BadRequestException("User already exists"),
      );
    });
  });

  describe("Delete User", () => {
    const mockReq = {
      user: {
        id: "id-1",
        email: "test@miratonroseafrica.com",
      },
    } as unknown as Request;

    const mockUser = {
      id: "id-2",
      deletedAt: "2025-09-02T19:22:32.555Z",
    };

    const mockActiveUser = {
      id: "id-2",
    };

    const mockUserRepo = {
      findById: jest.fn().mockResolvedValue(null),
      deleteUser: jest.fn(),
    } as unknown as UserRepository;

    it("should throw NotFoundException if user does not exist", async () => {
      container = createTestContainer((c) => {
        c.registerInstance(UserRepository, mockUserRepo);
      });

      const service = container.resolve(UserService);

      expect(service.deleteUser(mockReq, mockUser.id)).rejects.toThrow(
        new NotFoundException("User not found"),
      );
    });

    it("should throw BadRequestException if user is already deleted", async () => {
      mockUserRepo.findById = jest.fn().mockResolvedValue(mockUser);

      container = createTestContainer((c) => {
        c.registerInstance(UserRepository, mockUserRepo);
      });

      const service = container.resolve(UserService);

      expect(service.deleteUser(mockReq, mockUser.id)).rejects.toThrow(
        new BadRequestException("User already deleted"),
      );
    });

    it("should delete a user", async () => {
      mockUserRepo.findById = jest.fn().mockResolvedValue(mockActiveUser);
      mockUserRepo.deleteUser = jest
        .fn()
        .mockResolvedValue({ ...mockActiveUser, deletedAt: new Date() });

      container = createTestContainer((c) => {
        c.registerInstance(UserRepository, mockUserRepo);
      });

      const service = container.resolve(UserService);

      const result = await service.deleteUser(mockReq, mockActiveUser.id);

      expect(result.deletedAt).toBeInstanceOf(Date);
    });
  });

  describe("Restore User", () => {
    const mockReq = {
      user: {
        id: "id-1",
        email: "test@miratonroseafrica.com",
      },
    } as unknown as Request;

    const mockDeletedUser = {
      id: "id-2",
      deletedAt: "2025-09-02T19:22:32.555Z",
    };

    const mockActiveUser = {
      id: "id-2",
      deletedAt: null,
    };

    const mockUserRepo = {
      findById: jest.fn().mockResolvedValue(null),
      restoreUser: jest.fn().mockResolvedValue(mockActiveUser),
    } as unknown as UserRepository;

    it("should throw NotFoundException if user does not exist", () => {
      container = createTestContainer((c) => {
        c.registerInstance(UserRepository, mockUserRepo);
      });

      const service = container.resolve(UserService);

      expect(service.restoreUser(mockReq, mockActiveUser.id)).rejects.toThrow(
        new NotFoundException("User not found"),
      );
    });
    it("should restore a user account", async () => {
      mockUserRepo.findById = jest.fn().mockResolvedValue(mockDeletedUser);

      container = createTestContainer((c) => {
        c.registerInstance(UserRepository, mockUserRepo);
      });

      const service = container.resolve(UserService);

      const result = await service.restoreUser(mockReq, mockDeletedUser.id);

      expect(result).toBeDefined();
      expect(result.deletedAt).toBeNull();
    });
  });
});
