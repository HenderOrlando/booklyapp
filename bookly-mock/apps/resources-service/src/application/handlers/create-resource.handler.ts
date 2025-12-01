import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ResourceEntity } from '@resources/domain/entities/resource.entity";
import { CreateResourceCommand } from "../commands/create-resource.command";
import { ResourceService } from "../services/resource.service";

/**
 * Create Resource Command Handler
 * Handler para crear un nuevo recurso
 */
@CommandHandler(CreateResourceCommand)
export class CreateResourceHandler
  implements ICommandHandler<CreateResourceCommand>
{
  constructor(private readonly resourceService: ResourceService) {}

  async execute(command: CreateResourceCommand): Promise<ResourceEntity> {
    return await this.resourceService.createResource({
      code: command.code,
      name: command.name,
      description: command.description,
      type: command.type,
      categoryId: command.categoryId,
      capacity: command.capacity,
      location: command.location,
      floor: command.floor,
      building: command.building,
      attributes: command.attributes,
      programIds: command.programIds,
      availabilityRules: command.availabilityRules,
      audit: command.createdBy
        ? {
            createdBy: command.createdBy,
          }
        : undefined,
    });
  }
}
