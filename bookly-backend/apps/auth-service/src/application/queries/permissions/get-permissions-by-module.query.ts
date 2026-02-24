/**
 * Query para obtener permisos filtrados por módulo/recurso
 */
export class GetPermissionsByModuleQuery {
  constructor(
    public readonly resource: string,
    public readonly pagination?: {
      page?: number;
      limit?: number;
    }
  ) {}
}
