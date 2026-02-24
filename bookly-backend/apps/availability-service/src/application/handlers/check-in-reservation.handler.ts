import { createLogger } from "@libs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CheckInReservationCommand } from "../commands/check-in-reservation.command";
import { ReservationService } from "../services/reservation.service";

const logger = createLogger("CheckInReservationHandler");

/**
 * Check-In Reservation Handler
 * Handler para el comando de check-in de reserva
 */
@CommandHandler(CheckInReservationCommand)
export class CheckInReservationHandler
  implements ICommandHandler<CheckInReservationCommand>
{
  constructor(private readonly reservationService: ReservationService) {}

  async execute(command: CheckInReservationCommand): Promise<any> {
    logger.info("Executing CheckInReservationCommand", {
      reservationId: command.id,
      userId: command.userId,
    });

    const reservation = await this.reservationService.checkIn(command.id);

    logger.info("Check-in successful", {
      reservationId: reservation.id,
    });

    return reservation;
  }
}
