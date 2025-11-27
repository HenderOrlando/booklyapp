/**
 * Query para obtener solo roles del sistema (isDefault = true)
 * Estos roles no pueden ser eliminados
 */
export class GetSystemRolesQuery {
  constructor(
    public readonly pagination?: {
      page?: number;
      limit?: number;
    }
  ) {}
}
