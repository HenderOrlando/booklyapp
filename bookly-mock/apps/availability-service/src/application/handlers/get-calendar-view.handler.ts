import { Injectable } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { CalendarViewResponseDto } from "../../infrastructure/dtos/calendar-view.dto";
import { GetCalendarViewQuery } from "../queries/get-calendar-view.query";
import { CalendarViewService } from "../services/calendar-view.service";

/**
 * Handler para obtener vista de calendario
 */
@QueryHandler(GetCalendarViewQuery)
@Injectable()
export class GetCalendarViewHandler
  implements IQueryHandler<GetCalendarViewQuery>
{
  constructor(private readonly calendarViewService: CalendarViewService) {}

  async execute(query: GetCalendarViewQuery): Promise<CalendarViewResponseDto> {
    return await this.calendarViewService.generateCalendarView(
      query.dto,
      query.userId
    );
  }
}
