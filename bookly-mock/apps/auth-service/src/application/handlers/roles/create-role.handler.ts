import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateRoleCommand } from "../../commands/roles/create-role.command";
import { RoleResponseDto } from "../../dtos/role/role-response.dto";
import { RoleService } from "../../services/role.service";

/**
 * Handler para el command CreateRole
 * Delega toda la lógica al RoleService
 */
@CommandHandler(CreateRoleCommand)
export class CreateRoleHandler implements ICommandHandler<CreateRoleCommand> {
  constructor(private readonly roleService: RoleService) {}

  async execute(command: CreateRoleCommand): Promise<RoleResponseDto> {
    const dto = {
      name: command.name,
      displayName: command.displayName,
      description: command.description,
      permissionIds: command.permissionIds,
      isActive: command.isActive,
      isDefault: command.isDefault,
    };

    return this.roleService.createRole(dto, command.createdBy);
  }
}
