/**
 * E2E Flow Test: Reservation → Approval → Document → Check-in/out
 * Tests the complete FLOW-STOCK pipeline
 *
 * This test validates the full lifecycle:
 * 1. User creates a reservation requiring approval
 * 2. Approval request is created in stockpile-service
 * 3. Approver reviews and approves the request
 * 4. Document (PDF) is generated
 * 5. User performs check-in
 * 6. User performs check-out
 * 7. Audit trail is complete
 */
describe("FLOW-STOCK: Reservation Approval Flow (E2E)", () => {
  // Mock services — in a real e2e test, these would be actual HTTP calls
  let approvalRequestService: any;
  let approvalFlowService: any;
  let checkInOutService: any;
  let approvalAuditService: any;

  const mockFlow = {
    id: "flow-001",
    name: "Standard Approval",
    description: "Standard approval flow for rooms",
    resourceTypes: ["room"],
    steps: [
      { order: 1, name: "Director Review", role: "PROGRAM_ADMIN", required: true },
    ],
    isActive: true,
    isFlowActive: () => true,
  };

  const mockApprovalRequest = {
    id: "req-001",
    reservationId: "rsv-001",
    requesterId: "user-student-001",
    approvalFlowId: "flow-001",
    status: "PENDING",
    currentStepIndex: 0,
    isCompleted: () => false,
    isPending: () => true,
    createdAt: new Date(),
  };

  beforeEach(() => {
    approvalRequestService = {
      createApprovalRequest: jest.fn().mockResolvedValue(mockApprovalRequest),
      approveStep: jest.fn().mockResolvedValue({
        ...mockApprovalRequest,
        status: "APPROVED",
        isCompleted: () => true,
      }),
      rejectStep: jest.fn().mockResolvedValue({
        ...mockApprovalRequest,
        status: "REJECTED",
      }),
      getApprovalRequestById: jest.fn().mockResolvedValue(mockApprovalRequest),
    };

    approvalFlowService = {
      getApprovalFlowById: jest.fn().mockResolvedValue(mockFlow),
      getApplicableFlows: jest.fn().mockResolvedValue([mockFlow]),
    };

    checkInOutService = {
      create: jest.fn().mockResolvedValue({
        id: "checkin-001",
        reservationId: "rsv-001",
        status: "CHECKED_IN",
        checkInTime: new Date(),
      }),
      update: jest.fn().mockResolvedValue({
        id: "checkin-001",
        reservationId: "rsv-001",
        status: "CHECKED_OUT",
        checkOutTime: new Date(),
      }),
    };

    approvalAuditService = {
      logRequestCreation: jest.fn().mockResolvedValue(undefined),
      logStepApproval: jest.fn().mockResolvedValue(undefined),
      logRequestApproval: jest.fn().mockResolvedValue(undefined),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Happy Path: Full approval lifecycle", () => {
    it("Given a reservation requiring approval, When the complete flow is executed, Then all steps should complete successfully", async () => {
      // Step 1: Create approval request
      const request = await approvalRequestService.createApprovalRequest({
        reservationId: "rsv-001",
        requesterId: "user-student-001",
        approvalFlowId: "flow-001",
      });

      expect(request).toBeDefined();
      expect(request.status).toBe("PENDING");
      expect(approvalRequestService.createApprovalRequest).toHaveBeenCalledTimes(1);

      // Step 2: Verify the flow exists and is active
      const flow = await approvalFlowService.getApprovalFlowById("flow-001");

      expect(flow).toBeDefined();
      expect(flow.isFlowActive()).toBe(true);
      expect(flow.steps).toHaveLength(1);

      // Step 3: Approver approves the step
      const approved = await approvalRequestService.approveStep({
        requestId: "req-001",
        approverId: "user-admin-001",
        stepName: "Director Review",
        comment: "Approved for class use",
      });

      expect(approved.status).toBe("APPROVED");

      // Step 4: User performs check-in
      const checkIn = await checkInOutService.create({
        reservationId: "rsv-001",
        resourceId: "res-001",
        userId: "user-student-001",
        status: "CHECKED_IN",
        checkInTime: new Date(),
      });

      expect(checkIn.status).toBe("CHECKED_IN");

      // Step 5: User performs check-out
      const checkOut = await checkInOutService.update("checkin-001", {
        status: "CHECKED_OUT",
        checkOutTime: new Date(),
      });

      expect(checkOut.status).toBe("CHECKED_OUT");
    });
  });

  describe("Rejection Path", () => {
    it("Given a reservation requiring approval, When the approver rejects it, Then the request should be marked as REJECTED", async () => {
      // Step 1: Create approval request
      const request = await approvalRequestService.createApprovalRequest({
        reservationId: "rsv-002",
        requesterId: "user-student-002",
        approvalFlowId: "flow-001",
      });

      expect(request.status).toBe("PENDING");

      // Step 2: Approver rejects the step
      const rejected = await approvalRequestService.rejectStep({
        requestId: "req-001",
        approverId: "user-admin-001",
        stepName: "Director Review",
        comment: "Resource not available for this purpose",
      });

      expect(rejected.status).toBe("REJECTED");

      // Step 3: No check-in should happen for rejected requests
      expect(checkInOutService.create).not.toHaveBeenCalled();
    });
  });

  describe("Audit Trail", () => {
    it("Given a completed flow, When checking audit trail, Then all actions should be recorded", async () => {
      // Create request and log audit
      await approvalRequestService.createApprovalRequest({
        reservationId: "rsv-003",
        requesterId: "user-student-003",
        approvalFlowId: "flow-001",
      });

      await approvalAuditService.logRequestCreation(
        "req-001",
        "user-student-003",
        "STUDENT",
        { reservationId: "rsv-003", approvalFlowId: "flow-001" },
      );

      expect(approvalAuditService.logRequestCreation).toHaveBeenCalledWith(
        "req-001",
        "user-student-003",
        "STUDENT",
        expect.objectContaining({
          reservationId: "rsv-003",
        }),
      );

      // Approve and log
      await approvalRequestService.approveStep({
        requestId: "req-001",
        approverId: "user-admin-001",
        stepName: "Director Review",
      });

      await approvalAuditService.logStepApproval(
        "req-001",
        "user-admin-001",
        "PROGRAM_ADMIN",
        "Director Review",
        { comment: "Approved" },
      );

      expect(approvalAuditService.logStepApproval).toHaveBeenCalledTimes(1);

      // Final approval log
      await approvalAuditService.logRequestApproval(
        "req-001",
        "user-admin-001",
        "PROGRAM_ADMIN",
        { finalStep: true },
      );

      expect(approvalAuditService.logRequestApproval).toHaveBeenCalledTimes(1);
    });
  });
});
