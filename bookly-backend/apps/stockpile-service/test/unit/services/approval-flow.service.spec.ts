import { NotFoundException } from "@nestjs/common";
import { ApprovalFlowService } from "../../../src/application/services/approval-flow.service";

describe("ApprovalFlowService", () => {
  let service: ApprovalFlowService;
  let approvalFlowRepository: any;

  const mockFlow = {
    id: "flow-123",
    name: "Standard Approval",
    description: "Standard approval flow",
    resourceTypes: ["classroom"],
    steps: [
      { order: 1, approverRole: "coordinator", name: "Coordinator Review" },
      { order: 2, approverRole: "admin", name: "Admin Approval" },
    ],
    isActive: true,
    isFlowActive: jest.fn().mockReturnValue(true),
  };

  beforeEach(() => {
    approvalFlowRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      existsByName: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    service = new ApprovalFlowService(approvalFlowRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- RF-24: Configuración de flujos de aprobación ---

  describe("createApprovalFlow", () => {
    it("Given valid flow data, When createApprovalFlow is called, Then it should create the flow", async () => {
      approvalFlowRepository.existsByName.mockResolvedValue(false);
      approvalFlowRepository.create.mockResolvedValue(mockFlow);

      const result = await service.createApprovalFlow({
        name: "Standard Approval",
        description: "Standard approval flow",
        resourceTypes: ["classroom"],
        steps: [
          { order: 1, approverRole: "coordinator", name: "Coordinator Review" },
          { order: 2, approverRole: "admin", name: "Admin Approval" },
        ],
      });

      expect(result).toBeDefined();
      expect(approvalFlowRepository.create).toHaveBeenCalled();
    });

    it("Given a duplicate name, When createApprovalFlow is called, Then it should throw error", async () => {
      approvalFlowRepository.existsByName.mockResolvedValue(true);

      await expect(
        service.createApprovalFlow({
          name: "Duplicate",
          description: "Test",
          resourceTypes: ["classroom"],
          steps: [{ order: 1, approverRole: "admin", name: "Admin" }],
        })
      ).rejects.toThrow();
    });

    it("Given unordered steps, When createApprovalFlow is called, Then it should throw error", async () => {
      approvalFlowRepository.existsByName.mockResolvedValue(false);

      await expect(
        service.createApprovalFlow({
          name: "Bad Order",
          description: "Test",
          resourceTypes: ["classroom"],
          steps: [
            { order: 2, approverRole: "admin", name: "Admin" },
            { order: 1, approverRole: "coordinator", name: "Coord" },
          ],
        })
      ).rejects.toThrow();
    });
  });

  describe("getApprovalFlowById", () => {
    it("Given an existing flow, When getApprovalFlowById is called, Then it should return it", async () => {
      approvalFlowRepository.findById.mockResolvedValue(mockFlow);

      const result = await service.getApprovalFlowById("flow-123");

      expect(result).toBeDefined();
      expect(result.id).toBe("flow-123");
    });

    it("Given a non-existent flow, When getApprovalFlowById is called, Then it should throw NotFoundException", async () => {
      approvalFlowRepository.findById.mockResolvedValue(null);

      await expect(
        service.getApprovalFlowById("non-existent")
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("updateApprovalFlow", () => {
    it("Given an existing flow, When updateApprovalFlow is called, Then it should update", async () => {
      approvalFlowRepository.findById.mockResolvedValue(mockFlow);
      approvalFlowRepository.update.mockResolvedValue({ ...mockFlow, description: "Updated" });

      const result = await service.updateApprovalFlow("flow-123", {
        description: "Updated",
      });

      expect(result).toBeDefined();
      expect(approvalFlowRepository.update).toHaveBeenCalled();
    });
  });

  describe("deactivateApprovalFlow", () => {
    it("Given an active flow, When deactivateApprovalFlow is called, Then it should deactivate", async () => {
      approvalFlowRepository.findById.mockResolvedValue(mockFlow);
      approvalFlowRepository.update.mockResolvedValue({ ...mockFlow, isActive: false });

      const result = await service.deactivateApprovalFlow("flow-123");

      expect(result).toBeDefined();
      expect(approvalFlowRepository.update).toHaveBeenCalled();
    });
  });
});
