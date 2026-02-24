import { PaginationQuery } from "@libs/common";

/**
 * Get Reservation Stats Query
 * Query para obtener estadísticas de reservas
 */
export class GetReservationStatsQuery {
  constructor(
    public readonly filters?: {
      userId?: string;
      resourceId?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ) {}
}
