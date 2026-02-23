import { PaginationQuery } from "@libs/common";

/**
 * Get All Waiting Lists Query
 * Query para obtener todas las entradas de lista de espera con filtros opcionales
 */
export class GetAllWaitingListsQuery {
  constructor(
    public readonly pagination: PaginationQuery,
    public readonly filters?: {
      resourceId?: string;
      userId?: string;
      isActive?: boolean;
    }
  ) {}
}
