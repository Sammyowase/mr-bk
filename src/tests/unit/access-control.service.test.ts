import { JwtPayload } from "jsonwebtoken";
import { createTestContainer } from "../utils/test-container";
import {
  AccessDecision,
  AccessPointType,
  AccessStatus,
  AccessType,
  GuestEntry,
  House,
  HouseType,
  PropertyType,
  Role,
} from "../../../prisma/generated/prisma";
import { Request } from "express";
import AccessPointRepository from "../../repository/access-point.repository";
import AccessControlService from "../../services/access-control.service";
import {
  BadRequestException,
  NotFoundException,
} from "../../utils/exceptions/customException";
import { UpdateGuestLogResponse } from "../../types/access-control";
import AuditLogService from "../../services/audit.service";
import PropertyRepository from "../../repository/property.repository";
import HouseRepository from "../../repository/house.repository";
import UserRepository from "../../repository/user.repository";

// Mock nanoid to fix ES module import issues
jest.mock("nanoid", () => ({
  customAlphabet: jest.fn(() => jest.fn(() => "123456")),
}));

// Mock QRCode
jest.mock("qrcode", () => ({
  toDataURL: jest.fn(() => Promise.resolve("data:image/png;base64,mockQRCode")),
}));

describe("AccessControlService", () => {
  let container: ReturnType<typeof createTestContainer>;

  const mockUser: JwtPayload = {
    id: "user-123",
    email: "test@example.com",
    role: Role.manager,
  };

  const mockRequest = {
    user: mockUser,
  } as Request;

  const mockAccessPoint = {
    id: "access-point-123",
    name: "Main Gate",
    description: "Primary entrance",
    type: AccessPointType.main_gate,
    propertyId: "property-123",
    houseId: null,
    isActive: true,
    createdAt: new Date(),
    Property: {
      id: "property-123",
      name: "Test Property",
    },
    House: null,
  };

  const mockProperty = {
    id: "property-123",
    name: "Test Property",
    type: PropertyType.estate,
    createdAt: new Date(),
    updatedAt: new Date(),
    address: "123 Main St",
    city: "Test City",
    state: "Test State",
    country: "Test Country",
    tarrif: 1.5,
    tax: 0.1,
    managerId: "user-123",
    authorId: "user-456",
    minVend: 100,
    maxVend: 10000,
    auditRef: "audit-ref-123",
  };

  const mockAccessToken = {
    id: "token-123",
    code: "123456",
    type: AccessType.numeric,
    status: AccessStatus.active,
    issuedById: "user-123",
    guestName: "John Doe",
    guestPhotoUrl: null,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
    accesspointId: "access-point-123",
    createdAt: new Date(),
    issuedBy: {
      id: "user-123",
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
    },
    AccessPoint: {
      id: "access-point-123",
      name: "Main Gate",
      type: AccessPointType.main_gate,
    },
  };

  const mockHouse = {
    name: "House-1",
    id: "House-1",
    propertyId: "Property-1",
    meterId: "meter-1",
    type: HouseType.bungalow,
    address: "unit 1",
    authorId: "author-1",
    createdAt: new Date(),
    updatedAt: new Date(),
  } as House;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(() => {
    container.clearInstances();
  });

  describe("getAllAccessPoints", () => {
    const mockResult = { points: [mockAccessPoint], total: 1 };
    const mockAccessPointRepository = {
      getAllAccessPoints: jest.fn().mockResolvedValue(mockResult),
    } as unknown as AccessPointRepository;

    container = createTestContainer((c) => {
      c.registerInstance(AccessPointRepository, mockAccessPointRepository);
    });

    const service = container.resolve(AccessControlService);

    it("should return paginated access points successfully", async () => {
      const result = await service.getAllAccessPoints(
        "1",
        "10",
        "name",
        "asc",
        "main",
      );
      expect(result).toEqual({
        data: [mockAccessPoint],
        metadata: { total: 1, page: 1, size: 10 },
      });
    });
    it("should throw BadRequestException for invalid sort field", async () => {
      await expect(
        service.getAllAccessPoints("1", "10", "invalid", "asc", ""),
      ).rejects.toThrow();
    });
  });

  describe("createAccessPoint", () => {
    const createDto = {
      name: "Main Gate",
      description: "Primary entrance",
      type: AccessPointType.main_gate,
      propertyId: "property-123",
    };

    it("should create access point successfully", async () => {
      const mockPropertyRepo = {
        findById: jest.fn().mockResolvedValue(mockProperty),
        findPropertyByNameAuthorIdAndAddress: jest.fn().mockResolvedValue(null),
        createProperty: jest.fn().mockResolvedValue(mockProperty),
      } as unknown as PropertyRepository;

      const mockAccessPointRepo = {
        findGuestLogById: jest.fn().mockResolvedValue(null),
        checkAccessPointExists: jest.fn().mockResolvedValue(null),
        createAccessPoint: jest.fn().mockResolvedValue(mockAccessPoint),
      } as unknown as AccessPointRepository;

      container = createTestContainer((c) => {
        c.registerInstance(AccessPointRepository, mockAccessPointRepo);
        c.registerInstance(PropertyRepository, mockPropertyRepo);
      });
      const service = container.resolve(AccessControlService);

      const result = await service.createAccessPoint(mockRequest, createDto);
      expect(result).toEqual(mockAccessPoint);
    });
    it("should throw NotFoundException when property does not exist", async () => {
      const mockPropertyRepo = {
        findById: jest.fn().mockResolvedValue(null),
      } as unknown as PropertyRepository;

      container = createTestContainer((c) => {
        c.registerInstance(PropertyRepository, mockPropertyRepo);
      });
      const service = container.resolve(AccessControlService);

      await expect(
        service.createAccessPoint(mockRequest, createDto),
      ).rejects.toThrow();
    });
    it("should throw ConflictException when access point already exists", async () => {
      const mockPropertyRepo = {
        findById: jest.fn().mockResolvedValue(mockProperty),
      } as unknown as PropertyRepository;

      const mockAccessPointRepo = {
        checkAccessPointExists: jest.fn().mockResolvedValue(mockAccessPoint),
      } as unknown as AccessPointRepository;

      container = createTestContainer((c) => {
        c.registerInstance(PropertyRepository, mockPropertyRepo);
        c.registerInstance(AccessPointRepository, mockAccessPointRepo);
      });
      const service = container.resolve(AccessControlService);

      await expect(
        service.createAccessPoint(mockRequest, createDto),
      ).rejects.toThrow();
    });
  });

  describe("updateAccessPoint", () => {
    const updateDto = { name: "Updated Gate", isActive: false };
    it("should update access point successfully", async () => {
      const mockPropertyRepo = {
        findById: jest.fn().mockResolvedValue(mockProperty),
      } as unknown as PropertyRepository;

      const mockAccessPointRepo = {
        findById: jest.fn().mockResolvedValue(mockAccessPoint),
        updateAccessPoint: jest
          .fn()
          .mockResolvedValue({ ...mockAccessPoint, ...updateDto }),
      } as unknown as AccessPointRepository;

      container = createTestContainer((c) => {
        c.registerInstance(PropertyRepository, mockPropertyRepo);
        c.registerInstance(AccessPointRepository, mockAccessPointRepo);
      });
      const service = container.resolve(AccessControlService);

      const result = await service.updateAccessPoint(
        mockRequest,
        "access-point-123",
        updateDto,
      );
      expect(result.name).toBe("Updated Gate");
    });
    it("should throw NotFoundException when access point does not exist", async () => {
      const mockAccessPointRepo = {
        findById: jest.fn().mockResolvedValue(null),
      } as unknown as AccessPointRepository;

      container = createTestContainer((c) => {
        c.registerInstance(AccessPointRepository, mockAccessPointRepo);
      });
      const service = container.resolve(AccessControlService);

      await expect(
        service.updateAccessPoint(mockRequest, "invalid-id", updateDto),
      ).rejects.toThrow();
    });
  });

  describe("deleteAccessPoint", () => {
    it("should delete access point successfully", async () => {
      const mockPropertyRepo = {
        findById: jest.fn().mockResolvedValue(mockProperty),
      } as unknown as PropertyRepository;

      const mockAccessPointRepo = {
        findById: jest.fn().mockResolvedValue(mockAccessPoint),
        deleteAccessPoint: jest.fn().mockResolvedValue(undefined),
      } as unknown as AccessPointRepository;

      container = createTestContainer((c) => {
        c.registerInstance(PropertyRepository, mockPropertyRepo);
        c.registerInstance(AccessPointRepository, mockAccessPointRepo);
      });
      const service = container.resolve(AccessControlService);

      await service.deleteAccessPoint(mockRequest, "access-point-123");
      expect(mockAccessPointRepo.deleteAccessPoint).toHaveBeenCalledWith(
        "access-point-123",
      );
    });
    it("should throw NotFoundException when access point does not exist", async () => {
      const mockAccessPointRepo = {
        findById: jest.fn().mockResolvedValue(null),
      } as unknown as AccessPointRepository;

      container = createTestContainer((c) => {
        c.registerInstance(AccessPointRepository, mockAccessPointRepo);
      });
      const service = container.resolve(AccessControlService);

      await expect(
        service.deleteAccessPoint(mockRequest, "invalid-id"),
      ).rejects.toThrow();
    });
  });

  describe("generateAccessCode", () => {
    const generateDto = {
      accesspointId: "access-point-123",
      type: AccessType.numeric,
      guestName: "John Doe",
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };
    it("should generate access code successfully", async () => {
      const mockPropertyRepo = {
        findById: jest.fn().mockResolvedValue(mockProperty),
      } as unknown as PropertyRepository;

      const mockAccessPointRepo = {
        findById: jest.fn().mockResolvedValue(mockAccessPoint),
        findAccessTokenByCode: jest.fn().mockResolvedValue(null),
        createAccessToken: jest.fn().mockResolvedValue(mockAccessToken),
      } as unknown as AccessPointRepository;

      container = createTestContainer((c) => {
        c.registerInstance(PropertyRepository, mockPropertyRepo);
        c.registerInstance(AccessPointRepository, mockAccessPointRepo);
      });
      const service = container.resolve(AccessControlService);

      jest.spyOn(service, "generateCode").mockReturnValue("123456");

      const result = await service.generateAccessCode(mockRequest, generateDto);
      expect(result).toEqual(mockAccessToken);
    });
    it("should throw NotFoundException when access point does not exist", async () => {
      const mockAccessPointRepo = {
        findById: jest.fn().mockResolvedValue(null),
      } as unknown as AccessPointRepository;

      container = createTestContainer((c) => {
        c.registerInstance(AccessPointRepository, mockAccessPointRepo);
      });
      const service = container.resolve(AccessControlService);
      await expect(
        service.generateAccessCode(mockRequest, generateDto),
      ).rejects.toThrow();
    });
    it("should throw BadRequestException when unable to generate unique code", async () => {
      const mockPropertyRepo = {
        findById: jest.fn().mockResolvedValue(mockProperty),
      } as unknown as PropertyRepository;

      const mockAccessPointRepo = {
        findById: jest.fn().mockResolvedValue(mockAccessPoint),
        findAccessTokenByCode: jest.fn().mockResolvedValue(mockAccessToken),
        createAccessToken: jest.fn().mockResolvedValue(mockAccessToken),
      } as unknown as AccessPointRepository;

      container = createTestContainer((c) => {
        c.registerInstance(PropertyRepository, mockPropertyRepo);
        c.registerInstance(AccessPointRepository, mockAccessPointRepo);
      });
      const service = container.resolve(AccessControlService);

      await expect(
        service.generateAccessCode(mockRequest, generateDto),
      ).rejects.toThrow();
    });
  });

  describe("getAllAccessCodes", () => {
    it("should return paginated access codes successfully", async () => {
      const mockResult = { tokens: [mockAccessToken], total: 1 };
      const mockPropertyRepo = {
        findById: jest.fn().mockResolvedValue(mockProperty),
      } as unknown as PropertyRepository;

      const mockAccessPointRepo = {
        findById: jest.fn().mockResolvedValue(mockAccessPoint),
        getAllAccessTokens: jest.fn().mockResolvedValue(mockResult),
      } as unknown as AccessPointRepository;

      container = createTestContainer((c) => {
        c.registerInstance(PropertyRepository, mockPropertyRepo);
        c.registerInstance(AccessPointRepository, mockAccessPointRepo);
      });

      const service = container.resolve(AccessControlService);

      const result = await service.getAllAccessCodes(
        mockRequest,
        "access-point-123",
        "1",
        "10",
        "createdAt",
        "desc",
        "john",
        "active",
      );
      expect(result).toEqual({
        data: [mockAccessToken],
        metadata: { total: 1, page: 1, size: 10 },
      });
    });
    it("should throw NotFoundException when access point does not exist", async () => {
      const mockAccessPointRepo = {
        findById: jest.fn().mockResolvedValue(null),
      } as unknown as AccessPointRepository;

      container = createTestContainer((c) => {
        c.registerInstance(AccessPointRepository, mockAccessPointRepo);
      });

      const service = container.resolve(AccessControlService);

      await expect(
        service.getAllAccessCodes(
          mockRequest,
          "invalid-id",
          "1",
          "10",
          "createdAt",
          "desc",
          "",
          "",
        ),
      ).rejects.toThrow();
    });
  });

  describe("deleteAccessCode", () => {
    it("should delete access code successfully", async () => {
      const mockAccessPointRepo = {
        findById: jest.fn().mockResolvedValue(mockAccessPoint),
        findAccessTokenById: jest.fn().mockResolvedValue(mockAccessToken),
        deleteAccessToken: jest.fn().mockResolvedValue(undefined),
      } as unknown as AccessPointRepository;

      container = createTestContainer((c) => {
        c.registerInstance(AccessPointRepository, mockAccessPointRepo);
      });

      const service = container.resolve(AccessControlService);

      await service.deleteAccessCode(mockRequest, "token-123");
      expect(mockAccessPointRepo.deleteAccessToken).toHaveBeenCalledWith(
        "token-123",
      );
    });
    it("should throw NotFoundException when access code does not exist", async () => {
      const mockAccessPointRepo = {
        findAccessTokenById: jest.fn().mockResolvedValue(null),
      } as unknown as AccessPointRepository;

      container = createTestContainer((c) => {
        c.registerInstance(AccessPointRepository, mockAccessPointRepo);
      });

      const service = container.resolve(AccessControlService);

      await expect(
        service.deleteAccessCode(mockRequest, "invalid-id"),
      ).rejects.toThrow();
    });
  });

  describe("revokeAccessCode", () => {
    it("should revoke access code successfully", async () => {
      const revokedToken = { ...mockAccessToken, status: AccessStatus.revoked };

      const mockPropertyRepo = {
        findById: jest.fn().mockResolvedValue(mockProperty),
      } as unknown as PropertyRepository;

      const mockAccessPointRepo = {
        findById: jest.fn().mockResolvedValue(mockAccessPoint),
        findAccessTokenById: jest.fn().mockResolvedValue(mockAccessToken),
        revokeAccessToken: jest.fn().mockResolvedValue(revokedToken),
      } as unknown as AccessPointRepository;

      container = createTestContainer((c) => {
        c.registerInstance(AccessPointRepository, mockAccessPointRepo);
        c.registerInstance(PropertyRepository, mockPropertyRepo);
      });

      const service = container.resolve(AccessControlService);

      const result = await service.revokeAccessCode(mockRequest, "token-123");
      expect(result.status).toBe(AccessStatus.revoked);
    });
    it("should throw NotFoundException when access token does not exist", async () => {
      const mockAccessPointRepo = {
        findAccessTokenById: jest.fn().mockResolvedValue(null),
      } as unknown as AccessPointRepository;

      container = createTestContainer((c) => {
        c.registerInstance(AccessPointRepository, mockAccessPointRepo);
      });

      const service = container.resolve(AccessControlService);

      await expect(
        service.revokeAccessCode(mockRequest, "invalid-id"),
      ).rejects.toThrow();
    });
    it("should throw BadRequestException when token is already revoked", async () => {
      const revokedToken = { ...mockAccessToken, status: AccessStatus.revoked };
      const mockAccessPointRepo = {
        findAccessTokenById: jest.fn().mockResolvedValue(revokedToken),
      } as unknown as AccessPointRepository;

      container = createTestContainer((c) => {
        c.registerInstance(AccessPointRepository, mockAccessPointRepo);
      });

      const service = container.resolve(AccessControlService);

      await expect(
        service.revokeAccessCode(mockRequest, "token-123"),
      ).rejects.toThrow();
    });
  });

  describe("assignSecurityRole", () => {
    const assignDto = { userId: "target-user-123", propertyId: "property-123" };
    const targetUser = {
      id: "target-user-123",
      email: "target@example.com",
      role: Role.user,
      createdAt: new Date(),
      updatedAt: new Date(),
      firstName: "Target",
      lastName: "User",
      userName: "targetuser",
      password: "hashedpassword",
      phone: null,
    };

    const mockUserRepo = {
      findById: jest.fn().mockResolvedValue(null),
      updateUserRole: jest.fn().mockResolvedValue(null),
    } as unknown as UserRepository;

    const mockPropertyRepo = {
      findById: jest.fn().mockResolvedValue(null),
    } as unknown as PropertyRepository;

    container = createTestContainer((c) => {
      c.registerInstance(PropertyRepository, mockPropertyRepo);
      c.registerInstance(UserRepository, mockUserRepo);
    });

    let service = container.resolve(AccessControlService);

    it("should assign security role successfully", async () => {
      const adminRequest = {
        user: { ...mockUser, role: Role.admin },
      } as unknown as Request;
      const updatedUser = { ...targetUser, role: Role.security };
      mockUserRepo.findById = jest.fn().mockResolvedValue(targetUser);
      mockPropertyRepo.findById = jest.fn().mockResolvedValue(mockProperty);
      mockUserRepo.updateUserRole = jest.fn().mockResolvedValue(updatedUser);

      container = createTestContainer((c) => {
        c.registerInstance(PropertyRepository, mockPropertyRepo);
        c.registerInstance(UserRepository, mockUserRepo);
      });

      service = container.resolve(AccessControlService);

      const result = await service.assignSecurityRole(adminRequest, assignDto);
      expect(result.role).toBe("security");
    });
    it("should throw UnauthorizedException for non-admin user", async () => {
      await expect(
        service.assignSecurityRole(mockRequest, assignDto),
      ).rejects.toThrow();
    });
    it("should throw NotFoundException when target user does not exist", async () => {
      const adminRequest = {
        user: { ...mockUser, role: Role.admin },
      } as unknown as Request;
      mockUserRepo.findById = jest.fn().mockResolvedValue(null);

      container = createTestContainer((c) => {
        c.registerInstance(PropertyRepository, mockPropertyRepo);
        c.registerInstance(UserRepository, mockUserRepo);
      });

      service = container.resolve(AccessControlService);

      await expect(
        service.assignSecurityRole(adminRequest, assignDto),
      ).rejects.toThrow();
    });
  });

  describe("generateCode", () => {
    container = createTestContainer();

    const service = container.resolve(AccessControlService);

    it("should generate numeric code of specified length", () => {
      const code = service.generateCode(6);
      expect(code).toMatch(/^[0-9]{6}$/);
    });
    it("should generate code with default length of 6", () => {
      const code = service.generateCode();
      expect(code).toMatch(/^[0-9]{6}$/);
    });
  });

  describe("generateQRCode", () => {
    const qrDto = {
      accesspointId: "access-point-123",
      guestName: "John Doe",
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };

    it("should generate QR code successfully", async () => {
      const mockPropertyRepo = {
        findById: jest.fn().mockResolvedValue(mockProperty),
      } as unknown as PropertyRepository;

      const mockAccessPointRepo = {
        findById: jest.fn().mockResolvedValue(mockAccessPoint),
        findAccessTokenByCode: jest.fn().mockResolvedValue(null),
        createAccessToken: jest
          .fn()
          .mockResolvedValue({ ...mockAccessToken, type: AccessType.qr }),
      } as unknown as AccessPointRepository;

      container = createTestContainer((c) => {
        c.registerInstance(AccessPointRepository, mockAccessPointRepo);
        c.registerInstance(PropertyRepository, mockPropertyRepo);
      });

      const service = container.resolve(AccessControlService);

      jest.spyOn(service, "generateCode").mockReturnValue("123456");

      const result = await service.generateQRCode(mockRequest, qrDto);

      expect(result).toHaveProperty("qrCodeImage");
      expect(result.qrCodeImage).toMatch(/^data:image\/png;base64,/);
      expect(result.code).toBe("123456");
      expect(result.type).toBe(AccessType.qr);
    });
  });

  describe("getResidentAccessCodes", () => {
    it("should return paginated access code for a resident", async () => {
      const mockResult = { tokens: [mockAccessToken], total: 1 };
      const mockHouseRepo = {
        findById: jest.fn().mockResolvedValue(mockHouse),
      } as unknown as HouseRepository;

      const mockAccessPointRepo = {
        findById: jest.fn().mockResolvedValue(mockAccessPoint),
        findAccessTokenById: jest.fn().mockResolvedValue(mockAccessToken),
        getResidentAccessCodes: jest.fn().mockResolvedValue(mockResult),
      } as unknown as AccessPointRepository;

      container = createTestContainer((c) => {
        c.registerInstance(AccessPointRepository, mockAccessPointRepo);
        c.registerInstance(HouseRepository, mockHouseRepo);
      });

      const service = container.resolve(AccessControlService);

      const result = await service.getResidentAccessCodes("House-1", "1", "10");
      expect(result).toEqual({
        data: [mockAccessToken],
        metadata: { total: 1, page: 1, size: 10 },
      });
    });
    it("should throw NotFoundException when house does not exist", async () => {
      const mockHouseRepo = {
        findById: jest.fn().mockResolvedValue(null),
      } as unknown as HouseRepository;

      container = createTestContainer((c) => {
        c.registerInstance(HouseRepository, mockHouseRepo);
      });

      const service = container.resolve(AccessControlService);

      expect(
        service.getResidentAccessCodes("House-2", "1", "10"),
      ).rejects.toThrow(new NotFoundException("House not found"));
    });
  });

  describe("entryRequest", () => {
    const baseToken = {
      id: "token123",
      code: "ABC123",
      accesspointId: "point123",
      guestName: "John Doe",
      validFrom: new Date(Date.now() - 1000 * 60), // 1 min ago
      validUntil: new Date(Date.now() + 1000 * 60), // 1 min in future
      AccessPoint: {
        propertyId: "prop123",
        name: "Main Gate",
      },
    };

    const mockAccessPointRepo = {
      findById: jest.fn().mockResolvedValue(mockAccessPoint),
      findAccessTokenByCode: jest.fn().mockResolvedValue(null),
      addGuestLogs: jest.fn(),
    } as unknown as AccessPointRepository;

    container = createTestContainer((c) => {
      c.registerInstance(AccessPointRepository, mockAccessPointRepo);
    });

    let service = container.resolve(AccessControlService);

    beforeEach(() => {
      jest.clearAllMocks();
      jest.resetAllMocks();
    });

    it("should throw BadRequestException if access code is invalid", async () => {
      await expect(
        service.entryRequest({
          code: "INVALID",
          securityId: "sec1",
          guestItems: "",
          accessStatus: AccessDecision.granted,
          photoCapturedUrl: "photo.jpg",
        }),
      ).rejects.toThrow(BadRequestException);

      expect(mockAccessPointRepo.findAccessTokenByCode).toHaveBeenCalledWith(
        "INVALID",
      );
    });

    it("should create entry request within validity period", async () => {
      const mockEntry = { id: "log1" } as GuestEntry;
      mockAccessPointRepo.findAccessTokenByCode = jest
        .fn()
        .mockResolvedValue(baseToken);

      mockAccessPointRepo.addGuestLogs = jest
        .fn()
        .mockResolvedValueOnce(mockEntry);

      container = createTestContainer((c) => {
        c.registerInstance(AccessPointRepository, mockAccessPointRepo);
      });

      const mockLogAudit = container.resolve(AuditLogService).logAudit;
      service = container.resolve(AccessControlService);

      const result = await service.entryRequest({
        code: "ABC123",
        securityId: "sec1",
        guestItems: "Bag",
        accessStatus: AccessDecision.granted,
        photoCapturedUrl: "photo.jpg",
      });

      expect(mockAccessPointRepo.findAccessTokenByCode).toHaveBeenCalledWith(
        "ABC123",
      );
      expect(mockAccessPointRepo.addGuestLogs).toHaveBeenCalledWith(
        expect.objectContaining({
          accessStatus: AccessDecision.granted,
          guestName: "John Doe",
        }),
      );
      expect(mockLogAudit).toHaveBeenCalled();
      expect(result).toBe(mockEntry);
    });

    it("should deny access if outside validity period", async () => {
      const expiredToken = {
        ...baseToken,
        validFrom: new Date(Date.now() - 1000 * 60 * 5), // 5 mins ago
        validUntil: new Date(Date.now() - 1000 * 60), // expired 1 min ago
      };

      mockAccessPointRepo.findAccessTokenByCode = jest
        .fn()
        .mockResolvedValueOnce(expiredToken);
      mockAccessPointRepo.addGuestLogs = jest
        .fn()
        .mockResolvedValueOnce({ id: "log2" } as GuestEntry);

      container = createTestContainer((c) => {
        c.registerInstance(AccessPointRepository, mockAccessPointRepo);
      });

      service = container.resolve(AccessControlService);

      const result = await service.entryRequest({
        code: "ABC123",
        securityId: "sec1",
        guestItems: "pen",
        accessStatus: AccessDecision.granted, // should be overridden
        photoCapturedUrl: "photo.jpg",
      });

      expect(mockAccessPointRepo.addGuestLogs).toHaveBeenCalledWith(
        expect.objectContaining({
          accessStatus: AccessDecision.denied,
          exitTime: expect.any(Date),
        }),
      );
      expect(result).toEqual({ id: "log2" });
    });
  });

  describe("exitRequest", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should throw BadRequestException if entry log is not found", async () => {
      const mockAccessPointRepo = {
        findGuestLogById: jest.fn().mockResolvedValue(null),
        updateGuestLogExit: jest.fn(),
      } as unknown as AccessPointRepository;

      container = createTestContainer((c) => {
        c.registerInstance(AccessPointRepository, mockAccessPointRepo);
      });
      const service = container.resolve(AccessControlService);

      await expect(
        service.exitRequest({
          guestLogId: "log123",
          exitTime: new Date(),
          userId: "user1",
          checked: true,
        }),
      ).rejects.toThrow(BadRequestException);

      expect(mockAccessPointRepo.findGuestLogById).toHaveBeenCalledWith(
        "log123",
      );
      expect(mockAccessPointRepo.updateGuestLogExit).not.toHaveBeenCalled();
    });

    it("should update guest log exit and log audit", async () => {
      const dto = {
        guestLogId: "log123",
        exitTime: new Date(),
        userId: "user1",
        checked: true,
      };

      const entryLog = { id: "log123" } as GuestEntry;
      const updatedLog = {
        id: "log123",
        guestName: "John Doe",
        accessPoint: { propertyId: "prop1", name: "Main Gate" },
      } as UpdateGuestLogResponse;

      const mockAccessPointRepo = {
        findGuestLogById: jest.fn().mockResolvedValue(entryLog),
        updateGuestLogExit: jest.fn().mockResolvedValue(updatedLog),
      } as unknown as AccessPointRepository;

      container = createTestContainer((c) => {
        c.registerInstance(AccessPointRepository, mockAccessPointRepo);
      });
      const mockLogAudit = container.resolve(AuditLogService).logAudit;
      const service = container.resolve(AccessControlService);

      const result = await service.exitRequest(dto);

      expect(mockAccessPointRepo.findGuestLogById).toHaveBeenCalledWith(
        dto.guestLogId,
      );
      expect(mockAccessPointRepo.updateGuestLogExit).toHaveBeenCalledWith(
        dto.guestLogId,
        {
          exitTime: dto.exitTime,
        },
      );

      expect(mockLogAudit).toHaveBeenCalledWith({
        action: "update",
        model: "guestLog",
        userId: dto.userId,
        propertyId: updatedLog.accessPoint.propertyId,
        description: `${updatedLog.guestName} exit (${updatedLog.accessPoint.name})`,
        metadata: {
          checked: dto.checked,
        },
      });

      expect(result).toEqual(updatedLog);
    });
  });
});
