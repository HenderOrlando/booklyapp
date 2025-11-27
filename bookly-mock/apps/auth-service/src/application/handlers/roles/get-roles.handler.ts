import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { RoleResponseDto } from "../../dtos/role/role-response.dto";
import { GetRolesQuery } from "../../queries/roles/get-roles.query";
import { RoleService } from "../../services/role.service";

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
