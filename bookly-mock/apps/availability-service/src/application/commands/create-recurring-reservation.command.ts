import { CreateRecurringReservationDto } from "@availability/infrastructure/dtos";

/**
 * Create Recurring Reservation Command
 * Command para crear una nueva reserva recurrente con múltiples instancias
 */
export class CreateRecurringReservationCommand {
  constructor(
    public readonly dto: CreateRecurringReservationDto,
    public readonly userId: string
  ) {}
}
