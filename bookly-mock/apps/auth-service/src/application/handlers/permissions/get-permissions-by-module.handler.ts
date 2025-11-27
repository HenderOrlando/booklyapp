import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { PermissionResponseDto } from "../../dtos/permission/permission-response.dto";
import { GetPermissionsByModuleQuery } from "../../queries/permissions/get-permissions-by-module.query";
import { PermissionService } from "../../services/permission.service";

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
