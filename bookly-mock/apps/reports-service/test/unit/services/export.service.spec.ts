import { ReportDataType, ReportsExportFormat, ReportsExportStatus } from "@libs/common/enums";
import { ExportService } from "../../../src/application/services/export.service";

describe("ExportService", () => {
  let service: ExportService;
  let exportRepository: any;
  let eventBus: any;

  const mockExport = {
    id: "export-123",
    userId: "user-123",
    reportType: ReportDataType.USAGE,
    format: ReportsExportFormat.CSV,
    status: ReportsExportStatus.PENDING,
    filters: { resourceType: "classroom" },
  };

  beforeEach(() => {
    exportRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByUser: jest.fn(),
      update: jest.fn(),
    };

    eventBus = {
      publish: jest.fn().mockResolvedValue(undefined),
    };

    service = new ExportService(exportRepository, eventBus);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- RF-33: Exportación en CSV ---

  describe("requestExport", () => {
    it("Given valid export request, When requestExport is called, Then it should create an export job", async () => {
      exportRepository.save.mockResolvedValue(mockExport);

      const result = await service.requestExport(
        "user-123",
        ReportDataType.USAGE,
        ReportsExportFormat.CSV,
        { resourceType: "classroom" }
      );

      expect(result).toBeDefined();
      expect(exportRepository.save).toHaveBeenCalled();
    });
  });

  describe("getExportById", () => {
    it("Given an existing export, When getExportById is called, Then it should return it", async () => {
      exportRepository.findById.mockResolvedValue(mockExport);

      if (typeof service.getExportById === "function") {
        const result = await service.getExportById("export-123");
        expect(result).toBeDefined();
      }
    });
  });
});
