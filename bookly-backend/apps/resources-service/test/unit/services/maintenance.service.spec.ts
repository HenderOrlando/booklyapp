import {
  MaintenanceStatus,
  MaintenanceType,
  ResourceStatus,
} from "@libs/common/enums";
import { NotFoundException } from "@nestjs/common";
import { MaintenanceService } from "../../../src/application/services/maintenance.service";

describe("MaintenanceService", () => {
  let service: MaintenanceService;
  let maintenanceRepository: any;
  let resourceRepository: any;
  let eventBusService: any;

  const mockMaintenance = {
    id: "maint-123",
    resourceId: "res-123",
    type: MaintenanceType.PREVENTIVE,
    title: "Mantenimiento preventivo",
    description: "Revisión general",
    scheduledStartDate: new Date("2026-03-01"),
    scheduledEndDate: new Date("2026-03-02"),
    status: MaintenanceStatus.SCHEDULED,
    affectsAvailability: true,
  };

  beforeEach(() => {
    maintenanceRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    resourceRepository = {
      findById: jest.fn(),
      update: jest.fn(),
    };

    eventBusService = {
      publish: jest.fn().mockResolvedValue(undefined),
    };

    service = new MaintenanceService(
      maintenanceRepository,
      resourceRepository,
      eventBusService
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- RF-06: Mantenimiento de Recursos ---

  describe("scheduleMaintenance", () => {
    it("Given valid maintenance data, When scheduleMaintenance is called, Then it should create maintenance", async () => {
      maintenanceRepository.create.mockResolvedValue(mockMaintenance);

      const result = await service.scheduleMaintenance({
        resourceId: "res-123",
        type: MaintenanceType.PREVENTIVE,
        title: "Mantenimiento preventivo",
        description: "Revisión general",
        scheduledStartDate: new Date("2026-03-01"),
        scheduledEndDate: new Date("2026-03-02"),
      });

      expect(result).toBeDefined();
      expect(result.status).toBe(MaintenanceStatus.SCHEDULED);
      expect(maintenanceRepository.create).toHaveBeenCalled();
    });
  });

  describe("getMaintenanceById", () => {
    it("Given an existing maintenance, When getMaintenanceById is called, Then it should return it", async () => {
      maintenanceRepository.findById.mockResolvedValue(mockMaintenance);

      const result = await service.getMaintenanceById("maint-123");

      expect(result).toBeDefined();
      expect(result.id).toBe("maint-123");
    });

    it("Given a non-existent maintenance, When getMaintenanceById is called, Then it should throw NotFoundException", async () => {
      maintenanceRepository.findById.mockResolvedValue(null);

      await expect(
        service.getMaintenanceById("non-existent")
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("startMaintenance", () => {
    it("Given a scheduled maintenance, When startMaintenance is called, Then status should change to IN_PROGRESS", async () => {
      const scheduled = { ...mockMaintenance, status: MaintenanceStatus.SCHEDULED };
      maintenanceRepository.findById.mockResolvedValue(scheduled);
      maintenanceRepository.update.mockResolvedValue({
        ...scheduled,
        status: MaintenanceStatus.IN_PROGRESS,
      });
      resourceRepository.findById.mockResolvedValue({ id: "res-123", status: ResourceStatus.AVAILABLE });
      resourceRepository.update.mockResolvedValue({});

      const result = await service.startMaintenance("maint-123");

      expect(result).toBeDefined();
      expect(maintenanceRepository.update).toHaveBeenCalled();
    });
  });

  describe("completeMaintenance", () => {
    it("Given an in-progress maintenance, When completeMaintenance is called, Then status should change to COMPLETED", async () => {
      const inProgress = { ...mockMaintenance, status: MaintenanceStatus.IN_PROGRESS };
      maintenanceRepository.findById.mockResolvedValue(inProgress);
      maintenanceRepository.update.mockResolvedValue({
        ...inProgress,
        status: MaintenanceStatus.COMPLETED,
      });
      resourceRepository.findById.mockResolvedValue({ id: "res-123", status: ResourceStatus.MAINTENANCE });
      resourceRepository.update.mockResolvedValue({});

      const result = await service.completeMaintenance("maint-123", {
        notes: "Completado sin novedad",
      });

      expect(result).toBeDefined();
      expect(maintenanceRepository.update).toHaveBeenCalled();
    });
  });

  describe("cancelMaintenance", () => {
    it("Given a scheduled maintenance, When cancelMaintenance is called, Then status should change to CANCELLED", async () => {
      maintenanceRepository.findById.mockResolvedValue(mockMaintenance);
      maintenanceRepository.update.mockResolvedValue({
        ...mockMaintenance,
        status: MaintenanceStatus.CANCELLED,
      });

      const result = await service.cancelMaintenance("maint-123", "No longer needed");

      expect(result).toBeDefined();
      expect(maintenanceRepository.update).toHaveBeenCalled();
    });
  });
});
