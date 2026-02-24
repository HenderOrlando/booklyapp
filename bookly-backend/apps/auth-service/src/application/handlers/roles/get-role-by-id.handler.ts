import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { RoleResponseDto } from '@auth/application/dtos/role/role-response.dto';
import { GetRoleByIdQuery } from '@auth/application/queries/roles/get-role-by-id.query';
import { RoleService } from '@auth/application/services/role.service';

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
