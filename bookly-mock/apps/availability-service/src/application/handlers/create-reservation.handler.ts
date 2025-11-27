import { createLogger } from "@libs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateReservationCommand } from "../commands/create-reservation.command";
import { ReservationService } from "../services/reservation.service";

const logger = createLogger("CreateReservationHandler");

/**
 * Create Reservation Handler
 * Handler para el comando de crear reserva
 */
@CommandHandler(CreateReservationCommand)
export class CreateReservationHandler
  implements ICommandHandler<CreateReservationCommand>
{
  constructor(private readonly reservationService: ReservationService) {}

  async execute(command: CreateReservationCommand): Promise<any> {
    logger.info("Executing CreateReservationCommand", {
      resourceId: command.resourceId,
      userId: command.userId,
    });

    const reservation = await this.reservationService.createReservation({
      resourceId: command.resourceId,
      userId: command.userId,
      startDate: command.startDate,
      endDate: command.endDate,
      purpose: command.purpose,
      isRecurring: command.isRecurring,
      recurringPattern: command.recurringPattern,
      participants: command.participants,
      notes: command.notes,
      externalCalendarId: command.externalCalendarId,
      externalCalendarEventId: command.externalCalendarEventId,
      createdBy: command.createdBy,
    });

    logger.info("Reservation created successfully", {
      reservationId: reservation.id,
    });

    return reservation;
  }
}
