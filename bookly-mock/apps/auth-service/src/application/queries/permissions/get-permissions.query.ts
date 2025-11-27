/**
 * Query para obtener permisos con filtros opcionales
 */
export class GetPermissionsQuery {
  constructor(
    public readonly filters?: {
      resource?: string;
      action?: string;
      isActive?: boolean;
      search?: string; // Buscar en name, description o code
    },
    public readonly pagination?: {
      page?: number;
      limit?: number;
    }
  ) {}
}
