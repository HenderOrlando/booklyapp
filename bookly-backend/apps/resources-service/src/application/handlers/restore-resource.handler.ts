import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { RestoreResourceCommand } from "../commands/restore-resource.command";
import { ResourceService } from "../services/resource.service";

/**
 * Restore Resource Command Handler
 * Handler para restaurar un recurso eliminado
 */
@CommandHandler(RestoreResourceCommand)
export class RestoreResourceHandler
  implements ICommandHandler<RestoreResourceCommand>
{
  constructor(private readonly resourceService: ResourceService) {}

  async execute(command: RestoreResourceCommand): Promise<boolean> {
    return await this.resourceService.restoreResource(
      command.id,
      command.restoredBy
    );
  }
}
