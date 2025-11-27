import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ResourceEntity } from "../../domain/entities/resource.entity";
import { UpdateResourceCommand } from "../commands/update-resource.command";
import { ResourceService } from "../services/resource.service";

/**
 * Update Resource Command Handler
 * Handler para actualizar un recurso existente
 */
@CommandHandler(UpdateResourceCommand)
export class UpdateResourceHandler
  implements ICommandHandler<UpdateResourceCommand>
{
  constructor(private readonly resourceService: ResourceService) {}

  async execute(command: UpdateResourceCommand): Promise<ResourceEntity> {
    const updateData: any = { ...command.data };

    if (command.updatedBy) {
      updateData.audit = {
        updatedBy: command.updatedBy,
      };
    }

    return await this.resourceService.updateResource(command.id, updateData);
  }
}
