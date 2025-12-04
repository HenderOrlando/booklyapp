import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { RoleResponseDto } from '@auth/application/dtos/role/role-response.dto';
import { GetActiveRolesQuery } from '@auth/application/queries/roles/get-active-roles.query';
import { RoleService } from '@auth/application/services/role.service';

/**
 * Handler para la query GetActiveRoles
 * Delega al RoleService
 */
@QueryHandler(GetActiveRolesQuery)
export class GetActiveRolesHandler
  implements IQueryHandler<GetActiveRolesQuery>
{
  constructor(private readonly roleService: RoleService) {}

  async execute(query: GetActiveRolesQuery): Promise<RoleResponseDto[]> {
    return this.roleService.getActiveRoles();
  }
}
