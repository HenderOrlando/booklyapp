import { PaginationQuery } from "@libs/common";

/**
 * Get Demand Reports Query
 * Query para obtener reportes de demanda con filtros
 */
export class GetDemandReportsQuery {
  constructor(
    public readonly pagination: PaginationQuery,
    public readonly filters?: {
      resourceType?: string;
      programId?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ) {}
}
