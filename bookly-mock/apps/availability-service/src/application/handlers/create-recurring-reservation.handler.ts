import { CreateRecurringReservationCommand } from "@availability/application/commands/create-recurring-reservation.command";
import { RecurringReservationService } from "@availability/application/services/recurring-reservation.service";
import { createLogger } from "@libs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";

const logger = createLogger("CreateRecurringReservationHandler");

/**
 * Create Recurring Reservation Handler
 * Handler para el comando de crear reserva recurrente
 */
@CommandHandler(CreateRecurringReservationCommand)
export class CreateRecurringReservationHandler
  implements ICommandHandler<CreateRecurringReservationCommand>
{
  constructor(
    private readonly recurringReservationService: RecurringReservationService
  ) {}

  async execute(command: CreateRecurringReservationCommand): Promise<any> {
    logger.info("Executing CreateRecurringReservationCommand", {
      userId: command.userId,
      resourceId: command.dto.resourceId,
      pattern: command.dto.recurrencePattern,
    });

    const result = await this.recurringReservationService.createRecurringSeries(
      command.dto,
      command.userId
    );

    logger.info("Recurring reservation series created successfully", {
      seriesId: result.seriesId,
      totalInstances: result.totalInstances,
      successfulInstances: result.successfulInstances,
    });

    return result;
  }
}
