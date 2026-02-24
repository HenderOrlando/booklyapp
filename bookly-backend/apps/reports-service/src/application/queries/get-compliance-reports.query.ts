import { PaginationQuery } from "@libs/common";

/**
 * Get Compliance Reports Query
 * Query para obtener reportes de cumplimiento de reserva (RF-39)
 */
export class GetComplianceReportsQuery {
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
