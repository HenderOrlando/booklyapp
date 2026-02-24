import { ApprovalRequestStatus } from "@libs/common/enums";
import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { ApprovalRequestService } from "../../../src/application/services/approval-request.service";

describe("ApprovalRequestService", () => {
  let service: ApprovalRequestService;
  let approvalRequestRepository: any;
  let approvalFlowRepository: any;
  let dataEnrichmentService: any;

  const mockFlow = {
    id: "flow-123",
    name: "Standard Flow",
    isFlowActive: jest.fn().mockReturnValue(true),
    steps: [{ order: 1, approverRole: "admin" }],
  };

  const mockRequest = {
    id: "req-123",
    reservationId: "res-123",
    requesterId: "user-123",
    approvalFlowId: "flow-123",
    status: ApprovalRequestStatus.PENDING,
    isCompleted: jest.fn().mockReturnValue(false),
    currentStepIndex: 0,
  };

  beforeEach(async () => {
    approvalRequestRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByReservation: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    };

    approvalFlowRepository = {
      findById: jest.fn(),
      existsByName: jest.fn(),
    };

    dataEnrichmentService = {
      enrichApprovalRequest: jest.fn().mockResolvedValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApprovalRequestService,
        { provide: "IApprovalRequestRepository", useValue: approvalRequestRepository },
        { provide: "IApprovalFlowRepository", useValue: approvalFlowRepository },
        { provide: "DataEnrichmentService", useFactory: () => dataEnrichmentService },
      ],
    }).compile();

    service = new ApprovalRequestService(
      approvalRequestRepository,
      approvalFlowRepository,
      dataEnrichmentService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- RF-20: Validar solicitudes de reserva ---

  describe("createApprovalRequest", () => {
    it("Given a valid reservation and active flow, When createApprovalRequest is called, Then it should create the request", async () => {
      approvalFlowRepository.findById.mockResolvedValue(mockFlow);
      approvalRequestRepository.findByReservation.mockResolvedValue(null);
      approvalRequestRepository.create.mockResolvedValue(mockRequest);

      const result = await service.createApprovalRequest({
        reservationId: "res-123",
        requesterId: "user-123",
        approvalFlowId: "flow-123",
      });

      expect(result).toBeDefined();
      expect(approvalFlowRepository.findById).toHaveBeenCalledWith("flow-123");
      expect(approvalRequestRepository.create).toHaveBeenCalled();
    });

    it("Given a non-existent flow, When createApprovalRequest is called, Then it should throw NotFoundException", async () => {
      approvalFlowRepository.findById.mockResolvedValue(null);

      await expect(
        service.createApprovalRequest({
          reservationId: "res-123",
          requesterId: "user-123",
          approvalFlowId: "non-existent",
        })
      ).rejects.toThrow(NotFoundException);
    });

    it("Given an inactive flow, When createApprovalRequest is called, Then it should throw error", async () => {
      const inactiveFlow = { ...mockFlow, isFlowActive: jest.fn().mockReturnValue(false) };
      approvalFlowRepository.findById.mockResolvedValue(inactiveFlow);

      await expect(
        service.createApprovalRequest({
          reservationId: "res-123",
          requesterId: "user-123",
          approvalFlowId: "flow-123",
        })
      ).rejects.toThrow();
    });
  });

  // --- RF-22: Notificación automática ---

  describe("getApprovalRequestById", () => {
    it("Given an existing request, When getApprovalRequestById is called, Then it should return it", async () => {
      approvalRequestRepository.findById.mockResolvedValue(mockRequest);

      const result = await service.getApprovalRequestById("req-123");

      expect(result).toBeDefined();
      expect(result.id).toBe("req-123");
    });

    it("Given a non-existent request, When getApprovalRequestById is called, Then it should throw NotFoundException", async () => {
      approvalRequestRepository.findById.mockResolvedValue(null);

      await expect(
        service.getApprovalRequestById("non-existent")
      ).rejects.toThrow(NotFoundException);
    });
  });
});
