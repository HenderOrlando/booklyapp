import { UpdateRecurringSeriesCommand } from "@availability/application/commands/update-recurring-series.command";
import { RecurringReservationService } from "@availability/application/services/recurring-reservation.service";
import { createLogger } from "@libs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";

const logger = createLogger("UpdateRecurringSeriesHandler");

/**
 * Update Recurring Series Handler
 * Handler para el comando de actualizar serie recurrente
 */
@CommandHandler(UpdateRecurringSeriesCommand)
export class UpdateRecurringSeriesHandler
  implements ICommandHandler<UpdateRecurringSeriesCommand>
{
  constructor(
    private readonly recurringReservationService: RecurringReservationService
  ) {}

  async execute(command: UpdateRecurringSeriesCommand): Promise<any> {
    logger.info("Executing UpdateRecurringSeriesCommand", {
      seriesId: command.seriesId,
      userId: command.userId,
    });

    const result = await this.recurringReservationService.updateRecurringSeries(
      command.seriesId,
      command.dto,
      command.userId
    );

    logger.info("Recurring series updated successfully", {
      seriesId: command.seriesId,
      updatedInstances: result.updatedInstances,
    });

    return result;
  }
}
