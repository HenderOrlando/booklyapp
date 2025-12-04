import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { RemovePermissionsCommand } from '@auth/application/commands/roles/remove-permissions.command';
import { RoleResponseDto } from '@auth/application/dtos/role/role-response.dto';
import { RoleService } from '@auth/application/services/role.service';

/**
 * Handler para remover permisos de un rol
 */
@CommandHandler(RemovePermissionsCommand)
export class RemovePermissionsHandler
  implements ICommandHandler<RemovePermissionsCommand, RoleResponseDto>
{
  constructor(private readonly roleService: RoleService) {}

  async execute(command: RemovePermissionsCommand): Promise<RoleResponseDto> {
    return this.roleService.removePermissions(
      command.roleId,
      command.permissionIds
    );
  }
}
