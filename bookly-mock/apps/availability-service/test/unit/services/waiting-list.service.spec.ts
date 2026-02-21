import { NotFoundException } from "@nestjs/common";
import { WaitingListService } from "../../../src/application/services/waiting-list.service";

describe("WaitingListService", () => {
  let service: WaitingListService;
  let waitingListRepository: any;

  const mockEntry = {
    id: "wl-123",
    resourceId: "res-123",
    userId: "user-123",
    requestedStartDate: new Date("2026-03-01T08:00:00"),
    requestedEndDate: new Date("2026-03-01T10:00:00"),
    priority: 0,
    isActive: true,
  };

  beforeEach(() => {
    waitingListRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      existsForUser: jest.fn(),
      findMany: jest.fn(),
      findByResource: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      promoteNext: jest.fn(),
    };

    service = new WaitingListService(waitingListRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- RF-14: Lista de espera ---

  describe("addToWaitingList", () => {
    it("Given no existing request, When addToWaitingList is called, Then it should add to waiting list", async () => {
      waitingListRepository.existsForUser.mockResolvedValue(false);
      waitingListRepository.create.mockResolvedValue(mockEntry);

      const result = await service.addToWaitingList({
        resourceId: "res-123",
        userId: "user-123",
        requestedStartDate: new Date("2026-03-01T08:00:00"),
        requestedEndDate: new Date("2026-03-01T10:00:00"),
      });

      expect(result).toBeDefined();
      expect(waitingListRepository.create).toHaveBeenCalled();
    });

    it("Given an existing active request, When addToWaitingList is called, Then it should throw error", async () => {
      waitingListRepository.existsForUser.mockResolvedValue(true);

      await expect(
        service.addToWaitingList({
          resourceId: "res-123",
          userId: "user-123",
          requestedStartDate: new Date("2026-03-01T08:00:00"),
          requestedEndDate: new Date("2026-03-01T10:00:00"),
        })
      ).rejects.toThrow();
    });
  });

  describe("getWaitingListByResource", () => {
    it("Given entries exist, When getWaitingListByResource is called, Then it should return paginated results", async () => {
      waitingListRepository.findByResource.mockResolvedValue({
        entries: [mockEntry],
        meta: { total: 1, page: 1, limit: 10 },
      });

      const result = await service.getWaitingList("res-123", { page: 1, limit: 10 });

      expect(result.waitingLists).toHaveLength(1);
    });
  });
});
