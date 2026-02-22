import {
  sanitizeReservationSearchFilters,
  type ReservationSearchFilters,
} from "@/infrastructure/api/reservations-client";

const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();

describe("ReservationsClient search contract", () => {
  beforeEach(() => {
    consoleWarnSpy.mockClear();
  });

  afterAll(() => {
    consoleWarnSpy.mockRestore();
  });

  it("normalizes valid backend status values", () => {
    const filters = sanitizeReservationSearchFilters({
      status: "confirmed" as unknown as ReservationSearchFilters["status"],
      limit: 10,
    });

    expect(filters.status).toBe("CONFIRMED");
    expect(filters.limit).toBe(10);
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  it("removes unsupported status and maps upcoming to startDate", () => {
    const filters = sanitizeReservationSearchFilters({
      status: "upcoming" as unknown as ReservationSearchFilters["status"],
      limit: 10,
    });

    expect(filters.status).toBeUndefined();
    expect(filters.startDate).toBeDefined();
    expect(new Date(filters.startDate as string).toISOString()).toBe(
      filters.startDate,
    );
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      "[ReservationsClient.search] Ignorando status no soportado por backend: upcoming",
    );
  });

  it("keeps explicit startDate when status is upcoming", () => {
    const explicitStartDate = "2026-02-18T00:00:00.000Z";

    const filters = sanitizeReservationSearchFilters({
      status: "upcoming" as unknown as ReservationSearchFilters["status"],
      startDate: explicitStartDate,
      limit: 10,
    });

    expect(filters.status).toBeUndefined();
    expect(filters.startDate).toBe(explicitStartDate);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      "[ReservationsClient.search] Ignorando status no soportado por backend: upcoming",
    );
  });

  it("removes unknown status values", () => {
    const filters = sanitizeReservationSearchFilters({
      status: "IN_PROGRESS" as unknown as ReservationSearchFilters["status"],
      page: 1,
    });

    expect(filters.status).toBeUndefined();
    expect(filters.page).toBe(1);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      "[ReservationsClient.search] Ignorando status no soportado por backend: IN_PROGRESS",
    );
  });
});
