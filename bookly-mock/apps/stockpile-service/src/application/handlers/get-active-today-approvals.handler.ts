import { PaginationMeta } from "@libs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { EnrichedApprovalRequestDto } from "../../infrastructure/dtos";
import { GetActiveTodayApprovalsQuery } from "../queries/get-active-today-approvals.query";
import { ApprovalRequestService } from "../services";

/**
 * Get Active Today Approvals Handler
 * Handler para obtener aprobaciones activas del día (para vigilantes)
 * RF-23: Visualización de reservas aprobadas para vigilante con paginación, filtros y datos enriquecidos
 */
@QueryHandler(GetActiveTodayApprovalsQuery)
export class GetActiveTodayApprovalsHandler
  implements IQueryHandler<GetActiveTodayApprovalsQuery>
{
  constructor(
    private readonly approvalRequestService: ApprovalRequestService
  ) {}

  async execute(query: GetActiveTodayApprovalsQuery): Promise<{
    requests: EnrichedApprovalRequestDto[];
    meta: PaginationMeta;
  }> {
    return await this.approvalRequestService.getActiveTodayApprovals({
      date: query.date,
      page: query.page,
      limit: query.limit,
      filters: query.filters,
    });
  }
}
