import { createLogger } from "@libs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpdateReservationCommand } from "../commands/update-reservation.command";
import { ReservationService } from "../services/reservation.service";

const logger = createLogger("UpdateReservationHandler");

/**
 * Update Reservation Handler
 * Handler para el comando de actualizar reserva
 */
@CommandHandler(UpdateReservationCommand)
export class UpdateReservationHandler
  implements ICommandHandler<UpdateReservationCommand>
{
  constructor(private readonly reservationService: ReservationService) {}

  async execute(command: UpdateReservationCommand): Promise<any> {
    logger.info("Executing UpdateReservationCommand", {
      reservationId: command.id,
    });

    const reservation = await this.reservationService.updateReservation(
      command.id,
      {
        startDate: command.startDate,
        endDate: command.endDate,
        purpose: command.purpose,
        participants: command.participants,
        notes: command.notes,
        updatedBy: command.updatedBy,
      }
    );

    logger.info("Reservation updated successfully", {
      reservationId: reservation.id,
    });

    return reservation;
  }
}
