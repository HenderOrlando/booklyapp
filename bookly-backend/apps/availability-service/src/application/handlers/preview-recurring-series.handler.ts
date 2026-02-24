import { PreviewRecurringSeriesQuery } from "@availability/application/queries/preview-recurring-series.query";
import { RecurringReservationService } from "@availability/application/services";
import { PreviewRecurringReservationResponseDto } from "@availability/infrastructure/dtos";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";

/**
 * Handler para preview de serie recurrente
 */
@QueryHandler(PreviewRecurringSeriesQuery)
export class PreviewRecurringSeriesHandler
  implements IQueryHandler<PreviewRecurringSeriesQuery>
{
  constructor(
    private readonly recurringReservationService: RecurringReservationService
  ) {}

  async execute(
    query: PreviewRecurringSeriesQuery
  ): Promise<PreviewRecurringReservationResponseDto> {
    return await this.recurringReservationService.previewRecurringSeries(
      query.dto
    );
  }
}
