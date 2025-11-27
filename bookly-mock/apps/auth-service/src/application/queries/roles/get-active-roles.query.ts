/**
 * Query para obtener solo roles activos
 */
export class GetActiveRolesQuery {
  constructor(
    public readonly pagination?: {
      page?: number;
      limit?: number;
    }
  ) {}
}
