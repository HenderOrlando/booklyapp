import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { BulkCreatePermissionsCommand } from '@auth/application/commands/permissions/bulk-create-permissions.command";
import { PermissionResponseDto } from '@auth/application/dtos/permission/permission-response.dto";
import { PermissionService } from '@auth/application/services/permission.service";

/**
 * Handler para crear múltiples permisos
 */
@CommandHandler(BulkCreatePermissionsCommand)
export class BulkCreatePermissionsHandler
  implements
    ICommandHandler<BulkCreatePermissionsCommand, PermissionResponseDto[]>
{
  constructor(private readonly permissionService: PermissionService) {}

  async execute(
    command: BulkCreatePermissionsCommand
  ): Promise<PermissionResponseDto[]> {
    const results: PermissionResponseDto[] = [];

    for (const dto of command.permissions) {
      const permission = await this.permissionService.createPermission(
        dto,
        command.createdBy
      );
      results.push(permission);
    }

    return results;
  }
}
