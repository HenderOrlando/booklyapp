import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { RemovePermissionsCommand } from "../../commands/roles/remove-permissions.command";
import { RoleResponseDto } from "../../dtos/role/role-response.dto";
import { RoleService } from "../../services/role.service";

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
