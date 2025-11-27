import { GetRecurringAnalyticsQuery } from "@availability/application/queries/get-recurring-analytics.query";
import { RecurringReservationService } from "@availability/application/services";
import { RecurringSeriesAnalyticsResponseDto } from "@availability/infrastructure/dtos";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";

/**
 * Handler para obtener analytics de series recurrentes
 */
@QueryHandler(GetRecurringAnalyticsQuery)
export class GetRecurringAnalyticsHandler
  implements IQueryHandler<GetRecurringAnalyticsQuery>
{
  constructor(
    private readonly recurringReservationService: RecurringReservationService
  ) {}

  async execute(
    query: GetRecurringAnalyticsQuery
  ): Promise<RecurringSeriesAnalyticsResponseDto> {
    return await this.recurringReservationService.getRecurringSeriesAnalytics(
      query.filters
    );
  }
}
