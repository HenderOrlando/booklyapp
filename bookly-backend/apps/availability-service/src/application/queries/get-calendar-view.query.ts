import { CalendarViewDto } from '@availability/infrastructure/dtos/calendar-view.dto';

/**
 * Query para obtener vista de calendario
 */
export class GetCalendarViewQuery {
  constructor(
    public readonly userId: string,
    public readonly dto: CalendarViewDto
  ) {}
}
