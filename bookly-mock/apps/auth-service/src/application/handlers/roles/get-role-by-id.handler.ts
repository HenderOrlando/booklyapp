import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { RoleResponseDto } from "../../dtos/role/role-response.dto";
import { GetRoleByIdQuery } from "../../queries/roles/get-role-by-id.query";
import { RoleService } from "../../services/role.service";

/**
 * Handler para la query GetRoleById
 * Delega al RoleService
 */
@QueryHandler(GetRoleByIdQuery)
export class GetRoleByIdHandler implements IQueryHandler<GetRoleByIdQuery> {
  constructor(private readonly roleService: RoleService) {}

  async execute(query: GetRoleByIdQuery): Promise<RoleResponseDto> {
    return this.roleService.getRoleById(query.roleId);
  }
}
