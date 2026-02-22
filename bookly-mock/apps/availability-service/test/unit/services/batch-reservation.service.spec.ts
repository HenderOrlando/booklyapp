import { CreateBatchReservationHandler } from "../../../src/application/handlers/create-batch-reservation.handler";
import { CreateBatchReservationCommand } from "../../../src/application/commands/create-batch-reservation.command";
import { ReservationService } from "../../../src/application/services/reservation.service";

describe("CreateBatchReservationHandler (RF-19)", () => {
  let handler: CreateBatchReservationHandler;
  let reservationService: jest.Mocked<Partial<ReservationService>>;

  const mockReservation = (resourceId: string) => ({
    id: `rsv-${resourceId}`,
    resourceId,
    userId: "user-123",
    startDate: new Date("2026-03-01T08:00:00"),
    endDate: new Date("2026-03-01T10:00:00"),
    purpose: "Test",
    status: "PENDING",
  });

  beforeEach(() => {
    reservationService = {
      createReservation: jest.fn(),
      cancelReservation: jest.fn(),
    };

    handler = new CreateBatchReservationHandler(
      reservationService as any,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    it("Given 3 valid reservations with no conflicts, When execute is called, Then all 3 should be created successfully", async () => {
      reservationService.createReservation!
        .mockResolvedValueOnce(mockReservation("res-1") as any)
        .mockResolvedValueOnce(mockReservation("res-2") as any)
        .mockResolvedValueOnce(mockReservation("res-3") as any);

      const command = new CreateBatchReservationCommand(
        "user-123",
        [
          { resourceId: "res-1", startDate: new Date(), endDate: new Date(), purpose: "A" },
          { resourceId: "res-2", startDate: new Date(), endDate: new Date(), purpose: "B" },
          { resourceId: "res-3", startDate: new Date(), endDate: new Date(), purpose: "C" },
        ],
        true,
        "user-123",
      );

      const result = await handler.execute(command);

      expect(result.total).toBe(3);
      expect(result.successful).toBe(3);
      expect(result.failed).toBe(0);
      expect(reservationService.createReservation).toHaveBeenCalledTimes(3);
    });

    it("Given a conflict on the 2nd reservation with failOnConflict=true, When execute is called, Then all created reservations should be rolled back", async () => {
      reservationService.createReservation!
        .mockResolvedValueOnce(mockReservation("res-1") as any)
        .mockRejectedValueOnce(new Error("Resource is not available"))
        .mockResolvedValueOnce(mockReservation("res-3") as any);

      reservationService.cancelReservation!.mockResolvedValue({} as any);

      const command = new CreateBatchReservationCommand(
        "user-123",
        [
          { resourceId: "res-1", startDate: new Date(), endDate: new Date(), purpose: "A" },
          { resourceId: "res-2", startDate: new Date(), endDate: new Date(), purpose: "B" },
          { resourceId: "res-3", startDate: new Date(), endDate: new Date(), purpose: "C" },
        ],
        true,
        "user-123",
      );

      await expect(handler.execute(command)).rejects.toThrow(
        "Batch reservation failed",
      );

      expect(reservationService.cancelReservation).toHaveBeenCalledTimes(1);
    });

    it("Given a conflict on the 2nd reservation with failOnConflict=false, When execute is called, Then successful ones should be kept and failed ones reported", async () => {
      reservationService.createReservation!
        .mockResolvedValueOnce(mockReservation("res-1") as any)
        .mockRejectedValueOnce(new Error("Resource is not available"))
        .mockResolvedValueOnce(mockReservation("res-3") as any);

      const command = new CreateBatchReservationCommand(
        "user-123",
        [
          { resourceId: "res-1", startDate: new Date(), endDate: new Date(), purpose: "A" },
          { resourceId: "res-2", startDate: new Date(), endDate: new Date(), purpose: "B" },
          { resourceId: "res-3", startDate: new Date(), endDate: new Date(), purpose: "C" },
        ],
        false,
        "user-123",
      );

      const result = await handler.execute(command);

      expect(result.total).toBe(3);
      expect(result.successful).toBe(2);
      expect(result.failed).toBe(1);
      expect(result.results[1].success).toBe(false);
      expect(result.results[1].error).toContain("not available");
    });
  });
});
