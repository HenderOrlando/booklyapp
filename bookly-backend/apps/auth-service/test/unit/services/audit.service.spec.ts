import { AuditStatus, EventType } from "@libs/common/enums";
import { EventBusService } from "@libs/event-bus";
import { getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { AuditService } from "../../../src/application/services/audit.service";

describe("AuditService", () => {
  let service: AuditService;
  let auditLogModel: any;
  let eventBusService: jest.Mocked<EventBusService>;

  beforeEach(async () => {
    const mockAuditLogModel = {
      create: jest.fn(),
      find: jest.fn(),
      deleteMany: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        {
          provide: getModelToken("AuditLog"),
          useValue: mockAuditLogModel,
        },
        {
          provide: EventBusService,
          useValue: {
            publish: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
    auditLogModel = module.get(getModelToken("AuditLog"));
    eventBusService = module.get(EventBusService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- RF-44: Auditoría de Accesos ---

  describe("log", () => {
    it("Given valid audit data, When log is called, Then it should create an audit record and publish event", async () => {
      const auditData = {
        userId: "user-123",
        action: "LOGIN",
        resource: "auth",
        status: AuditStatus.SUCCESS,
        ip: "127.0.0.1",
      };

      auditLogModel.create.mockResolvedValue({
        _id: { toString: () => "audit-1" },
        ...auditData,
        timestamp: new Date(),
      });

      await service.log(auditData as any);

      expect(auditLogModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "user-123",
          action: "LOGIN",
        })
      );
      expect(eventBusService.publish).toHaveBeenCalledWith(
        EventType.AUDIT_LOG_CREATED,
        expect.any(Object)
      );
    });

    it("Given a failed audit action, When log is called, Then it should notify administrators", async () => {
      const auditData = {
        userId: "user-123",
        action: "LOGIN",
        resource: "auth",
        status: AuditStatus.FAILED,
        ip: "127.0.0.1",
        error: "Invalid credentials",
      };

      auditLogModel.create.mockResolvedValue({
        _id: { toString: () => "audit-2" },
        ...auditData,
        timestamp: new Date(),
      });

      await service.log(auditData as any);

      expect(eventBusService.publish).toHaveBeenCalledWith(
        EventType.AUDIT_UNAUTHORIZED_ATTEMPT,
        expect.any(Object)
      );
    });
  });

  describe("getUserAuditLogs", () => {
    it("Given audit logs exist for a user, When getUserAuditLogs is called, Then it should return the logs", async () => {
      const mockLogs = [
        { userId: "user-123", action: "LOGIN", timestamp: new Date() },
      ];

      auditLogModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockLogs),
          }),
        }),
      });

      const result = await service.getUserAuditLogs("user-123");

      expect(result).toHaveLength(1);
      expect(auditLogModel.find).toHaveBeenCalledWith(
        expect.objectContaining({ userId: "user-123" })
      );
    });

    it("Given a status filter, When getUserAuditLogs is called, Then it should filter by status", async () => {
      auditLogModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      await service.getUserAuditLogs("user-123", AuditStatus.FAILED);

      expect(auditLogModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "user-123",
          status: AuditStatus.FAILED,
        })
      );
    });
  });

  describe("getResourceAuditLogs", () => {
    it("Given audit logs for a resource, When getResourceAuditLogs is called, Then it should return them", async () => {
      auditLogModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      await service.getResourceAuditLogs("auth", "LOGIN");

      expect(auditLogModel.find).toHaveBeenCalledWith(
        expect.objectContaining({ resource: "auth", action: "LOGIN" })
      );
    });
  });

  describe("getFailedAttempts", () => {
    it("Given failed attempts in last 24 hours, When getFailedAttempts is called, Then it should return them", async () => {
      auditLogModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      await service.getFailedAttempts(24);

      expect(auditLogModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          status: AuditStatus.FAILED,
          timestamp: expect.any(Object),
        })
      );
    });
  });

  describe("cleanOldLogs", () => {
    it("Given old audit logs, When cleanOldLogs is called with 90 days, Then it should delete old records", async () => {
      auditLogModel.deleteMany.mockResolvedValue({
        deletedCount: 5,
        acknowledged: true,
      });

      const result = await service.cleanOldLogs(90);

      expect(result.deletedCount).toBe(5);
      expect(result.acknowledged).toBe(true);
    });
  });
});
