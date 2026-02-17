/**
 * Query para obtener roles con filtros opcionales
 */
export class GetRolesQuery {
  constructor(
    public readonly filters?: {
      name?: string;
      isActive?: boolean;
      isDefault?: boolean;
      search?: string; // Buscar en displayName o description
    },
    public readonly pagination?: {
      page?: number;
      limit?: number;
    },
  ) {}
}
