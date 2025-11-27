import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpdateRoleCommand } from "../../commands/roles/update-role.command";
import { RoleResponseDto } from "../../dtos/role/role-response.dto";
import { RoleService } from "../../services/role.service";

/**
 * Handler para el command UpdateRole
 * Delega toda la lógica al RoleService
 */
@CommandHandler(UpdateRoleCommand)
export class UpdateRoleHandler implements ICommandHandler<UpdateRoleCommand> {
  constructor(private readonly roleService: RoleService) {}

  async execute(command: UpdateRoleCommand): Promise<RoleResponseDto> {
    const dto = {
      displayName: command.displayName,
      description: command.description,
      permissionIds: command.permissionIds,
      isActive: command.isActive,
    };

    return this.roleService.updateRole(command.roleId, dto, command.updatedBy);
  }
}
