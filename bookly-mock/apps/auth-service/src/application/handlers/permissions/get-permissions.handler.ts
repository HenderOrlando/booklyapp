import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { PermissionResponseDto } from "../../dtos/permission/permission-response.dto";
import { GetPermissionsQuery } from "../../queries/permissions/get-permissions.query";
import { PermissionService } from "../../services/permission.service";

/**
 * Handler para obtener permisos con filtros
 */
@QueryHandler(GetPermissionsQuery)
export class GetPermissionsHandler
  implements IQueryHandler<GetPermissionsQuery, PermissionResponseDto[]>
{
  constructor(private readonly permissionService: PermissionService) {}

  async execute(query: GetPermissionsQuery): Promise<PermissionResponseDto[]> {
    return this.permissionService.getPermissions(query.filters);
  }
}
