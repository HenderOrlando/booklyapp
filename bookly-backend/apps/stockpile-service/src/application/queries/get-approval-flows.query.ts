import { PaginationQuery } from "@libs/common";

/**
 * Get Approval Flows Query
 * Consulta para obtener flujos de aprobación con filtros
 */
export class GetApprovalFlowsQuery {
  constructor(
    public readonly pagination: PaginationQuery,
    public readonly filters?: {
      isActive?: boolean;
      resourceType?: string;
    }
  ) {}
}
