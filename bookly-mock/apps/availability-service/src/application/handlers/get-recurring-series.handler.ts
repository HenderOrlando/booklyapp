import { GetRecurringSeriesQuery } from "@availability/application/queries/get-recurring-series.query";
import { RecurringReservationService } from "@availability/application/services/recurring-reservation.service";
import { createLogger } from "@libs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";

const logger = createLogger("GetRecurringSeriesHandler");

/**
 * Get Recurring Series Handler
 * Handler para la query de obtener serie recurrente
 */
@QueryHandler(GetRecurringSeriesQuery)
export class GetRecurringSeriesHandler
  implements IQueryHandler<GetRecurringSeriesQuery>
{
  constructor(
    private readonly recurringReservationService: RecurringReservationService
  ) {}

  async execute(query: GetRecurringSeriesQuery): Promise<any> {
    logger.info("Executing GetRecurringSeriesQuery", {
      seriesId: query.seriesId,
      includeInstances: query.includeInstances,
    });

    const result = await this.recurringReservationService.getRecurringSeries(
      query.seriesId,
      query.includeInstances
    );

    logger.info("Recurring series retrieved successfully", {
      seriesId: query.seriesId,
      instances: result.instances?.length || 0,
    });

    return result;
  }
}
