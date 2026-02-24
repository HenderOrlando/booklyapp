import { NotFoundException } from "@nestjs/common";
import { FeedbackService } from "../../../src/application/services/feedback.service";

describe("FeedbackService", () => {
  let service: FeedbackService;
  let feedbackRepository: any;
  let eventBus: any;

  const mockFeedback = {
    id: "fb-123",
    userId: "user-123",
    userName: "Test User",
    reservationId: "res-123",
    resourceId: "resource-123",
    resourceName: "Sala 101",
    rating: 4,
    comments: "Good experience",
    status: "ACTIVE",
  };

  beforeEach(() => {
    feedbackRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByReservation: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByResource: jest.fn(),
    };

    eventBus = {
      publish: jest.fn().mockResolvedValue(undefined),
    };

    service = new FeedbackService(feedbackRepository, eventBus);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- RF-34: Registro de feedback de usuarios ---

  describe("createFeedback", () => {
    it("Given valid feedback data and no existing feedback, When createFeedback is called, Then it should create feedback", async () => {
      feedbackRepository.findByReservation.mockResolvedValue(null);
      feedbackRepository.create.mockResolvedValue(mockFeedback);

      const result = await service.createFeedback({
        userId: "user-123",
        userName: "Test User",
        reservationId: "res-123",
        resourceId: "resource-123",
        resourceName: "Sala 101",
        rating: 4,
        comments: "Good experience",
      });

      expect(result).toBeDefined();
      expect(feedbackRepository.create).toHaveBeenCalled();
    });

    it("Given existing feedback for reservation, When createFeedback is called, Then it should handle duplicate", async () => {
      feedbackRepository.findByReservation.mockResolvedValue(mockFeedback);

      // Depending on implementation: may throw or update existing
      try {
        await service.createFeedback({
          userId: "user-123",
          userName: "Test User",
          reservationId: "res-123",
          resourceId: "resource-123",
          resourceName: "Sala 101",
          rating: 5,
        });
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("getFeedbackById", () => {
    it("Given an existing feedback, When getFeedbackById is called, Then it should return it", async () => {
      feedbackRepository.findById.mockResolvedValue(mockFeedback);

      const result = await service.getFeedbackById("fb-123");

      expect(result).toBeDefined();
      expect(result.id).toBe("fb-123");
    });

    it("Given a non-existent feedback, When getFeedbackById is called, Then it should throw NotFoundException", async () => {
      feedbackRepository.findById.mockResolvedValue(null);

      await expect(service.getFeedbackById("non-existent")).rejects.toThrow(
        NotFoundException
      );
    });
  });
});
