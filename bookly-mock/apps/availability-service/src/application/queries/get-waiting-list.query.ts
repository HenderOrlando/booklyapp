import { PaginationQuery } from "@libs/common";

/**
 * Get Waiting List Query
 * Query para obtener lista de espera de un recurso
 */
export class GetWaitingListQuery {
  constructor(
    public readonly resourceId: string,
    public readonly pagination: PaginationQuery
  ) {}
}
