import { NotFoundException } from "@nestjs/common";
import { ConflictReportService } from "../../../src/application/services/conflict-report.service";

describe("ConflictReportService", () => {
  let service: ConflictReportService;
  let conflictReportRepository: any;

  const mockReport = {
    id: "conflict-123",
    resourceId: "res-123",
    resourceName: "Sala 101",
    resourceType: "classroom",
    startDate: new Date("2026-01-01"),
    endDate: new Date("2026-01-31"),
    totalConflicts: 12,
    resolvedConflicts: 10,
    unresolvedConflicts: 2,
    conflictTypesBreakdown: { overlap: 8, double_booking: 4 },
    peakConflictPeriods: [{ date: new Date(), hour: 10, conflictCount: 3 }],
    averageResolutionTimeMinutes: 30,
    resolutionMethodsBreakdown: { reassignment: 6, cancellation: 4 },
    affectedUsers: 8,
  };

  beforeEach(() => {
    conflictReportRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findMany: jest.fn(),
      findByResource: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    };

    service = new ConflictReportService(conflictReportRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- RF-38: Conflictos de Reserva ---

  describe("generateConflictReport", () => {
    it("Given valid conflict data, When generateConflictReport is called, Then it should create the report", async () => {
      conflictReportRepository.create.mockResolvedValue(mockReport);

      const result = await service.generateConflictReport({
        resourceId: "res-123",
        resourceName: "Sala 101",
        resourceType: "classroom",
        startDate: new Date("2026-01-01"),
        endDate: new Date("2026-01-31"),
        totalConflicts: 12,
        resolvedConflicts: 10,
        unresolvedConflicts: 2,
        conflictTypesBreakdown: { overlap: 8, double_booking: 4 },
        peakConflictPeriods: [{ date: new Date(), hour: 10, conflictCount: 3 }],
        averageResolutionTimeMinutes: 30,
        resolutionMethodsBreakdown: { reassignment: 6, cancellation: 4 },
        affectedUsers: 8,
      });

      expect(result).toBeDefined();
      expect(result.id).toBe("conflict-123");
      expect(conflictReportRepository.create).toHaveBeenCalled();
    });
  });

  describe("getConflictReportById", () => {
    it("Given an existing report, When getConflictReportById is called, Then it should return it", async () => {
      conflictReportRepository.findById.mockResolvedValue(mockReport);

      const result = await service.getConflictReportById("conflict-123");

      expect(result).toBeDefined();
      expect(result.id).toBe("conflict-123");
    });

    it("Given a non-existent report, When getConflictReportById is called, Then it should throw NotFoundException", async () => {
      conflictReportRepository.findById.mockResolvedValue(null);

      await expect(
        service.getConflictReportById("non-existent")
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("getConflictReports", () => {
    it("Given reports exist, When getConflictReports is called, Then it should return paginated results", async () => {
      conflictReportRepository.findMany.mockResolvedValue({
        reports: [mockReport],
        meta: { total: 1, page: 1, limit: 10 },
      });

      const result = await service.getConflictReports(
        { page: 1, limit: 10 },
        { resourceType: "classroom" }
      );

      expect(result.reports).toHaveLength(1);
    });
  });

  describe("deleteConflictReport", () => {
    it("Given an existing report, When deleteConflictReport is called, Then it should delete", async () => {
      conflictReportRepository.findById.mockResolvedValue(mockReport);
      conflictReportRepository.delete.mockResolvedValue(true);

      const result = await service.deleteConflictReport("conflict-123");

      expect(result).toBe(true);
    });
  });
});
