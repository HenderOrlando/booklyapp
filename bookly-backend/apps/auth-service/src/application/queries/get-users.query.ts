import { PaginationQuery } from "@libs/common";

/**
 * Get Users Query
 * Query para obtener lista de usuarios con paginación
 */
export class GetUsersQuery {
  constructor(
    public readonly pagination: PaginationQuery,
    public readonly filters?: {
      email?: string;
      role?: string;
      isActive?: boolean;
    },
  ) {}
}
