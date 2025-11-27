import { createLogger } from "@libs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ApprovalRequestEntity } from "../../domain/entities";
import { CacheInvalidationService } from "../../infrastructure/services/cache-invalidation.service";
import { CancelApprovalRequestCommand } from "../commands";
import { ApprovalRequestService } from "../services";

const logger = createLogger("CancelApprovalRequestHandler");

/**
 * Cancel Approval Request Handler
 * Handler para cancelar una solicitud de aprobación
 */
@CommandHandler(CancelApprovalRequestCommand)
export class CancelApprovalRequestHandler
  implements ICommandHandler<CancelApprovalRequestCommand>
{
  constructor(
    private readonly approvalRequestService: ApprovalRequestService,
    private readonly cacheInvalidationService: CacheInvalidationService
  ) {}

  async execute(
    command: CancelApprovalRequestCommand
  ): Promise<ApprovalRequestEntity> {
    logger.info("Executing CancelApprovalRequestCommand", {
      approvalRequestId: command.approvalRequestId,
    });

    const result = await this.approvalRequestService.cancelApprovalRequest({
      approvalRequestId: command.approvalRequestId,
      cancelledBy: command.cancelledBy,
      reason: command.reason,
    });

    // Invalidar cache de aprobaciones activas
    await this.cacheInvalidationService.invalidateActiveApprovalsCache();

    return result;
  }
}
