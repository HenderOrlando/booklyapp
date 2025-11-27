import { Injectable } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { RespondReassignmentCommand } from "../commands/respond-reassignment.command";
import { ReassignmentService } from "../services/reassignment.service";

/**
 * Handler para responder a reasignación
 */
@CommandHandler(RespondReassignmentCommand)
@Injectable()
export class RespondReassignmentHandler
  implements ICommandHandler<RespondReassignmentCommand>
{
  constructor(private readonly service: ReassignmentService) {}

  async execute(command: RespondReassignmentCommand): Promise<void> {
    const { dto } = command;
    return await this.service.respondToReassignment(
      dto.reassignmentId,
      dto.accepted,
      dto.newResourceId,
      dto.feedback
    );
  }
}
