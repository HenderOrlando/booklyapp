import { PaginationQuery } from "@libs/common";

/**
 * Get Conflict Reports Query
 * Query para obtener reportes de conflictos de reserva (RF-38)
 */
export class GetConflictReportsQuery {
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
