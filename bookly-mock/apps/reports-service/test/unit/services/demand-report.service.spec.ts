import { NotFoundException } from "@nestjs/common";
import { DemandReportService } from "../../../src/application/services/demand-report.service";

describe("DemandReportService", () => {
  let service: DemandReportService;
  let demandReportRepository: any;

  const mockReport = {
    id: "demand-123",
    resourceType: "classroom",
    programId: "prog-1",
    startDate: new Date("2026-01-01"),
    endDate: new Date("2026-01-31"),
    totalDenials: 15,
    reasonsBreakdown: { conflict: 10, maintenance: 5 },
    peakDemandPeriods: [{ date: new Date(), hour: 10, denialCount: 5 }],
    alternativeResourcesSuggested: { "Sala 202": 3 },
    waitingListEntries: 8,
    averageWaitTime: 24,
  };

  beforeEach(() => {
    demandReportRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
    };

    service = new DemandReportService(demandReportRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- RF-37: Reporte de demanda insatisfecha ---

  describe("generateDemandReport", () => {
    it("Given valid demand data, When generateDemandReport is called, Then it should create the report", async () => {
      demandReportRepository.create.mockResolvedValue(mockReport);

      const result = await service.generateDemandReport({
        resourceType: "classroom",
        programId: "prog-1",
        startDate: new Date("2026-01-01"),
        endDate: new Date("2026-01-31"),
        totalDenials: 15,
        reasonsBreakdown: { conflict: 10, maintenance: 5 },
        peakDemandPeriods: [{ date: new Date(), hour: 10, denialCount: 5 }],
        alternativeResourcesSuggested: { "Sala 202": 3 },
        waitingListEntries: 8,
        averageWaitTime: 24,
      });

      expect(result).toBeDefined();
      expect(result.id).toBe("demand-123");
      expect(demandReportRepository.create).toHaveBeenCalled();
    });
  });

  describe("getDemandReportById", () => {
    it("Given an existing report, When getDemandReportById is called, Then it should return it", async () => {
      demandReportRepository.findById.mockResolvedValue(mockReport);

      const result = await service.getDemandReportById("demand-123");

      expect(result).toBeDefined();
    });

    it("Given a non-existent report, When getDemandReportById is called, Then it should throw NotFoundException", async () => {
      demandReportRepository.findById.mockResolvedValue(null);

      await expect(
        service.getDemandReportById("non-existent")
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("getDemandReports", () => {
    it("Given reports exist, When getDemandReports is called, Then it should return paginated results", async () => {
      demandReportRepository.findMany.mockResolvedValue({
        reports: [mockReport],
        meta: { total: 1, page: 1, limit: 10 },
      });

      const result = await service.getDemandReports({ page: 1, limit: 10 });

      expect(result.reports).toHaveLength(1);
    });
  });

  describe("deleteDemandReport", () => {
    it("Given an existing report, When deleteDemandReport is called, Then it should delete", async () => {
      demandReportRepository.findById.mockResolvedValue(mockReport);
      demandReportRepository.delete.mockResolvedValue(true);

      const result = await service.deleteDemandReport("demand-123");

      expect(result).toBe(true);
    });
  });
});
