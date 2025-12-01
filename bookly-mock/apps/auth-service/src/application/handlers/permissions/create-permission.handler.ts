import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreatePermissionCommand } from '@auth/application/commands/permissions/create-permission.command";
import { PermissionResponseDto } from '@auth/application/dtos/permission/permission-response.dto";
import { PermissionService } from '@auth/application/services/permission.service";

/**
 * Handler para crear un permiso
 */
@CommandHandler(CreatePermissionCommand)
export class CreatePermissionHandler
  implements ICommandHandler<CreatePermissionCommand, PermissionResponseDto>
{
  constructor(private readonly permissionService: PermissionService) {}

  async execute(
    command: CreatePermissionCommand
  ): Promise<PermissionResponseDto> {
    const dto = {
      code: command.code,
      name: command.name,
      description: command.description,
      resource: command.resource,
      action: command.action,
      isActive: command.isActive,
    };

    return this.permissionService.createPermission(dto, command.createdBy);
  }
}
