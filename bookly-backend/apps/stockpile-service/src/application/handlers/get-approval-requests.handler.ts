import { PaginationMeta } from "@libs/common";
import { createLogger } from "@libs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { ApprovalRequestEntity } from '@stockpile/domain/entities';
import { GetApprovalRequestsQuery } from "../queries";
import { ApprovalRequestService } from "../services";

const logger = createLogger("GetApprovalRequestsHandler");

/**
 * Get Approval Requests Handler
 * Handler para obtener solicitudes de aprobación con filtros
 */
@QueryHandler(GetApprovalRequestsQuery)
export class GetApprovalRequestsHandler
  implements IQueryHandler<GetApprovalRequestsQuery>
{
  constructor(
    private readonly approvalRequestService: ApprovalRequestService
  ) {}

  async execute(query: GetApprovalRequestsQuery): Promise<{
    requests: ApprovalRequestEntity[];
    meta: PaginationMeta;
  }> {
    logger.info("Executing GetApprovalRequestsQuery", {
      filters: query.filters,
    });

    return await this.approvalRequestService.getApprovalRequests(
      query.pagination,
      query.filters
    );
  }
}
