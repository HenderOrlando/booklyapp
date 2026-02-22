import { ReservationStatus } from "@libs/common/enums";
import { CancellationPenaltyService, PenaltyType } from "../../../src/application/services/cancellation-penalty.service";

describe("CancellationPenaltyService", () => {
  let service: CancellationPenaltyService;
  let reservationRepository: any;

  beforeEach(() => {
    reservationRepository = {
      findMany: jest.fn().mockResolvedValue({ reservations: [], meta: { total: 0 } }),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findConflicts: jest.fn(),
      getStats: jest.fn(),
    };

    service = new CancellationPenaltyService(reservationRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- RF-18: Cancelar/modificar con reglas ---

  describe("evaluateCancellation", () => {
    it("Given a cancellation with more than 24h before start, When evaluateCancellation is called, Then no penalty should be applied", async () => {
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 48);

      const result = await service.evaluateCancellation(
        "user-123",
        "rsv-123",
        futureDate,
      );

      expect(result.shouldApplyPenalty).toBe(false);
      expect(result.hoursBeforeStart).toBeGreaterThan(24);
    });

    it("Given a late cancellation with less than 24h before start, When evaluateCancellation is called and user has no history, Then no penalty should be applied yet", async () => {
      const soonDate = new Date();
      soonDate.setHours(soonDate.getHours() + 2);

      reservationRepository.findMany.mockResolvedValue({
        reservations: [],
        meta: { total: 0 },
      });

      const result = await service.evaluateCancellation(
        "user-123",
        "rsv-123",
        soonDate,
      );

      expect(result.shouldApplyPenalty).toBe(false);
      expect(result.hoursBeforeStart).toBeLessThan(24);
      expect(result.cancellationCount30Days).toBe(1);
    });

    it("Given a late cancellation and user has 1 prior late cancellation, When evaluateCancellation is called, Then a WARNING should be issued", async () => {
      const soonDate = new Date();
      soonDate.setHours(soonDate.getHours() + 2);

      const pastCancellation = {
        id: "rsv-old",
        status: ReservationStatus.CANCELLED,
        startDate: new Date(),
        updatedAt: new Date(Date.now() - 3600000),
      };

      reservationRepository.findMany.mockResolvedValue({
        reservations: [pastCancellation],
        meta: { total: 1 },
      });

      const result = await service.evaluateCancellation(
        "user-123",
        "rsv-123",
        soonDate,
      );

      expect(result.shouldApplyPenalty).toBe(true);
      expect(result.penaltyType).toBe(PenaltyType.WARNING);
      expect(result.cancellationCount30Days).toBe(2);
    });

    it("Given a late cancellation and user has 2 prior late cancellations, When evaluateCancellation is called, Then a TEMPORARY_RESTRICTION should be applied", async () => {
      const soonDate = new Date();
      soonDate.setHours(soonDate.getHours() + 2);

      const pastCancellations = [
        {
          id: "rsv-old-1",
          status: ReservationStatus.CANCELLED,
          startDate: new Date(),
          updatedAt: new Date(Date.now() - 3600000),
        },
        {
          id: "rsv-old-2",
          status: ReservationStatus.CANCELLED,
          startDate: new Date(),
          updatedAt: new Date(Date.now() - 7200000),
        },
      ];

      reservationRepository.findMany.mockResolvedValue({
        reservations: pastCancellations,
        meta: { total: 2 },
      });

      const result = await service.evaluateCancellation(
        "user-123",
        "rsv-123",
        soonDate,
      );

      expect(result.shouldApplyPenalty).toBe(true);
      expect(result.penaltyType).toBe(PenaltyType.TEMPORARY_RESTRICTION);
      expect(result.restrictionUntil).toBeDefined();
      expect(result.cancellationCount30Days).toBe(3);
    });
  });

  // --- RF-40: Cancelaciones y ausencias ---

  describe("evaluateNoShow", () => {
    it("Given a user with no prior no-shows, When evaluateNoShow is called, Then a WARNING should be issued for the first occurrence", async () => {
      reservationRepository.findMany.mockResolvedValue({
        reservations: [],
        meta: { total: 0 },
      });

      const result = await service.evaluateNoShow("user-123");

      expect(result.shouldApplyPenalty).toBe(true);
      expect(result.penaltyType).toBe(PenaltyType.WARNING);
    });

    it("Given a user with 1 prior no-show, When evaluateNoShow is called, Then a TEMPORARY_RESTRICTION should be applied", async () => {
      reservationRepository.findMany.mockResolvedValue({
        reservations: [{ id: "rsv-noshow" }],
        meta: { total: 1 },
      });

      const result = await service.evaluateNoShow("user-123");

      expect(result.shouldApplyPenalty).toBe(true);
      expect(result.penaltyType).toBe(PenaltyType.TEMPORARY_RESTRICTION);
      expect(result.restrictionUntil).toBeDefined();
    });
  });

  describe("getUserPenaltyRecord", () => {
    it("Given a user with clean history, When getUserPenaltyRecord is called, Then all counts should be zero", async () => {
      reservationRepository.findMany.mockResolvedValue({
        reservations: [],
        meta: { total: 0 },
      });

      const record = await service.getUserPenaltyRecord("user-123");

      expect(record.userId).toBe("user-123");
      expect(record.totalCancellations30Days).toBe(0);
      expect(record.lateCancellations30Days).toBe(0);
      expect(record.noShows30Days).toBe(0);
      expect(record.currentPenalty).toBeUndefined();
    });
  });

  describe("hasActiveRestriction", () => {
    it("Given a user with no cancellations, When hasActiveRestriction is called, Then it should return false", async () => {
      reservationRepository.findMany.mockResolvedValue({
        reservations: [],
        meta: { total: 0 },
      });

      const result = await service.hasActiveRestriction("user-123");

      expect(result).toBe(false);
    });
  });
});
