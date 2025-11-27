import {
  ApprovalAuditLogActionType,
  ApprovalHistoryDecision,
} from "@libs/common/enums";

// Re-export for external consumers
export { ApprovalAuditLogActionType, ApprovalHistoryDecision };

/**
 * Approval Audit Log Entity
 * Entidad de dominio para auditoría de aprobaciones
 */
export class ApprovalAuditLogEntity {
  constructor(
    public readonly id: string,
    public readonly approvalRequestId: string,
    public readonly action: ApprovalAuditLogActionType,
    public readonly actorId: string,
    public readonly actorRole: string,
    public readonly timestamp: Date,
    public readonly metadata?: {
      stepName?: string;
      decision?: ApprovalHistoryDecision;
      previousStatus?: string;
      newStatus?: string;
      comment?: string;
      documentId?: string;
      notificationId?: string;
      ipAddress?: string;
      userAgent?: string;
      [key: string]: any;
    },
    public readonly changes?: {
      field: string;
      oldValue: any;
      newValue: any;
    }[],
    public readonly createdAt?: Date
  ) {}

  /**
   * Verifica si es una acción de aprobación
   */
  isApprovalAction(): boolean {
    return (
      this.action === ApprovalAuditLogActionType.STEP_APPROVED ||
      this.action === ApprovalAuditLogActionType.REQUEST_APPROVED
    );
  }

  /**
   * Verifica si es una acción de rechazo
   */
  isRejectionAction(): boolean {
    return (
      this.action === ApprovalAuditLogActionType.STEP_REJECTED ||
      this.action === ApprovalAuditLogActionType.REQUEST_REJECTED
    );
  }

  /**
   * Verifica si es una acción de cancelación
   */
  isCancellationAction(): boolean {
    return this.action === ApprovalAuditLogActionType.REQUEST_CANCELLED;
  }

  /**
   * Verifica si es una acción crítica
   */
  isCriticalAction(): boolean {
    return [
      ApprovalAuditLogActionType.REQUEST_APPROVED,
      ApprovalAuditLogActionType.REQUEST_REJECTED,
      ApprovalAuditLogActionType.REQUEST_CANCELLED,
    ].includes(this.action);
  }

  /**
   * Obtiene descripción legible de la acción
   */
  getActionDescription(): string {
    const descriptions: Record<ApprovalAuditLogActionType, string> = {
      [ApprovalAuditLogActionType.REQUEST_CREATED]: "Solicitud creada",
      [ApprovalAuditLogActionType.STEP_APPROVED]: "Paso aprobado",
      [ApprovalAuditLogActionType.STEP_REJECTED]: "Paso rechazado",
      [ApprovalAuditLogActionType.REQUEST_APPROVED]: "Solicitud aprobada",
      [ApprovalAuditLogActionType.REQUEST_REJECTED]: "Solicitud rechazada",
      [ApprovalAuditLogActionType.REQUEST_CANCELLED]: "Solicitud cancelada",
      [ApprovalAuditLogActionType.DOCUMENT_GENERATED]: "Documento generado",
      [ApprovalAuditLogActionType.NOTIFICATION_SENT]: "Notificación enviada",
      [ApprovalAuditLogActionType.FLOW_ASSIGNED]: "Flujo asignado",
      [ApprovalAuditLogActionType.DEADLINE_EXTENDED]: "Plazo extendido",
      [ApprovalAuditLogActionType.COMMENT_ADDED]: "Comentario agregado",
    };

    return descriptions[this.action] || this.action;
  }

  /**
   * Convierte la entidad a objeto plano
   */
  toObject(): any {
    return {
      id: this.id,
      approvalRequestId: this.approvalRequestId,
      action: this.action,
      actorId: this.actorId,
      actorRole: this.actorRole,
      timestamp: this.timestamp,
      metadata: this.metadata,
      changes: this.changes,
      createdAt: this.createdAt,
    };
  }

  /**
   * Crea una entidad desde un objeto plano
   */
  static fromObject(obj: any): ApprovalAuditLogEntity {
    return new ApprovalAuditLogEntity(
      obj.id || obj._id?.toString(),
      obj.approvalRequestId,
      obj.action,
      obj.actorId,
      obj.actorRole,
      obj.timestamp instanceof Date ? obj.timestamp : new Date(obj.timestamp),
      obj.metadata,
      obj.changes,
      obj.createdAt
    );
  }

  /**
   * Crea un log para creación de solicitud
   */
  static createRequestLog(
    requestId: string,
    actorId: string,
    actorRole: string,
    metadata?: any
  ): Omit<ApprovalAuditLogEntity, "id" | "createdAt"> {
    return {
      approvalRequestId: requestId,
      action: ApprovalAuditLogActionType.REQUEST_CREATED,
      actorId,
      actorRole,
      timestamp: new Date(),
      metadata,
      changes: undefined,
    } as any;
  }

  /**
   * Crea un log para aprobación de paso
   */
  static createStepApprovalLog(
    requestId: string,
    actorId: string,
    actorRole: string,
    stepName: string,
    comment?: string,
    metadata?: any
  ): Omit<ApprovalAuditLogEntity, "id" | "createdAt"> {
    return {
      approvalRequestId: requestId,
      action: ApprovalAuditLogActionType.STEP_APPROVED,
      actorId,
      actorRole,
      timestamp: new Date(),
      metadata: {
        ...metadata,
        stepName,
        decision: ApprovalHistoryDecision.APPROVED,
        comment,
      },
      changes: undefined,
    } as any;
  }

  /**
   * Crea un log para rechazo de paso
   */
  static createStepRejectionLog(
    requestId: string,
    actorId: string,
    actorRole: string,
    stepName: string,
    comment?: string,
    metadata?: any
  ): Omit<ApprovalAuditLogEntity, "id" | "createdAt"> {
    return {
      approvalRequestId: requestId,
      action: ApprovalAuditLogActionType.STEP_REJECTED,
      actorId,
      actorRole,
      timestamp: new Date(),
      metadata: {
        ...metadata,
        stepName,
        decision: ApprovalHistoryDecision.REJECTED,
        comment,
      },
      changes: undefined,
    } as any;
  }
}
