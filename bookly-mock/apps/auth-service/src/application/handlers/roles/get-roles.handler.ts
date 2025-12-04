import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { RoleResponseDto } from '@auth/application/dtos/role/role-response.dto';
import { GetRolesQuery } from '@auth/application/queries/roles/get-roles.query';
import { RoleService } from '@auth/application/services/role.service';

/**
 * Handler para la query GetRoles
 * Delega al RoleService
 */
@QueryHandler(GetRolesQuery)
export class GetRolesHandler implements IQueryHandler<GetRolesQuery> {
  constructor(private readonly roleService: RoleService) {}

  async execute(query: GetRolesQuery): Promise<RoleResponseDto[]> {
    return this.roleService.getRoles(query.filters);
  }
}
