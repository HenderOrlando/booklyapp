import { EventBusService } from "@libs/event-bus";
import { Inject, Injectable } from "@nestjs/common";
import {
  ApprovalAuditLogActionType,
  ApprovalAuditLogEntity,
} from '@stockpile/domain/entities/approval-audit-log.entity";
import { IApprovalAuditLogRepository } from '@stockpile/domain/repositories/approval-audit-log.repository.interface";

/**
 * Approval Audit Service
 * Servicio para gestión de auditoría de aprobaciones
 */
@Injectable()
export class ApprovalAuditService {
  constructor(
    @Inject("IApprovalAuditLogRepository")
    private readonly auditRepository: IApprovalAuditLogRepository,
    private readonly eventBus: EventBusService
  ) {}

  /**
   * Registra un log de auditoría
   */
  async logAction(
    data: Omit<ApprovalAuditLogEntity, "id" | "createdAt">
  ): Promise<ApprovalAuditLogEntity> {
    const log = await this.auditRepository.create(data);

    // Emitir evento si es una acción crítica
    if (log.isCriticalAction()) {
      await this.eventBus.publish("approval-request.audit", {
        eventId: log.id,
        eventType: "APPROVAL_AUDIT_CRITICAL_ACTION",
        service: "stockpile-service",
        timestamp: log.timestamp,
        data: log.toObject(),
        metadata: {
          approvalRequestId: log.approvalRequestId,
          action: log.action,
        },
      });
    }

    return log;
  }

  /**
   * Registra creación de solicitud
   */
  async logRequestCreation(
    requestId: string,
    actorId: string,
    actorRole: string,
    metadata?: any
  ): Promise<ApprovalAuditLogEntity> {
    const logData = ApprovalAuditLogEntity.createRequestLog(
      requestId,
      actorId,
      actorRole,
      metadata
    );
    return this.logAction(logData);
  }

  /**
   * Registra aprobación de paso
   */
  async logStepApproval(
    requestId: string,
    actorId: string,
    actorRole: string,
    stepName: string,
    comment?: string,
    metadata?: any
  ): Promise<ApprovalAuditLogEntity> {
    const logData = ApprovalAuditLogEntity.createStepApprovalLog(
      requestId,
      actorId,
      actorRole,
      stepName,
      comment,
      metadata
    );
    return this.logAction(logData);
  }

  /**
   * Registra rechazo de paso
   */
  async logStepRejection(
    requestId: string,
    actorId: string,
    actorRole: string,
    stepName: string,
    comment?: string,
    metadata?: any
  ): Promise<ApprovalAuditLogEntity> {
    const logData = ApprovalAuditLogEntity.createStepRejectionLog(
      requestId,
      actorId,
      actorRole,
      stepName,
      comment,
      metadata
    );
    return this.logAction(logData);
  }

  /**
   * Registra aprobación final de solicitud
   */
  async logRequestApproval(
    requestId: string,
    actorId: string,
    actorRole: string,
    metadata?: any
  ): Promise<ApprovalAuditLogEntity> {
    return this.logAction({
      approvalRequestId: requestId,
      action: ApprovalAuditLogActionType.REQUEST_APPROVED,
      actorId,
      actorRole,
      timestamp: new Date(),
      metadata,
    } as any);
  }

  /**
   * Registra rechazo de solicitud
   */
  async logRequestRejection(
    requestId: string,
    actorId: string,
    actorRole: string,
    metadata?: any
  ): Promise<ApprovalAuditLogEntity> {
    return this.logAction({
      approvalRequestId: requestId,
      action: ApprovalAuditLogActionType.REQUEST_REJECTED,
      actorId,
      actorRole,
      timestamp: new Date(),
      metadata,
    } as any);
  }

  /**
   * Registra cancelación de solicitud
   */
  async logRequestCancellation(
    requestId: string,
    actorId: string,
    actorRole: string,
    metadata?: any
  ): Promise<ApprovalAuditLogEntity> {
    return this.logAction({
      approvalRequestId: requestId,
      action: ApprovalAuditLogActionType.REQUEST_CANCELLED,
      actorId,
      actorRole,
      timestamp: new Date(),
      metadata,
    } as any);
  }

