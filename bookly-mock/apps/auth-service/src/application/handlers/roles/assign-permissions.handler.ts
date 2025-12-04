import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { AssignPermissionsCommand } from '@auth/application/commands/roles/assign-permissions.command';
import { RoleResponseDto } from '@auth/application/dtos/role/role-response.dto';
import { RoleService } from '@auth/application/services/role.service';

/**
 * Handler para asignar permisos a un rol
 */
@CommandHandler(AssignPermissionsCommand)
export class AssignPermissionsHandler
  implements ICommandHandler<AssignPermissionsCommand, RoleResponseDto>
{
  constructor(private readonly roleService: RoleService) {}

  async execute(command: AssignPermissionsCommand): Promise<RoleResponseDto> {
    return this.roleService.assignPermissions(
      command.roleId,
      command.permissionIds
    );
  }
}
