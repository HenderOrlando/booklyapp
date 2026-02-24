import { ApprovalRequestStatus } from "@libs/common/enums";
import { PaginationMeta, PaginationQuery } from "@libs/common";
import { ApprovalRequestEntity } from "../entities/approval-request.entity";

/**
 * Approval Request Repository Interface
 * Define los métodos para acceso y persistencia de solicitudes de aprobación
 */
export interface IApprovalRequestRepository {
  /**
   * Crea una nueva solicitud de aprobación
   */
  create(request: ApprovalRequestEntity): Promise<ApprovalRequestEntity>;

  /**
   * Busca una solicitud por ID
   */
  findById(id: string): Promise<ApprovalRequestEntity | null>;

  /**
   * Busca múltiples solicitudes con paginación y filtros
   */
  findMany(
    query: PaginationQuery,
    filters?: {
      requesterId?: string;
      approvalFlowId?: string;
      status?: ApprovalRequestStatus;
      reservationId?: string;
    }
  ): Promise<{ requests: ApprovalRequestEntity[]; meta: PaginationMeta }>;

  /**
   * Busca solicitudes por solicitante
   */
  findByRequester(
    requesterId: string,
    query: PaginationQuery
  ): Promise<{ requests: ApprovalRequestEntity[]; meta: PaginationMeta }>;

  /**
   * Busca solicitudes por flujo de aprobación
   */
  findByApprovalFlow(
    approvalFlowId: string,
    query: PaginationQuery
  ): Promise<{ requests: ApprovalRequestEntity[]; meta: PaginationMeta }>;

  /**
   * Busca solicitudes por estado
   */
  findByStatus(
    status: ApprovalRequestStatus,
    query: PaginationQuery
  ): Promise<{ requests: ApprovalRequestEntity[]; meta: PaginationMeta }>;

  /**
   * Busca solicitudes pendientes
   */
  findPending(
    query: PaginationQuery
  ): Promise<{ requests: ApprovalRequestEntity[]; meta: PaginationMeta }>;

  /**
   * Busca solicitudes en revisión
   */
  findInReview(
    query: PaginationQuery
  ): Promise<{ requests: ApprovalRequestEntity[]; meta: PaginationMeta }>;

  /**
   * Busca solicitud por reserva
   */
  findByReservation(
    reservationId: string
  ): Promise<ApprovalRequestEntity | null>;

  /**
   * Busca solicitudes que requieren aprobación de un rol específico
   */
  findRequiringApprovalFromRole(
    role: string,
    query: PaginationQuery
  ): Promise<{ requests: ApprovalRequestEntity[]; meta: PaginationMeta }>;

  /**
   * Actualiza una solicitud
   */
  update(
    id: string,
    data: Partial<ApprovalRequestEntity>
  ): Promise<ApprovalRequestEntity>;

  /**
   * Elimina una solicitud
   */
  delete(id: string): Promise<boolean>;

  /**
   * Cuenta solicitudes con filtros opcionales
   */
  count(filters?: {
    requesterId?: string;
    status?: ApprovalRequestStatus;
    approvalFlowId?: string;
  }): Promise<number>;

  /**
   * Obtiene estadísticas de aprobaciones
   */
  getStatistics(filters?: {
    startDate?: Date;
    endDate?: Date;
    approvalFlowId?: string;
  }): Promise<{
    total: number;
    approved: number;
    rejected: number;
    pending: number;
    averageApprovalTime: number;
  }>;

  /**
   * Busca aprobaciones activas para un rango de fechas específico
   * RF-23: Para visualización de vigilantes con paginación y filtros
   */
  findActiveByDateRange(
    startDate: Date,
    endDate: Date,
    pagination: PaginationQuery,
    filters?: {
      resourceId?: string;
      programId?: string;
      resourceType?: string;
    }
  ): Promise<{ requests: ApprovalRequestEntity[]; meta: PaginationMeta }>;
}
