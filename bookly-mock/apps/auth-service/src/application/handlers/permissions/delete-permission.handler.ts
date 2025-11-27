import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DeletePermissionCommand } from "../../commands/permissions/delete-permission.command";
import { PermissionService } from "../../services/permission.service";

/**
 * Handler para eliminar un permiso
 */
@CommandHandler(DeletePermissionCommand)
export class DeletePermissionHandler
  implements ICommandHandler<DeletePermissionCommand, void>
{
  constructor(private readonly permissionService: PermissionService) {}

  async execute(command: DeletePermissionCommand): Promise<void> {
    await this.permissionService.deletePermission(command.permissionId);
  }
}
