import { PaginationQuery } from "@libs/common";

/**
 * Get Usage Reports Query
 * Query para obtener reportes de uso con filtros
 */
export class GetUsageReportsQuery {
  constructor(
    public readonly pagination: PaginationQuery,
    public readonly filters?: {
      resourceId?: string;
      resourceType?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ) {}
}
