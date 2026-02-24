import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DeleteResourceCommand } from "../commands/delete-resource.command";
import { ResourceService } from "../services/resource.service";

/**
 * Delete Resource Command Handler
 * Handler para eliminar un recurso
 */
@CommandHandler(DeleteResourceCommand)
export class DeleteResourceHandler
  implements ICommandHandler<DeleteResourceCommand>
{
  constructor(private readonly resourceService: ResourceService) {}

  async execute(command: DeleteResourceCommand): Promise<boolean> {
    return await this.resourceService.deleteResource(command.id);
  }
}