  /**
   * Registra generación de documento
   */
  async logDocumentGeneration(
    requestId: string,
    actorId: string,
    actorRole: string,
    documentId: string,
    metadata?: any
  ): Promise<ApprovalAuditLogEntity> {
    return this.logAction({
      approvalRequestId: requestId,
      action: ApprovalAuditLogActionType.DOCUMENT_GENERATED,
      actorId,
      actorRole,
      timestamp: new Date(),
      metadata: {
        ...metadata,
        documentId,
      },
    } as any);
  }

  /**
   * Registra envío de notificación
   */
  async logNotificationSent(
    requestId: string,
    actorId: string,
    actorRole: string,
    notificationId: string,
    metadata?: any
  ): Promise<ApprovalAuditLogEntity> {
    return this.logAction({
      approvalRequestId: requestId,
      action: ApprovalAuditLogActionType.NOTIFICATION_SENT,
      actorId,
      actorRole,
      timestamp: new Date(),
      metadata: {
        ...metadata,
        notificationId,
      },
    } as any);
  }

  /**
   * Obtiene logs de una solicitud
   */
  async getRequestLogs(requestId: string): Promise<ApprovalAuditLogEntity[]> {
    return this.auditRepository.findByRequestId(requestId);
  }

  /**
   * Obtiene logs de un actor
   */
  async getActorLogs(actorId: string): Promise<ApprovalAuditLogEntity[]> {
    return this.auditRepository.findByActorId(actorId);
  }

  /**
   * Obtiene logs con filtros
   */
  async getLogsWithFilters(filters: {
    requestId?: string;
    actorId?: string;
    actions?: ApprovalAuditLogActionType[];
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<{
    logs: ApprovalAuditLogEntity[];
    total: number;
  }> {
    return this.auditRepository.findWithFilters(filters);
  }

  /**
   * Obtiene estadísticas de auditoría
   */
  async getStatistics(filters?: { startDate?: Date; endDate?: Date }): Promise<{
    totalLogs: number;
    byAction: Record<ApprovalAuditLogActionType, number>;
    byActor: Record<string, number>;
    criticalActions: number;
  }> {
    return this.auditRepository.getStatistics(filters);
  }

  /**
   * Exporta logs para reportes
   */
  async exportLogs(filters: {
    requestId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<any[]> {
    return this.auditRepository.exportLogs(filters);
  }

  /**
   * Verifica la integridad del trail de auditoría
   */
  async verifyAuditTrail(requestId: string): Promise<{
    isValid: boolean;
    issues: string[];
    logs: ApprovalAuditLogEntity[];
  }> {
    const logs = await this.getRequestLogs(requestId);
    const issues: string[] = [];

    // Verificar que exista un log de creación
    const hasCreationLog = logs.some(
      (log) => log.action === ApprovalAuditLogActionType.REQUEST_CREATED
    );
    if (!hasCreationLog) {
      issues.push("Falta log de creación de solicitud");
    }

    // Verificar orden cronológico
    for (let i = 0; i < logs.length - 1; i++) {
      if (logs[i].timestamp < logs[i + 1].timestamp) {
        issues.push("Logs fuera de orden cronológico");
        break;
      }
    }

    // Verificar consistencia de acciones
    const hasApproval = logs.some((log) => log.isApprovalAction());
    const hasRejection = logs.some((log) => log.isRejectionAction());
    const hasCancellation = logs.some((log) => log.isCancellationAction());

    if (hasApproval && hasRejection) {
      issues.push("Solicitud tiene aprobaciones y rechazos simultáneos");
    }

    if ((hasApproval || hasRejection) && hasCancellation) {
      issues.push("Solicitud cancelada después de resolución");
    }

    return {
      isValid: issues.length === 0,
      issues,
      logs,
    };
  }
}
