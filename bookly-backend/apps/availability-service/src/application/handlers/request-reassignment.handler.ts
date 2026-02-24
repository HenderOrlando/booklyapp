import { Injectable } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ReassignmentResponseDto } from '@availability/infrastructure/dtos/reassignment.dto';
import { RequestReassignmentCommand } from "../commands/request-reassignment.command";
import { ReassignmentService } from "../services/reassignment.service";

/**
 * Handler para solicitar reasignación de recurso
 */
@CommandHandler(RequestReassignmentCommand)
@Injectable()
export class RequestReassignmentHandler
  implements ICommandHandler<RequestReassignmentCommand>
{
  constructor(private readonly service: ReassignmentService) {}

  async execute(
    command: RequestReassignmentCommand
  ): Promise<ReassignmentResponseDto> {
    return await this.service.requestReassignment(command.dto, command.userId);
  }
}
