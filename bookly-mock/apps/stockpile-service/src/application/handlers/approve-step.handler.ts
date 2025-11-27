import { createLogger } from "@libs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ApprovalRequestEntity } from "../../domain/entities";
import { CacheInvalidationService } from "../../infrastructure/services/cache-invalidation.service";
import { ApproveStepCommand } from "../commands";
import { ApprovalRequestService } from "../services";

const logger = createLogger("ApproveStepHandler");

/**
 * Approve Step Handler
 * Handler para aprobar un paso del flujo de aprobación
 */
@CommandHandler(ApproveStepCommand)
export class ApproveStepHandler implements ICommandHandler<ApproveStepCommand> {
  constructor(
    private readonly approvalRequestService: ApprovalRequestService,
    private readonly cacheInvalidationService: CacheInvalidationService
  ) {}

  async execute(command: ApproveStepCommand): Promise<ApprovalRequestEntity> {
    logger.info("Executing ApproveStepCommand", {
      approvalRequestId: command.approvalRequestId,
      stepName: command.stepName,
    });

    const result = await this.approvalRequestService.approveStep({
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
