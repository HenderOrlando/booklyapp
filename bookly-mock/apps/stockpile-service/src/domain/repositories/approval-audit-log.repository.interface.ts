import {
  ApprovalAuditLogActionType,
  ApprovalAuditLogEntity,
} from "../entities/approval-audit-log.entity";

/**
 * Approval Audit Log Repository Interface
 */
export interface IApprovalAuditLogRepository {
  /**
   * Crear un nuevo log de auditoría
   */
  create(
    log: Omit<ApprovalAuditLogEntity, "id" | "createdAt">
  ): Promise<ApprovalAuditLogEntity>;

  /**
   * Buscar por ID
   */
  findById(id: string): Promise<ApprovalAuditLogEntity | null>;

  /**
   * Buscar todos los logs de una solicitud
   */
  findByRequestId(requestId: string): Promise<ApprovalAuditLogEntity[]>;

  /**
   * Buscar logs por actor
   */
  findByActorId(actorId: string): Promise<ApprovalAuditLogEntity[]>;

  /**
   * Buscar logs por tipo de acción
   */
  findByAction(
    action: ApprovalAuditLogActionType
  ): Promise<ApprovalAuditLogEntity[]>;

  /**
   * Buscar logs en un rango de fechas
   */
  findByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<ApprovalAuditLogEntity[]>;

  /**
   * Buscar logs con filtros avanzados
   */
  findWithFilters(filters: {
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
  }>;

  /**
   * Contar logs por tipo de acción
   */
  countByAction(): Promise<Record<ApprovalAuditLogActionType, number>>;

  /**
   * Obtener estadísticas de auditoría
   */
  getStatistics(filters?: { startDate?: Date; endDate?: Date }): Promise<{
    totalLogs: number;
    byAction: Record<ApprovalAuditLogActionType, number>;
    byActor: Record<string, number>;
    criticalActions: number;
  }>;

  /**
   * Exportar logs para reportes
   */
  exportLogs(filters: {
    requestId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<any[]>;
}
