import { PaginationQuery } from "@libs/common";

/**
 * Get User Reports Query
 * Query para obtener reportes de usuario con filtros
 */
export class GetUserReportsQuery {
  constructor(
    public readonly pagination: PaginationQuery,
    public readonly filters?: {
      userId?: string;
      userType?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ) {}
}
