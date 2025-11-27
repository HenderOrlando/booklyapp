import { createLogger } from "@libs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { ApprovalRequestEntity } from "../../domain/entities";
import { GetApprovalRequestByIdQuery } from "../queries";
import { ApprovalRequestService } from "../services";

const logger = createLogger("GetApprovalRequestByIdHandler");

/**
 * Get Approval Request By Id Handler
 * Handler para obtener una solicitud de aprobación por ID
 */
@QueryHandler(GetApprovalRequestByIdQuery)
export class GetApprovalRequestByIdHandler
  implements IQueryHandler<GetApprovalRequestByIdQuery>
{
  constructor(
    private readonly approvalRequestService: ApprovalRequestService
  ) {}

  async execute(
    query: GetApprovalRequestByIdQuery
  ): Promise<ApprovalRequestEntity> {
    logger.info("Executing GetApprovalRequestByIdQuery", {
      approvalRequestId: query.approvalRequestId,
    });

    return await this.approvalRequestService.getApprovalRequestById(
      query.approvalRequestId
    );
  }
}
