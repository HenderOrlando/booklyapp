import { PaginationQuery } from "@libs/common";

/**
 * Get Availabilities Query
 * Query para obtener disponibilidades de un recurso
 */
export class GetAvailabilitiesQuery {
  constructor(
    public readonly resourceId: string,
    public readonly pagination: PaginationQuery
  ) {}
}
