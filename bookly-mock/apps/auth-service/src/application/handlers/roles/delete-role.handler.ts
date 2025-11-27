import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DeleteRoleCommand } from "../../commands/roles/delete-role.command";
import { RoleService } from "../../services/role.service";

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
