import { NotFoundException } from "@nestjs/common";
import { ComplianceReportService } from "../../../src/application/services/compliance-report.service";

describe("ComplianceReportService", () => {
  let service: ComplianceReportService;
  let complianceReportRepository: any;

  const mockReport = {
    id: "compliance-123",
    resourceId: "res-123",
    resourceName: "Sala 101",
    resourceType: "classroom",
    startDate: new Date("2026-01-01"),
    endDate: new Date("2026-01-31"),
    totalReservations: 100,
    checkedInReservations: 85,
    noShowReservations: 10,
    lateCheckIns: 15,
    earlyCheckOuts: 5,
    onTimeCheckIns: 70,
    complianceRate: 85,
    noShowRate: 10,
    averageCheckInDelayMinutes: 8,
    usersWithNoShow: [
      { userId: "user-1", noShowCount: 3 },
      { userId: "user-2", noShowCount: 2 },
    ],
    complianceByDayOfWeek: { monday: 90, tuesday: 80, friday: 75 },
    complianceByHour: { "08:00": 95, "10:00": 85, "14:00": 80 },
  };

  beforeEach(() => {
    complianceReportRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findMany: jest.fn(),
      findByResource: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    };

    service = new ComplianceReportService(complianceReportRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- RF-39: Cumplimiento de Reserva ---

  describe("generateComplianceReport", () => {
    it("Given valid compliance data, When generateComplianceReport is called, Then it should create the report", async () => {
      complianceReportRepository.create.mockResolvedValue(mockReport);

      const result = await service.generateComplianceReport({
        resourceId: "res-123",
        resourceName: "Sala 101",
        resourceType: "classroom",
        startDate: new Date("2026-01-01"),
        endDate: new Date("2026-01-31"),
        totalReservations: 100,
        checkedInReservations: 85,
        noShowReservations: 10,
        lateCheckIns: 15,
        earlyCheckOuts: 5,
        onTimeCheckIns: 70,
        complianceRate: 85,
        noShowRate: 10,
        averageCheckInDelayMinutes: 8,
        usersWithNoShow: [{ userId: "user-1", noShowCount: 3 }],
        complianceByDayOfWeek: { monday: 90 },
        complianceByHour: { "08:00": 95 },
      });

      expect(result).toBeDefined();
      expect(result.id).toBe("compliance-123");
      expect(complianceReportRepository.create).toHaveBeenCalled();
    });
  });

  describe("getComplianceReportById", () => {
    it("Given an existing report, When getComplianceReportById is called, Then it should return it", async () => {
      complianceReportRepository.findById.mockResolvedValue(mockReport);

      const result = await service.getComplianceReportById("compliance-123");

      expect(result).toBeDefined();
      expect(result.complianceRate).toBe(85);
    });

    it("Given a non-existent report, When getComplianceReportById is called, Then it should throw NotFoundException", async () => {
      complianceReportRepository.findById.mockResolvedValue(null);

      await expect(
        service.getComplianceReportById("non-existent")
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("getComplianceReports", () => {
    it("Given reports exist, When getComplianceReports is called, Then it should return paginated results", async () => {
      complianceReportRepository.findMany.mockResolvedValue({
        reports: [mockReport],
        meta: { total: 1, page: 1, limit: 10 },
      });

      const result = await service.getComplianceReports({ page: 1, limit: 10 });

      expect(result.reports).toHaveLength(1);
    });
  });

  describe("deleteComplianceReport", () => {
    it("Given an existing report, When deleteComplianceReport is called, Then it should delete", async () => {
      complianceReportRepository.findById.mockResolvedValue(mockReport);
      complianceReportRepository.delete.mockResolvedValue(true);

      const result = await service.deleteComplianceReport("compliance-123");

      expect(result).toBe(true);
    });
  });
});
