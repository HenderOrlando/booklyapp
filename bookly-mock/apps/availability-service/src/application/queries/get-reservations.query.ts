import { ReservationStatus } from "@libs/common/enums";
import { PaginationQuery } from "@libs/common";

/**
 * Get Reservations Query
 * Query para obtener lista de reservas con filtros
 */
export class GetReservationsQuery {
  constructor(
    public readonly pagination: PaginationQuery,
    public readonly filters?: {
      userId?: string;
      resourceId?: string;
      status?: ReservationStatus;
      startDate?: Date;
      endDate?: Date;
    }
  ) {}
}
