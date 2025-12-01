import { Injectable } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { IAuditQueryResult } from "@reports/audit-decorators";
import { ReservationHistoryRepository } from '@availability/infrastructure/repositories/reservation-history.repository";
import { GetUserActivityQuery } from "../queries/get-user-activity.query";

/**
 * Handler para obtener actividad de usuario
 */
@QueryHandler(GetUserActivityQuery)
@Injectable()
export class GetUserActivityHandler
  implements IQueryHandler<GetUserActivityQuery>
{
  constructor(
    private readonly historyRepository: ReservationHistoryRepository
  ) {}

  async execute(query: GetUserActivityQuery): Promise<IAuditQueryResult> {
    return await this.historyRepository.findByUserId(
      query.userId,
      query.options
    );
  }
}
