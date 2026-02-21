import { createLogger } from "@libs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ApprovalRequestEntity } from '@stockpile/domain/entities';
import { CreateApprovalRequestCommand } from "../commands";
import { ApprovalRequestService } from "../services";

const logger = createLogger("CreateApprovalRequestHandler");

/**
 * Create Approval Request Handler
 * Handler para crear una nueva solicitud de aprobación
 */
@CommandHandler(CreateApprovalRequestCommand)
export class CreateApprovalRequestHandler
  implements ICommandHandler<CreateApprovalRequestCommand>
{
  constructor(
    private readonly approvalRequestService: ApprovalRequestService
  ) {}

  async execute(
    command: CreateApprovalRequestCommand
  ): Promise<ApprovalRequestEntity> {
    logger.info("Executing CreateApprovalRequestCommand", {
      reservationId: command.reservationId,
    });

    return await this.approvalRequestService.createApprovalRequest({
      reservationId: command.reservationId,
      requesterId: command.requesterId,
      approvalFlowId: command.approvalFlowId,
      metadata: command.metadata,
      createdBy: command.createdBy,
      securityInfo: command.securityInfo,
    });
  }
}
