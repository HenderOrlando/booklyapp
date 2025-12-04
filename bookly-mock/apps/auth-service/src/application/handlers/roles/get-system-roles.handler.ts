import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { RoleResponseDto } from '@auth/application/dtos/role/role-response.dto';
import { GetSystemRolesQuery } from '@auth/application/queries/roles/get-system-roles.query';
import { RoleService } from '@auth/application/services/role.service';

/**
 * Handler para la query GetSystemRoles
 * Delega al RoleService
 */
@QueryHandler(GetSystemRolesQuery)
export class GetSystemRolesHandler
  implements IQueryHandler<GetSystemRolesQuery>
{
  constructor(private readonly roleService: RoleService) {}

  async execute(query: GetSystemRolesQuery): Promise<RoleResponseDto[]> {
    return this.roleService.getSystemRoles();
  }
}
