import { IAuditQueryOptions } from "@reports/audit-decorators";

/**
 * Query para obtener actividad de un usuario
 */
export class GetUserActivityQuery {
  constructor(
    public readonly userId: string,
    public readonly options?: IAuditQueryOptions
  ) {}
}
