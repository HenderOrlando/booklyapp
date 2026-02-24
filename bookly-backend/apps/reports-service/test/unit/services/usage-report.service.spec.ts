import { NotFoundException } from "@nestjs/common";
import { UsageReportService } from "../../../src/application/services/usage-report.service";

describe("UsageReportService", () => {
  let service: UsageReportService;
  let usageReportRepository: any;

  const mockReport = {
    id: "report-123",
    resourceId: "res-123",
    resourceName: "Sala 101",
    resourceType: "classroom",
    startDate: new Date("2026-01-01"),
    endDate: new Date("2026-01-31"),
    totalReservations: 50,
    confirmedReservations: 40,
    cancelledReservations: 5,
    noShowReservations: 5,
    totalHoursReserved: 200,
    totalHoursUsed: 180,
    occupancyRate: 0.75,
    averageSessionDuration: 2,
    peakUsageHours: ["08:00", "10:00", "14:00"],
    programsBreakdown: { "Ing. Sistemas": 20, "Ing. Civil": 15 },
  };

  beforeEach(() => {
    usageReportRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findMany: jest.fn(),
      findByResource: jest.fn(),
      findByResourceType: jest.fn(),
      delete: jest.fn(),
    };

    service = new UsageReportService(usageReportRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- RF-31: Reporte de uso por recurso/programa/período ---

  describe("generateUsageReport", () => {
    it("Given valid report data, When generateUsageReport is called, Then it should create and return the report", async () => {
      usageReportRepository.create.mockResolvedValue(mockReport);

      const result = await service.generateUsageReport({
        resourceId: "res-123",
        resourceName: "Sala 101",
        resourceType: "classroom",
        startDate: new Date("2026-01-01"),
        endDate: new Date("2026-01-31"),
        totalReservations: 50,
        confirmedReservations: 40,
        cancelledReservations: 5,
        noShowReservations: 5,
        totalHoursReserved: 200,
        totalHoursUsed: 180,
        occupancyRate: 0.75,
        averageSessionDuration: 2,
        peakUsageHours: ["08:00", "10:00"],
        programsBreakdown: { "Ing. Sistemas": 20 },
      });

      expect(result).toBeDefined();
      expect(result.id).toBe("report-123");
      expect(usageReportRepository.create).toHaveBeenCalled();
    });
  });

  describe("getUsageReportById", () => {
    it("Given an existing report, When getUsageReportById is called, Then it should return the report", async () => {
      usageReportRepository.findById.mockResolvedValue(mockReport);

      const result = await service.getUsageReportById("report-123");

      expect(result).toBeDefined();
      expect(result.id).toBe("report-123");
    });

    it("Given a non-existent report, When getUsageReportById is called, Then it should throw NotFoundException", async () => {
      usageReportRepository.findById.mockResolvedValue(null);

      await expect(
        service.getUsageReportById("non-existent")
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("getUsageReports (with filters)", () => {
    it("Given reports exist, When getUsageReports is called with filters, Then it should return filtered results", async () => {
      usageReportRepository.findMany.mockResolvedValue({
        reports: [mockReport],
        meta: { total: 1, page: 1, limit: 10 },
      });

      const result = await service.getUsageReports(
        { page: 1, limit: 10 },
        { resourceType: "classroom" }
      );

      expect(result.reports).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe("deleteUsageReport", () => {
    it("Given an existing report, When deleteUsageReport is called, Then it should delete", async () => {
      usageReportRepository.findById.mockResolvedValue(mockReport);
      usageReportRepository.delete.mockResolvedValue(true);

      const result = await service.deleteUsageReport("report-123");

      expect(result).toBe(true);
      expect(usageReportRepository.delete).toHaveBeenCalledWith("report-123");
    });
  });
});
