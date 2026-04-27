import "reflect-metadata";
import { Property } from "../../../prisma/generated/prisma";
import PropertyRepository from "../../repository/property.repository";
import UserRepository from "../../repository/user.repository";
import {
  AddPropertyManagerDto,
  CreatePropertyDto,
  ResidentFilter,
  ResidentWhere,
} from "../../types/property";
import {
  ConflictException,
  NotFoundException,
} from "../../utils/exceptions/customException";
import * as propertyConstants from "../../utils/constants/property";
import { Request, Response } from "express";
import { createTestContainer } from "../utils/test-container";
import PropertyService from "../../services/property.service";

const mockProperty: Property = {
  id: "1",
  name: "Test Property",
  address: "123 Main St",
  authorId: "user1",
} as Property;

describe("PropertyService", () => {
  let container: ReturnType<typeof createTestContainer>;

  const mockReq = { user: { id: "admin" } } as unknown as Request;
  beforeAll(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    container.clearInstances();
  });

  describe("getAllProperties", () => {
    it("should return all properties", async () => {
      const mockPropertyRepo = {
        findAllProperties: jest.fn().mockResolvedValue([mockProperty]),
      } as unknown as PropertyRepository;

      container = createTestContainer((c) => {
        c.registerInstance(PropertyRepository, mockPropertyRepo);
      });

      const service = container.resolve(PropertyService);

      const result = await service.getAllProperties(
        undefined, // paginated
        "", // page
        "", // size
        "", // sortBy
        "", // order
        "", // search
      );
      expect(result).toEqual([mockProperty]);
      expect(mockPropertyRepo.findAllProperties).toHaveBeenCalled();
    });
  });

  describe("createProperty", () => {
    const dto: CreatePropertyDto = {
      name: "Test Property",
      address: "123 Main St",
    } as CreatePropertyDto;

    it("should create a property if it does not exist", async () => {
      const mockPropertyRepo = {
        findPropertyByNameAuthorIdAndAddress: jest.fn().mockResolvedValue(null),
        createProperty: jest.fn().mockResolvedValue(mockProperty),
      } as unknown as PropertyRepository;

      container = createTestContainer((c) => {
        c.registerInstance(PropertyRepository, mockPropertyRepo);
      });

      const service = container.resolve(PropertyService);

      const result = await service.createProperty(mockReq, dto, "user1");
      expect(result).toEqual(mockProperty);
      expect(mockPropertyRepo.createProperty).toHaveBeenCalledWith(
        dto,
        "user1",
      );
    });

    it("should throw ConflictException if property exists", async () => {
      const mockPropertyRepo = {
        findPropertyByNameAuthorIdAndAddress: jest
          .fn()
          .mockResolvedValue(mockProperty),
        createProperty: jest.fn().mockResolvedValue(mockProperty),
      } as unknown as PropertyRepository;

      container = createTestContainer((c) => {
        c.registerInstance(PropertyRepository, mockPropertyRepo);
      });

      const service = container.resolve(PropertyService);

      await expect(
        service.createProperty(mockReq, dto, "user1"),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe("updateProperty", () => {
    const updateDto = { name: "Updated Name" };

    it("should update property if it exists", async () => {
      const mockPropertyRepo = {
        findById: jest.fn().mockResolvedValue(mockProperty),
        updatePropertyById: jest
          .fn()
          .mockResolvedValue({ ...mockProperty, ...updateDto }),
        getPropertyResidentsIds: jest.fn(),
      } as unknown as PropertyRepository;

      container = createTestContainer((c) => {
        c.registerInstance(PropertyRepository, mockPropertyRepo);
      });

      const service = container.resolve(PropertyService);

      const result = await service.updateProperty(mockReq, updateDto, "prop1");
      expect(result).toEqual({ ...mockProperty, ...updateDto });
      expect(mockPropertyRepo.updatePropertyById).toHaveBeenCalledWith(
        "prop1",
        updateDto,
      );
    });

    it("should throw NotFoundException if property does not exist", async () => {
      const mockPropertyRepo = {
        findById: jest.fn().mockResolvedValue(null),
      } as unknown as PropertyRepository;

      container = createTestContainer((c) => {
        c.registerInstance(PropertyRepository, mockPropertyRepo);
      });

      const service = container.resolve(PropertyService);

      await expect(
        service.updateProperty(mockReq, updateDto, "prop1"),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("deleteProperty", () => {
    it("should delete property if it exists", async () => {
      const mockPropertyRepo = {
        findById: jest.fn().mockResolvedValue(mockProperty),
        deleteProperty: jest.fn().mockResolvedValue(undefined),
      } as unknown as PropertyRepository;

      container = createTestContainer((c) => {
        c.registerInstance(PropertyRepository, mockPropertyRepo);
      });

      const service = container.resolve(PropertyService);

      await expect(
        service.deleteProperty(mockReq, "prop1"),
      ).resolves.toBeUndefined();
      expect(mockPropertyRepo.deleteProperty).toHaveBeenCalledWith("prop1");
    });

    it("should throw ConflictException if property does not exist", async () => {
      const mockPropertyRepo = {
        findById: jest.fn().mockResolvedValue(null),
        deleteProperty: jest.fn().mockResolvedValue(undefined),
      } as unknown as PropertyRepository;

      container = createTestContainer((c) => {
        c.registerInstance(PropertyRepository, mockPropertyRepo);
      });

      const service = container.resolve(PropertyService);

      await expect(service.deleteProperty(mockReq, "prop1")).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe("addPropertyManager", () => {
    const dto: AddPropertyManagerDto = {
      email: "manager@example.com",
      propertyId: "prop1",
    };

    const mockManager = {
      id: "manager1",
      email: "manager@example.com",
      role: "manager",
    };

    it("should add property manager if all checks pass", async () => {
      const mockPropertyRepo = {
        findById: jest.fn().mockResolvedValue(mockProperty),
        addPropertyManager: jest.fn().mockResolvedValue(mockProperty),
      } as unknown as PropertyRepository;

      const mockUserRepo = {
        findByEmail: jest.fn().mockResolvedValue(mockManager),
      } as unknown as UserRepository;

      container = createTestContainer((c) => {
        c.registerInstance(PropertyRepository, mockPropertyRepo);
        c.registerInstance(UserRepository, mockUserRepo);
      });

      const service = container.resolve(PropertyService);

      const result = await service.addPropertyManager(dto);
      expect(result).toEqual(mockProperty);
      expect(mockPropertyRepo.addPropertyManager).toHaveBeenCalledWith(
        "prop1",
        "manager1",
      );
    });

    it("should throw NotFoundException if manager does not exist", async () => {
      const mockUserRepo = {
        findByEmail: jest.fn().mockResolvedValue(null),
      } as unknown as UserRepository;

      container = createTestContainer((c) => {
        c.registerInstance(UserRepository, mockUserRepo);
      });

      const service = container.resolve(PropertyService);

      await expect(service.addPropertyManager(dto)).rejects.toThrow(
        new NotFoundException("Manager not found"),
      );
    });

    it("should throw NotFoundException if property does not exist", async () => {
      const mockPropertyRepo = {
        findById: jest.fn().mockResolvedValue(null),
        addPropertyManager: jest.fn().mockResolvedValue(mockProperty),
      } as unknown as PropertyRepository;

      const mockUserRepo = {
        findByEmail: jest.fn().mockResolvedValue(mockManager),
      } as unknown as UserRepository;

      container = createTestContainer((c) => {
        c.registerInstance(PropertyRepository, mockPropertyRepo);
        c.registerInstance(UserRepository, mockUserRepo);
      });

      const service = container.resolve(PropertyService);

      await expect(service.addPropertyManager(dto)).rejects.toThrow(
        new NotFoundException("Facility not found"),
      );
    });

    it("should throw ConflictException if property manager already exists", async () => {
      const newMockProperty = {
        ...mockProperty,
        managerId: "manager2",
      };

      const mockPropertyRepo = {
        findById: jest.fn().mockResolvedValue(newMockProperty),
        addPropertyManager: jest.fn().mockResolvedValue(mockProperty),
      } as unknown as PropertyRepository;

      const mockUserRepo = {
        findByEmail: jest.fn().mockResolvedValue(mockManager),
      } as unknown as UserRepository;

      container = createTestContainer((c) => {
        c.registerInstance(PropertyRepository, mockPropertyRepo);
        c.registerInstance(UserRepository, mockUserRepo);
      });

      const service = container.resolve(PropertyService);

      await expect(service.addPropertyManager(dto)).rejects.toThrow(
        new ConflictException(
          "Facility manager already exist for this property",
        ),
      );
    });

    it("should throw NotFoundException if user is not a manager", async () => {
      const notManager = { ...mockManager, role: "resident" };

      const mockUserRepo = {
        findByEmail: jest.fn().mockResolvedValue(notManager),
      } as unknown as UserRepository;

      container = createTestContainer((c) => {
        c.registerInstance(UserRepository, mockUserRepo);
      });

      const service = container.resolve(PropertyService);

      await expect(service.addPropertyManager(dto)).rejects.toThrow(
        new NotFoundException("This user is not a manager"),
      );
    });
  });

  describe("getPropertyOverview", () => {
    it("should return property overview if property exists", async () => {
      // Mock getMetrics
      const metrics = {
        totalUnits: 2,
        totalMeters: 3,
        totalOccupiedUnits: 2,
        totalActiveMeters: 2,
        totalActiveUsers: 1,
      };
      const mockPropertyRepo = {
        findById: jest.fn().mockResolvedValue(mockProperty),
      } as unknown as PropertyRepository;

      container = createTestContainer((c) => {
        c.registerInstance(PropertyRepository, mockPropertyRepo);
      });

      const service = container.resolve(PropertyService);

      service.getMetrics = jest.fn().mockResolvedValue(metrics);

      const result = await service.getPropertyOverview("1");
      expect(result).toEqual({ ...mockProperty, ...metrics });
      expect(mockPropertyRepo.findById).toHaveBeenCalledWith("1");
      expect(service.getMetrics).toHaveBeenCalledWith("1");
    });

    it("should throw NotFoundException if property does not exist", async () => {
      const mockPropertyRepo = {
        findById: jest.fn().mockResolvedValue(null),
      } as unknown as PropertyRepository;

      container = createTestContainer((c) => {
        c.registerInstance(PropertyRepository, mockPropertyRepo);
      });

      const service = container.resolve(PropertyService);

      await expect(service.getPropertyOverview("1")).rejects.toThrow(
        new NotFoundException("Property not found"),
      );
    });
  });

  describe("getPropertyOverviewByManagerId", () => {
    it("should return property overview by manager id", async () => {
      const mockPropertyRepo = {
        findPropertyByManagerId: jest.fn().mockResolvedValue(mockProperty),
      } as unknown as PropertyRepository;

      container = createTestContainer((c) => {
        c.registerInstance(PropertyRepository, mockPropertyRepo);
      });

      const service = container.resolve(PropertyService);

      service.getMetrics = jest.fn().mockResolvedValue({ totalUnits: 1 });

      const result = await service.getPropertyOverviewByManagerId("manager1");
      expect(result).toEqual({ ...mockProperty, totalUnits: 1 });
      expect(mockPropertyRepo.findPropertyByManagerId).toHaveBeenCalledWith(
        "manager1",
      );
      expect(service.getMetrics).toHaveBeenCalledWith("1");
    });

    it("should throw BadRequestException if property not found", async () => {
      const mockPropertyRepo = {
        findPropertyByManagerId: jest.fn().mockResolvedValue(null),
      } as unknown as PropertyRepository;

      container = createTestContainer((c) => {
        c.registerInstance(PropertyRepository, mockPropertyRepo);
      });

      const service = container.resolve(PropertyService);

      await expect(
        service.getPropertyOverviewByManagerId("manager1"),
      ).rejects.toThrow("Cannot get property overview");
    });
  });

  describe("getPropertyResidents", () => {
    const mockResidents = {
      houses: [
        { id: "house1", name: "House 1" },
        { id: "house2", name: "House 2" },
      ],
      total: 2,
    };

    const filter = {
      propertyId: "1",
    } as ResidentFilter;

    const where = {} as ResidentWhere;

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should return residents with metadata if property exists", async () => {
      const mockPropertyRepo = {
        findById: jest.fn().mockResolvedValue(mockProperty),
        getPropertyResidents: jest.fn().mockResolvedValue(mockResidents),
      } as unknown as PropertyRepository;

      container = createTestContainer((c) => {
        c.registerInstance(PropertyRepository, mockPropertyRepo);
      });

      const service = container.resolve(PropertyService);

      jest
        .spyOn(propertyConstants, "residentWhere")
        .mockImplementation(() => where);
      jest
        .spyOn(propertyConstants, "residentFilter")
        .mockImplementation(() => filter);

      const mockRes = {} as Response;
      const result = await service.getPropertyResidents(
        mockRes,
        "1",
        "1",
        "10",
        "createdAt",
        "asc",
        "",
        "",
      );
      expect(result).toEqual({
        data: mockResidents.houses,
        metadata: {
          total: 2,
          page: 1,
          size: 10,
        },
      });
      expect(mockPropertyRepo.getPropertyResidents).toHaveBeenCalled();
    });

    it("should throw NotFoundException if property does not exist", async () => {
      const mockRes = {} as Response;

      const mockPropertyRepo = {
        findById: jest.fn().mockResolvedValue(null),
        getPropertyResidents: jest.fn().mockResolvedValue(mockResidents),
      } as unknown as PropertyRepository;

      container = createTestContainer((c) => {
        c.registerInstance(PropertyRepository, mockPropertyRepo);
      });

      const service = container.resolve(PropertyService);

      await expect(
        service.getPropertyResidents(
          mockRes,
          "1",
          "1",
          "10",
          "createdAt",
          "asc",
          "",
          "",
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw BadRequestException for invalid sort field", async () => {
      const mockRes = {} as Response;
      const mockPropertyRepo = {
        findById: jest.fn().mockResolvedValue(mockProperty),
      } as unknown as PropertyRepository;

      container = createTestContainer((c) => {
        c.registerInstance(PropertyRepository, mockPropertyRepo);
      });

      const service = container.resolve(PropertyService);

      await expect(
        service.getPropertyResidents(
          mockRes,
          "1",
          "1",
          "10",
          "invalidField",
          "asc",
          "",
          "",
        ),
      ).rejects.toThrow("Invalid sort field");
    });
  });
});
