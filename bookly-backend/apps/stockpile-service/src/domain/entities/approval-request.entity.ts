import {
  ApprovalHistoryDecision,
  ApprovalRequestStatus,
} from "@libs/common/enums";

/**
 * Approval Request Entity
 * Entidad de dominio para solicitudes de aprobación
 */
export class ApprovalRequestEntity {
  constructor(
    public readonly id: string,
    public readonly reservationId: string,
    public readonly requesterId: string,
    public readonly approvalFlowId: string,
    public readonly status: ApprovalRequestStatus,
    public readonly currentStepIndex: number,
    public readonly submittedAt: Date,
    public readonly completedAt?: Date,
    public readonly metadata?: Record<string, any>,
    public readonly approvalHistory?: {
      stepName: string;
      approverId: string;
      decision: ApprovalHistoryDecision;
      comment?: string;
      approvedAt: Date;
    }[],
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
    public readonly audit?: {
      createdBy: string;
      updatedBy?: string;
      cancelledBy?: string;
      cancelledAt?: Date;
    }
  ) {}

  /**
   * Verifica si la solicitud está pendiente
   */
  isPending(): boolean {
    return this.status === ApprovalRequestStatus.PENDING;
  }

  /**
   * Verifica si la solicitud está en revisión
   */
  isInReview(): boolean {
    return this.status === ApprovalRequestStatus.IN_REVIEW;
  }

  /**
   * Verifica si la solicitud fue aprobada
   */
  isApproved(): boolean {
    return this.status === ApprovalRequestStatus.APPROVED;
  }

  /**
   * Verifica si la solicitud fue rechazada
   */
  isRejected(): boolean {
    return this.status === ApprovalRequestStatus.REJECTED;
  }

  /**
   * Verifica si la solicitud fue cancelada
   */
  isCancelled(): boolean {
    return this.status === ApprovalRequestStatus.CANCELLED;
  }

  /**
   * Verifica si la solicitud está completa
   */
  isCompleted(): boolean {
    return (
      this.status === ApprovalRequestStatus.APPROVED ||
      this.status === ApprovalRequestStatus.REJECTED ||
      this.status === ApprovalRequestStatus.CANCELLED
    );
  }

  /**
   * Aprueba un paso
   */
  approveStep(
    approverId: string,
    stepName: string,
    comment?: string
  ): ApprovalRequestEntity {
    const newHistory = [
      ...(this.approvalHistory || []),
      {
        stepName,
        approverId,
        decision: ApprovalHistoryDecision.APPROVED,
        comment,
        approvedAt: new Date(),
      },
    ];

    return new ApprovalRequestEntity(
      this.id,
      this.reservationId,
      this.requesterId,
      this.approvalFlowId,
      ApprovalRequestStatus.IN_REVIEW,
      this.currentStepIndex + 1,
      this.submittedAt,
      this.completedAt,
      this.metadata,
      newHistory,
      this.createdAt,
      new Date(),
      this.audit
    );
  }

  /**
   * Rechaza un paso
   */
  rejectStep(
    approverId: string,
    stepName: string,
    comment?: string
  ): ApprovalRequestEntity {
    const newHistory = [
      ...(this.approvalHistory || []),
      {
        stepName,
        approverId,
        decision: ApprovalHistoryDecision.REJECTED,
        comment,
        approvedAt: new Date(),
      },
    ];

    return new ApprovalRequestEntity(
      this.id,
      this.reservationId,
      this.requesterId,
      this.approvalFlowId,
      ApprovalRequestStatus.REJECTED,
      this.currentStepIndex,
      this.submittedAt,
      new Date(),
      this.metadata,
      newHistory,
      this.createdAt,
      new Date(),
      this.audit
    );
  }

  /**
   * Completa la aprobación
   */
  complete(): ApprovalRequestEntity {
    return new ApprovalRequestEntity(
      this.id,
      this.reservationId,
      this.requesterId,
      this.approvalFlowId,
      ApprovalRequestStatus.APPROVED,
      this.currentStepIndex,
      this.submittedAt,
      new Date(),
      this.metadata,
      this.approvalHistory,
      this.createdAt,
      new Date(),
      this.audit
    );
  }

  /**
   * Cancela la solicitud
   */
  cancel(cancelledBy: string): ApprovalRequestEntity {
    return new ApprovalRequestEntity(
      this.id,
      this.reservationId,
      this.requesterId,
      this.approvalFlowId,
      ApprovalRequestStatus.CANCELLED,
      this.currentStepIndex,
      this.submittedAt,
      new Date(),
      this.metadata,
      this.approvalHistory,
      this.createdAt,
      new Date(),
      {
        createdBy: this.audit?.createdBy || cancelledBy,
        updatedBy: this.audit?.updatedBy,
        cancelledBy,
        cancelledAt: new Date(),
      }
    );
  }

  /**
   * Convierte la entidad a objeto plano
   */
  toObject(): any {
    return {
      id: this.id,
      reservationId: this.reservationId,
      requesterId: this.requesterId,
      approvalFlowId: this.approvalFlowId,
      status: this.status,
      currentStepIndex: this.currentStepIndex,
      submittedAt: this.submittedAt,
      completedAt: this.completedAt,
      metadata: this.metadata,
      approvalHistory: this.approvalHistory,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      audit: this.audit,
    };
  }

  /**
   * Crea una entidad desde un objeto plano
   */
  static fromObject(obj: any): ApprovalRequestEntity {
    return new ApprovalRequestEntity(
      obj.id || obj._id?.toString(),
      obj.reservationId,
      obj.requesterId,
      obj.approvalFlowId,
      obj.status,
      obj.currentStepIndex,
      obj.submittedAt instanceof Date
        ? obj.submittedAt
        : new Date(obj.submittedAt),
      obj.completedAt
        ? obj.completedAt instanceof Date
          ? obj.completedAt
          : new Date(obj.completedAt)
        : undefined,
      obj.metadata,
      obj.approvalHistory,
      obj.createdAt,
      obj.updatedAt,
      obj.audit
    );
  }
}
