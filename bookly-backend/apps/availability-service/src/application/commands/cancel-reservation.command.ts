/**
 * Cancel Reservation Command
 * Command para cancelar una reserva
 */
export class CancelReservationCommand {
  constructor(
    public readonly id: string,
    public readonly cancelledBy: string,
    public readonly cancellationReason?: string
  ) {}
}
