import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { PermissionResponseDto } from '@auth/application/dtos/permission/permission-response.dto';
import { GetPermissionsByModuleQuery } from '@auth/application/queries/permissions/get-permissions-by-module.query';
import { PermissionService } from '@auth/application/services/permission.service';

/**
 * Handler para obtener permisos por módulo/recurso
 */
@QueryHandler(GetPermissionsByModuleQuery)
export class GetPermissionsByModuleHandler
  implements IQueryHandler<GetPermissionsByModuleQuery, PermissionResponseDto[]>
{
  constructor(private readonly permissionService: PermissionService) {}

  async execute(
    query: GetPermissionsByModuleQuery
  ): Promise<PermissionResponseDto[]> {
    return this.permissionService.getPermissionsByModule(query.resource);
  }
}
