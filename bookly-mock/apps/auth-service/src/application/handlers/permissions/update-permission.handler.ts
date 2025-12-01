import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpdatePermissionCommand } from '@auth/application/commands/permissions/update-permission.command";
import { PermissionResponseDto } from '@auth/application/dtos/permission/permission-response.dto";
import { PermissionService } from '@auth/application/services/permission.service";

/**
 * Handler para actualizar un permiso
 */
@CommandHandler(UpdatePermissionCommand)
export class UpdatePermissionHandler
  implements ICommandHandler<UpdatePermissionCommand, PermissionResponseDto>
{
  constructor(private readonly permissionService: PermissionService) {}

  async execute(
    command: UpdatePermissionCommand
  ): Promise<PermissionResponseDto> {
    const dto = {
      name: command.name,
      description: command.description,
      isActive: command.isActive,
    };

    return this.permissionService.updatePermission(
      command.permissionId,
      dto,
      command.updatedBy
    );
  }
}
