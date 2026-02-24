import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpdateRoleCommand } from '@auth/application/commands/roles/update-role.command';
import { RoleResponseDto } from '@auth/application/dtos/role/role-response.dto';
import { RoleService } from '@auth/application/services/role.service';

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
