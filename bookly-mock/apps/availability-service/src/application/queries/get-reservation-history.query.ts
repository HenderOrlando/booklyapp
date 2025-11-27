import { IAuditQueryOptions } from "@reports/audit-decorators";

/**
 * Query para obtener historial de una reserva
 */
export class GetReservationHistoryQuery {
  constructor(
    public readonly reservationId: string,
    public readonly options?: IAuditQueryOptions
  ) {}
}
