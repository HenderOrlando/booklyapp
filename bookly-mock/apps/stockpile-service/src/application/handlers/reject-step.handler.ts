import { createLogger } from "@libs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ApprovalRequestEntity } from "../../domain/entities";
import { CacheInvalidationService } from "../../infrastructure/services/cache-invalidation.service";
import { RejectStepCommand } from "../commands";
import { ApprovalRequestService } from "../services";

const logger = createLogger("RejectStepHandler");

/**
 * Reject Step Handler
 * Handler para rechazar un paso del flujo de aprobación
 */
@CommandHandler(RejectStepCommand)
export class RejectStepHandler implements ICommandHandler<RejectStepCommand> {
  constructor(
    private readonly approvalRequestService: ApprovalRequestService,
    private readonly cacheInvalidationService: CacheInvalidationService
  ) {}

  async execute(command: RejectStepCommand): Promise<ApprovalRequestEntity> {
    logger.info("Executing RejectStepCommand", {
      approvalRequestId: command.approvalRequestId,
      stepName: command.stepName,
    });

    const result = await this.approvalRequestService.rejectStep({
      approvalRequestId: command.approvalRequestId,
      approverId: command.approverId,
      stepName: command.stepName,
      comment: command.comment,
    });

    // Invalidar cache de aprobaciones activas
    await this.cacheInvalidationService.invalidateActiveApprovalsCache();

    return result;
  }
}
