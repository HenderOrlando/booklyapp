import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { PermissionResponseDto } from '@auth/application/dtos/permission/permission-response.dto";
import { GetActivePermissionsQuery } from '@auth/application/queries/permissions/get-active-permissions.query";
import { PermissionService } from '@auth/application/services/permission.service";

/**
 * Handler para obtener solo permisos activos
 */
@QueryHandler(GetActivePermissionsQuery)
export class GetActivePermissionsHandler
  implements IQueryHandler<GetActivePermissionsQuery, PermissionResponseDto[]>
{
  constructor(private readonly permissionService: PermissionService) {}

  async execute(
    query: GetActivePermissionsQuery
  ): Promise<PermissionResponseDto[]> {
    return this.permissionService.getActivePermissions();
  }
}
