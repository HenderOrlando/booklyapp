import { ReservationStatus } from "@libs/common/enums";
import { NotFoundException } from "@nestjs/common";
import { ReservationService } from "../../../src/application/services/reservation.service";

describe("ReservationService", () => {
  let service: ReservationService;
  let reservationRepository: any;

  const mockReservation = {
    id: "rsv-123",
    resourceId: "res-123",
    userId: "user-123",
    startDate: new Date("2026-03-01T08:00:00"),
    endDate: new Date("2026-03-01T10:00:00"),
    purpose: "Clase de matemáticas",
    status: ReservationStatus.PENDING,
    isRecurring: false,
  };

  beforeEach(() => {
    reservationRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findConflicts: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByResource: jest.fn(),
      findByUser: jest.fn(),
    };

    service = new ReservationService(reservationRepository, undefined, undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- RF-07/RF-09: Configurar disponibilidad / Búsqueda avanzada ---

  describe("createReservation", () => {
    it("Given no conflicts, When createReservation is called, Then it should create the reservation", async () => {
      reservationRepository.findConflicts.mockResolvedValue([]);
      reservationRepository.create.mockResolvedValue(mockReservation);

      const result = await service.createReservation({
        resourceId: "res-123",
        userId: "user-123",
        startDate: new Date("2026-03-01T08:00:00"),
        endDate: new Date("2026-03-01T10:00:00"),
        purpose: "Clase de matemáticas",
      });

      expect(result).toBeDefined();
      expect(reservationRepository.findConflicts).toHaveBeenCalledWith(
        "res-123",
        expect.any(Date),
        expect.any(Date)
      );
      expect(reservationRepository.create).toHaveBeenCalled();
    });

    it("Given conflicting reservations exist, When createReservation is called, Then it should throw error", async () => {
      reservationRepository.findConflicts.mockResolvedValue([mockReservation]);

      await expect(
        service.createReservation({
          resourceId: "res-123",
          userId: "user-123",
          startDate: new Date("2026-03-01T08:00:00"),
          endDate: new Date("2026-03-01T10:00:00"),
          purpose: "Conflicting",
        })
      ).rejects.toThrow();
    });
  });

  describe("getReservationById", () => {
    it("Given an existing reservation, When getReservationById is called, Then it should return it", async () => {
      reservationRepository.findById.mockResolvedValue(mockReservation);

      const result = await service.getReservationById("rsv-123");

      expect(result).toBeDefined();
      expect(result.id).toBe("rsv-123");
    });

    it("Given a non-existent reservation, When getReservationById is called, Then it should throw NotFoundException", async () => {
      reservationRepository.findById.mockResolvedValue(null);

      await expect(
        service.getReservationById("non-existent")
      ).rejects.toThrow(NotFoundException);
    });
  });

  // --- RF-18: Gestión de modificaciones/cancelaciones ---

  describe("cancelReservation", () => {
    it("Given a pending reservation, When cancelReservation is called, Then status should change to CANCELLED", async () => {
      reservationRepository.findById.mockResolvedValue(mockReservation);
      reservationRepository.update.mockResolvedValue({
        ...mockReservation,
        status: ReservationStatus.CANCELLED,
      });

      const result = await service.cancelReservation("rsv-123", "user-123", "No longer needed");

      expect(result).toBeDefined();
      expect(reservationRepository.update).toHaveBeenCalled();
    });
  });

  describe("updateReservation", () => {
    it("Given a pending reservation, When updateReservation is called, Then it should update", async () => {
      reservationRepository.findById.mockResolvedValue(mockReservation);
      reservationRepository.findConflicts.mockResolvedValue([]);
      reservationRepository.update.mockResolvedValue({
        ...mockReservation,
        purpose: "Updated purpose",
      });

      const result = await service.updateReservation("rsv-123", {
        purpose: "Updated purpose",
      });

      expect(result).toBeDefined();
      expect(reservationRepository.update).toHaveBeenCalled();
    });
  });
});
