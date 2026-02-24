import { CalendarViewType } from "@libs/common/enums";
import { CalendarViewService } from "../../../src/application/services/calendar-view.service";

describe("CalendarViewService", () => {
  let service: CalendarViewService;
  let availabilityRepository: any;
  let reservationRepository: any;
  let slotColorService: any;

  beforeEach(() => {
    availabilityRepository = {
      findByResourceAndDateRange: jest.fn().mockResolvedValue([]),
    };

    reservationRepository = {
      findByResourceAndDateRange: jest.fn().mockResolvedValue([]),
    };

    slotColorService = {
      getSlotColor: jest.fn().mockReturnValue("#3B82F6"),
      getStatusColor: jest.fn().mockReturnValue("#10B981"),
    };

    service = new CalendarViewService(
      availabilityRepository,
      reservationRepository,
      slotColorService
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- RF-10: Visualización en formato calendario ---

  describe("generateCalendarView", () => {
    it("Given MONTH view type, When generateCalendarView is called, Then it should return monthly slots", async () => {
      const result = await service.generateCalendarView({
        view: CalendarViewType.MONTH,
        resourceId: "res-123",
        year: 2026,
        month: 3,
      });

      expect(result).toBeDefined();
      expect(result.slots).toBeDefined();
    });

    it("Given WEEK view type, When generateCalendarView is called, Then it should return weekly slots", async () => {
      const result = await service.generateCalendarView({
        view: CalendarViewType.WEEK,
        resourceId: "res-123",
        year: 2026,
        weekNumber: 10,
      });

      expect(result).toBeDefined();
    });

    it("Given DAY view type, When generateCalendarView is called, Then it should return daily slots", async () => {
      const result = await service.generateCalendarView({
        view: CalendarViewType.DAY,
        resourceId: "res-123",
        year: 2026,
        month: 3,
        day: 1,
      });

      expect(result).toBeDefined();
    });

    it("Given unsupported view type, When generateCalendarView is called, Then it should throw error", async () => {
      await expect(
        service.generateCalendarView({
          view: "INVALID" as CalendarViewType,
          resourceId: "res-123",
          year: 2026,
        })
      ).rejects.toThrow();
    });
  });
});
