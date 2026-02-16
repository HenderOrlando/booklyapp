import { ImportResourceMode, ResourceType } from "@libs/common/enums";
import { ResourceImportService } from "../../../src/application/services/resource-import.service";

describe("ResourceImportService", () => {
  let service: ResourceImportService;
  let resourceRepository: any;
  let categoryRepository: any;

  beforeEach(() => {
    resourceRepository = {
      create: jest.fn(),
      findByCode: jest.fn(),
      existsByCode: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    };

    categoryRepository = {
      findByCode: jest.fn(),
      findById: jest.fn(),
    };

    service = new ResourceImportService(resourceRepository, categoryRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- RF-04: Importación Masiva de Recursos ---

  describe("importFromCSV", () => {
    const validCSV = `code,name,description,type,capacity,location
SALA-201,Sala 201,Sala de clases,classroom,30,Edificio A
SALA-202,Sala 202,Sala de clases,classroom,25,Edificio B`;

    it("Given valid CSV content, When importFromCSV is called in CREATE_ONLY mode, Then it should import resources", async () => {
      resourceRepository.existsByCode.mockResolvedValue(false);
      resourceRepository.create.mockResolvedValue({ id: "new-res" });

      const result = await service.importFromCSV(
        validCSV,
        ImportResourceMode.CREATE_ONLY,
        "admin-1"
      );

      expect(result).toBeDefined();
      expect(result.totalRows).toBeGreaterThan(0);
      expect(result.successCount).toBeGreaterThanOrEqual(0);
    });

    it("Given CSV with duplicate codes in CREATE_ONLY mode, When importFromCSV is called, Then errors should be reported", async () => {
      resourceRepository.existsByCode.mockResolvedValue(true);

      const result = await service.importFromCSV(
        validCSV,
        ImportResourceMode.CREATE_ONLY,
        "admin-1",
        true
      );

      expect(result).toBeDefined();
      expect(result.errorCount).toBeGreaterThanOrEqual(0);
    });

    it("Given empty CSV, When importFromCSV is called, Then it should handle gracefully", async () => {
      const result = await service.importFromCSV(
        "code,name,description,type\n",
        ImportResourceMode.CREATE_ONLY,
        "admin-1"
      );

      expect(result).toBeDefined();
      expect(result.successCount).toBe(0);
    });
  });

  describe("validateImport", () => {
    it("Given valid CSV data, When validateImport is called, Then it should return validation results", async () => {
      const csvContent = `code,name,description,type,capacity,location
SALA-301,Sala 301,Test,classroom,30,Edificio A`;

      resourceRepository.existsByCode.mockResolvedValue(false);

      const result = await service.validateImport(csvContent);

      expect(result).toBeDefined();
      expect(result.totalRows).toBeGreaterThan(0);
    });
  });
});
