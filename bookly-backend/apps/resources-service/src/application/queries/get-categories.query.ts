import { PaginationQuery } from "@libs/common";

/**
 * Get Categories Query
 * Query para obtener lista de categorías con paginación
 */
export class GetCategoriesQuery {
  constructor(public readonly pagination: PaginationQuery) {}
}
