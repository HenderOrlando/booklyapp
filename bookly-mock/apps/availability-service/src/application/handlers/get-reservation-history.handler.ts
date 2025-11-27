import { Injectable } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { IAuditQueryResult } from "@reports/audit-decorators";
import { ReservationHistoryRepository } from "../../infrastructure/repositories/reservation-history.repository";
import { GetReservationHistoryQuery } from "../queries/get-reservation-history.query";

/**
 * Handler para obtener historial de reserva
 */
@QueryHandler(GetReservationHistoryQuery)
@Injectable()
export class GetReservationHistoryHandler
  implements IQueryHandler<GetReservationHistoryQuery>
{
  constructor(
    private readonly historyRepository: ReservationHistoryRepository
  ) {}

  async execute(query: GetReservationHistoryQuery): Promise<IAuditQueryResult> {
    return await this.historyRepository.findByEntityId(
      query.reservationId,
      "RESERVATION",
      query.options
    );
  }
}
