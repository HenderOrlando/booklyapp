import { ApprovalRequestStatus } from "@libs/common/enums";
import { PaginationQuery } from "@libs/common";

/**
 * Get Approval Requests Query
 * Consulta para obtener solicitudes de aprobación con filtros
 */
export class GetApprovalRequestsQuery {
  constructor(
    public readonly pagination: PaginationQuery,
    public readonly filters?: {
      requesterId?: string;
      approvalFlowId?: string;
      status?: ApprovalRequestStatus;
      reservationId?: string;
    }
  ) {}
}
