import { createLogger } from "@libs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetReservationStatsQuery } from "../queries/get-reservation-stats.query";
import { ReservationService } from "../services/reservation.service";

const logger = createLogger("GetReservationStatsHandler");

/**
 * Get Reservation Stats Handler
 * Handler para la query de obtener estadísticas de reservas
 */
@QueryHandler(GetReservationStatsQuery)
export class GetReservationStatsHandler
  implements IQueryHandler<GetReservationStatsQuery>
{
  constructor(private readonly reservationService: ReservationService) {}

  async execute(query: GetReservationStatsQuery): Promise<any> {
    logger.info("Executing GetReservationStatsQuery", {
      filters: query.filters,
    });

    const stats = await this.reservationService.getReservationStats(
      query.filters
    );

    logger.info("Reservation stats retrieved successfully");

    return stats;
  }
}
