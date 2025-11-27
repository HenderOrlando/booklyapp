import { RecurringReservationFiltersDto } from "@availability/infrastructure/dtos";

/**
 * Get User Recurring Reservations Query
 * Query para obtener las series recurrentes de un usuario con filtros
 */
export class GetUserRecurringReservationsQuery {
  constructor(public readonly filters: RecurringReservationFiltersDto) {}
}
