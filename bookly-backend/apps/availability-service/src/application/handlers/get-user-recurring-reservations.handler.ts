import { GetUserRecurringReservationsQuery } from "@availability/application/queries/get-user-recurring-reservations.query";
import { RecurringReservationService } from "@availability/application/services/recurring-reservation.service";
import { createLogger } from "@libs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";

const logger = createLogger("GetUserRecurringReservationsHandler");

/**
 * Get User Recurring Reservations Handler
 * Handler para la query de obtener reservas recurrentes de un usuario
 */
@QueryHandler(GetUserRecurringReservationsQuery)
export class GetUserRecurringReservationsHandler
  implements IQueryHandler<GetUserRecurringReservationsQuery>
{
  constructor(
    private readonly recurringReservationService: RecurringReservationService
  ) {}

  async execute(query: GetUserRecurringReservationsQuery): Promise<any> {
    logger.info("Executing GetUserRecurringReservationsQuery", {
      filters: query.filters,
    });

    const result =
      await this.recurringReservationService.getUserRecurringReservations(
        query.filters
      );

    logger.info("User recurring reservations retrieved successfully", {
      total: result.pagination.total,
      page: result.pagination.page,
    });

    return result;
  }
}
