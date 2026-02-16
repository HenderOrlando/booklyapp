import { ResourceStatus, ResourceType } from "@libs/common/enums";
import { ConflictException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { ResourceService } from "../../../src/application/services/resource.service";
import { AttributeValidationService } from "../../../src/application/services/attribute-validation.service";

describe("ResourceService", () => {
  let service: ResourceService;
  let resourceRepository: any;
  let eventBusService: any;
  let attributeValidationService: any;

  const mockResource = {
    id: "res-123",
    code: "SALA-101",
    name: "Sala 101",
    description: "Sala de clases",
    type: ResourceType.CLASSROOM,
    categoryId: "cat-1",
    capacity: 30,
    location: "Edificio A",
    status: ResourceStatus.AVAILABLE,
    isActive: true,
    attributes: {},
    programIds: [],
    toObject: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    resourceRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByCode: jest.fn(),
      existsByCode: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    };

    eventBusService = {
      publish: jest.fn().mockResolvedValue(undefined),
    };

    attributeValidationService = {
      validateOrThrow: jest.fn(),
      validate: jest.fn().mockReturnValue({ isValid: true, errors: [] }),
    };

    service = new ResourceService(
      resourceRepository,
      eventBusService,
      attributeValidationService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- RF-01: Crear, Editar y Eliminar Recursos ---

  describe("createResource", () => {
    it("Given valid resource data, When createResource is called, Then it should create and return the resource", async () => {
      resourceRepository.existsByCode.mockResolvedValue(false);
      resourceRepository.create.mockResolvedValue(mockResource);

      const result = await service.createResource({
        code: "SALA-101",
        name: "Sala 101",
        description: "Sala de clases",
        type: ResourceType.CLASSROOM,
        categoryId: "cat-1",
        capacity: 30,
        location: "Edificio A",
      });

      expect(result).toBeDefined();
      expect(resourceRepository.existsByCode).toHaveBeenCalledWith("SALA-101");
      expect(resourceRepository.create).toHaveBeenCalled();
    });

    it("Given a duplicate code, When createResource is called, Then it should throw ConflictException", async () => {
      resourceRepository.existsByCode.mockResolvedValue(true);

      await expect(
        service.createResource({
          code: "SALA-101",
          name: "Duplicate",
          description: "Test",
          type: ResourceType.CLASSROOM,
          categoryId: "cat-1",
          capacity: 30,
          location: "Edificio A",
        })
      ).rejects.toThrow(ConflictException);
    });

    it("Given attributes and type, When createResource is called, Then it should validate attributes", async () => {
      resourceRepository.existsByCode.mockResolvedValue(false);
      resourceRepository.create.mockResolvedValue(mockResource);

      await service.createResource({
        code: "SALA-102",
        name: "Sala 102",
        description: "Test",
        type: ResourceType.CLASSROOM,
        categoryId: "cat-1",
        capacity: 30,
        location: "Edificio A",
        attributes: { capacity: 30 },
      });

      expect(attributeValidationService.validateOrThrow).toHaveBeenCalledWith(
        ResourceType.CLASSROOM,
        { capacity: 30 }
      );
    });
  });

  describe("getResourceById", () => {
    it("Given an existing resource ID, When getResourceById is called, Then it should return the resource", async () => {
      resourceRepository.findById.mockResolvedValue(mockResource);

      const result = await service.getResourceById("res-123");

      expect(result).toBeDefined();
      expect(result.id).toBe("res-123");
    });

    it("Given a non-existent resource ID, When getResourceById is called, Then it should throw NotFoundException", async () => {
      resourceRepository.findById.mockResolvedValue(null);

      await expect(service.getResourceById("non-existent")).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe("updateResource", () => {
    it("Given an existing resource, When updateResource is called with valid data, Then it should update", async () => {
      resourceRepository.findById.mockResolvedValue(mockResource);
      resourceRepository.update.mockResolvedValue({ ...mockResource, name: "Updated" });

      const result = await service.updateResource("res-123", { name: "Updated" });

      expect(result).toBeDefined();
      expect(resourceRepository.update).toHaveBeenCalled();
    });

    it("Given a non-existent resource, When updateResource is called, Then it should throw NotFoundException", async () => {
      resourceRepository.findById.mockResolvedValue(null);

      await expect(
        service.updateResource("non-existent", { name: "Test" })
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("deleteResource (soft delete)", () => {
    it("Given an existing resource, When deleteResource is called, Then it should soft-delete", async () => {
      resourceRepository.findById.mockResolvedValue(mockResource);
      resourceRepository.update.mockResolvedValue({ ...mockResource, isActive: false });

      const result = await service.deleteResource("res-123", "admin-1");

      expect(result).toBeDefined();
      expect(resourceRepository.update).toHaveBeenCalled();
    });

    it("Given a non-existent resource, When deleteResource is called, Then it should throw NotFoundException", async () => {
      resourceRepository.findById.mockResolvedValue(null);

      await expect(
        service.deleteResource("non-existent", "admin-1")
      ).rejects.toThrow(NotFoundException);
    });
  });
});
