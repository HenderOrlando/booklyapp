import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DeleteRoleCommand } from '@auth/application/commands/roles/delete-role.command";
import { RoleService } from '@auth/application/services/role.service";

/**
 * Handler para el command DeleteRole
 * Delega toda la lógica al RoleService
 */
@CommandHandler(DeleteRoleCommand)
export class DeleteRoleHandler implements ICommandHandler<DeleteRoleCommand> {
  constructor(private readonly roleService: RoleService) {}

  async execute(command: DeleteRoleCommand): Promise<void> {
    await this.roleService.deleteRole(command.roleId);
  }
}
