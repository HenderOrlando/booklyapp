import { IWaitingListRepository } from "@availability/domain/repositories/waiting-list.repository.interface";
import { Inject, NotFoundException } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CancelWaitingListCommand } from "../commands/cancel-waiting-list.command";

/**
 * Cancel Waiting List Handler
 * Handler para cancelar/eliminar una entrada de la lista de espera
 */
@CommandHandler(CancelWaitingListCommand)
export class CancelWaitingListHandler
  implements ICommandHandler<CancelWaitingListCommand>
{
  constructor(
    @Inject("IWaitingListRepository")
    private readonly repository: IWaitingListRepository,
  ) {}

  async execute(command: CancelWaitingListCommand): Promise<any> {
    const entry = await this.repository.findById(command.waitingListId);
    if (!entry) {
      throw new NotFoundException(
        `Waiting list entry with ID ${command.waitingListId} not found`,
      );
    }

    await this.repository.delete(command.waitingListId);

    return { id: command.waitingListId, cancelled: true };
  }
}
