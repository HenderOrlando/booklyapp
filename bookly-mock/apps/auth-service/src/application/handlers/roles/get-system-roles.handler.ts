import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { RoleResponseDto } from "../../dtos/role/role-response.dto";
import { GetSystemRolesQuery } from "../../queries/roles/get-system-roles.query";
import { RoleService } from "../../services/role.service";

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
