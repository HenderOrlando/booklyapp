import { createLogger } from "@libs/common";
import { Inject, NotFoundException } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { IApprovalRequestRepository } from "@stockpile/domain/repositories";
import { DeleteApprovalRequestCommand } from "../commands/delete-approval-request.command";

const logger = createLogger("DeleteApprovalRequestHandler");

/**
 * Delete Approval Request Handler
 * Handler para eliminar permanentemente una solicitud de aprobación
 */
@CommandHandler(DeleteApprovalRequestCommand)
export class DeleteApprovalRequestHandler
  implements ICommandHandler<DeleteApprovalRequestCommand>
{
  constructor(
    @Inject("IApprovalRequestRepository")
    private readonly approvalRequestRepository: IApprovalRequestRepository,
  ) {}

  async execute(command: DeleteApprovalRequestCommand): Promise<any> {
    logger.info("Executing DeleteApprovalRequestCommand", {
      approvalRequestId: command.approvalRequestId,
    });

    const request = await this.approvalRequestRepository.findById(
      command.approvalRequestId,
    );

    if (!request) {
      throw new NotFoundException(
        `Approval request with ID ${command.approvalRequestId} not found`,
      );
    }

    await this.approvalRequestRepository.delete(command.approvalRequestId);

    return { id: command.approvalRequestId, deleted: true };
  }
}
