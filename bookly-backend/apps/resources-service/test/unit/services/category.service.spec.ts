import { CategoryType } from "@libs/common/enums";
import { ConflictException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { CategoryService } from "../../../src/application/services/category.service";

describe("CategoryService", () => {
  let service: CategoryService;
  let categoryRepository: any;

  const mockCategory = {
    id: "cat-123",
    code: "AULAS",
    name: "Aulas",
    description: "Categoría de aulas",
    type: CategoryType.SPACE,
    isActive: true,
    color: "#3B82F6",
    icon: "school",
    metadata: {},
  };

  beforeEach(async () => {
    categoryRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      existsByCode: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
    };

    service = new CategoryService(categoryRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- RF-02: Asociar Recursos a Categoría ---

  describe("createCategory", () => {
    it("Given valid category data, When createCategory is called, Then it should create and return", async () => {
      categoryRepository.existsByCode.mockResolvedValue(false);
      categoryRepository.create.mockResolvedValue(mockCategory);

      const result = await service.createCategory({
        code: "AULAS",
        name: "Aulas",
        description: "Categoría de aulas",
        type: CategoryType.SPACE,
      });

      expect(result).toBeDefined();
      expect(result.code).toBe("AULAS");
      expect(categoryRepository.create).toHaveBeenCalled();
    });

    it("Given a duplicate code, When createCategory is called, Then it should throw ConflictException", async () => {
      categoryRepository.existsByCode.mockResolvedValue(true);

      await expect(
        service.createCategory({
          code: "AULAS",
          name: "Duplicate",
          description: "Test",
          type: CategoryType.SPACE,
        })
      ).rejects.toThrow(ConflictException);
    });
  });

  describe("getCategoryById", () => {
    it("Given an existing category, When getCategoryById is called, Then it should return it", async () => {
      categoryRepository.findById.mockResolvedValue(mockCategory);

      const result = await service.getCategoryById("cat-123");

      expect(result).toBeDefined();
      expect(result.id).toBe("cat-123");
    });

    it("Given a non-existent category, When getCategoryById is called, Then it should throw NotFoundException", async () => {
      categoryRepository.findById.mockResolvedValue(null);

      await expect(service.getCategoryById("non-existent")).rejects.toThrow(
        NotFoundException
      );
    });
  });
});
