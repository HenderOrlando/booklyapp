/**
 * Tipos compartidos para clientes HTTP
 * Centraliza interfaces y tipos comunes usados por todos los clientes
 */

/**
 * Estructura de respuesta paginada estándar
 * Usado por todos los endpoints que retornan listas
 */
export interface PaginatedResponse<T> {
  items: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages?: number;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
  };
}

/**
 * Filtros base para paginación
 */
export interface PaginationFilters {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
