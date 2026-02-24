/**
 * Query para obtener solo permisos activos
 */
export class GetActivePermissionsQuery {
  constructor(
    public readonly page?: number,
    public readonly limit?: number
  ) {}
}
