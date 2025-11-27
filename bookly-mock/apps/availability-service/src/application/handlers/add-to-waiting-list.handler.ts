import { createLogger } from "@libs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { AddToWaitingListCommand } from "../commands/add-to-waiting-list.command";
import { WaitingListService } from "../services/waiting-list.service";

const logger = createLogger("AddToWaitingListHandler");

/**
 * Add To Waiting List Handler
 * Handler para el comando de agregar a lista de espera
 */
@CommandHandler(AddToWaitingListCommand)
export class AddToWaitingListHandler
  implements ICommandHandler<AddToWaitingListCommand>
{
  constructor(private readonly waitingListService: WaitingListService) {}

  async execute(command: AddToWaitingListCommand): Promise<any> {
    logger.info("Executing AddToWaitingListCommand", {
      resourceId: command.resourceId,
      userId: command.userId,
    });

    const waitingList = await this.waitingListService.addToWaitingList({
      resourceId: command.resourceId,
      userId: command.userId,
      requestedStartDate: command.requestedStartDate,
      requestedEndDate: command.requestedEndDate,
      priority: command.priority,
      purpose: command.purpose,
      expiresAt: command.expiresAt,
      createdBy: command.createdBy,
    });

    logger.info("Added to waiting list successfully", {
      waitingListId: waitingList.id,
    });

    return waitingList;
  }
}
