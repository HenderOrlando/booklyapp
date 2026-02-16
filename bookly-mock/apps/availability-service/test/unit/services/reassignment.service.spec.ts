import { NotFoundException } from "@nestjs/common";
import { ReassignmentService } from "../../../src/application/services/reassignment.service";

describe("ReassignmentService", () => {
  let service: ReassignmentService;
  let reservationRepository: any;
  let reassignmentHistoryRepository: any;
  let similarityService: any;
  let resourcesEventService: any;
  let eventBus: any;

  const mockReservation = {
    id: "rsv-123",
    resourceId: "res-123",
    userId: "user-123",
    startDate: new Date("2026-03-01T08:00:00"),
    endDate: new Date("2026-03-01T10:00:00"),
    purpose: "Clase",
    toString: () => "res-123",
  };

  beforeEach(() => {
    reservationRepository = {
      findById: jest.fn(),
      findConflicts: jest.fn().mockResolvedValue([]),
      update: jest.fn(),
    };

    reassignmentHistoryRepository = {
      create: jest.fn(),
      findByReservation: jest.fn().mockResolvedValue([]),
    };

    similarityService = {
      calculateSimilarity: jest.fn().mockReturnValue([]),
    };

    resourcesEventService = {
      getResourceById: jest.fn().mockResolvedValue({
        id: "res-123",
        name: "Sala 101",
        type: "classroom",
        capacity: 30,
      }),
      getResourcesByType: jest.fn().mockResolvedValue([]),
    };

    eventBus = {
      publish: jest.fn(),
    };

    service = new ReassignmentService(
      reservationRepository,
      reassignmentHistoryRepository,
      similarityService,
      resourcesEventService,
      eventBus
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- RF-15: Reasignación de reservas ---

  describe("requestReassignment", () => {
    it("Given an existing reservation, When requestReassignment is called, Then it should find alternatives", async () => {
      reservationRepository.findById.mockResolvedValue(mockReservation);

      const result = await service.requestReassignment(
        { reservationId: "rsv-123", reason: "Maintenance" },
        "admin-1"
      );

      expect(result).toBeDefined();
      expect(reservationRepository.findById).toHaveBeenCalledWith("rsv-123");
    });

    it("Given a non-existent reservation, When requestReassignment is called, Then it should throw NotFoundException", async () => {
      reservationRepository.findById.mockResolvedValue(null);

      await expect(
        service.requestReassignment(
          { reservationId: "non-existent", reason: "Test" },
          "admin-1"
        )
      ).rejects.toThrow(NotFoundException);
    });
  });
});
