import { createLogger } from "@libs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetReservationsQuery } from "../queries/get-reservations.query";
import { ReservationService } from "../services/reservation.service";

const logger = createLogger("GetReservationsHandler");

/**
 * Get Reservations Handler
 * Handler para la query de obtener reservas
 */
@QueryHandler(GetReservationsQuery)
export class GetReservationsHandler
  implements IQueryHandler<GetReservationsQuery>
{
  constructor(private readonly reservationService: ReservationService) {}

  async execute(query: GetReservationsQuery): Promise<any> {
    logger.info("Executing GetReservationsQuery", {
      filters: query.filters,
      pagination: query.pagination,
    });

    const result = await this.reservationService.findReservations(
      query.pagination,
      query.filters
    );

    logger.info("Reservations retrieved successfully", {
      count: result.reservations.length,
      total: result.meta.total,
    });

    return result;
  }
}
