import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { ResourceEntity } from '@resources/domain/entities/resource.entity';
import { GetResourceByIdQuery } from "../queries/get-resource-by-id.query";
import { ResourceService } from "../services/resource.service";

/**
 * Get Resource By ID Query Handler
 * Handler para obtener un recurso por ID
 */
@QueryHandler(GetResourceByIdQuery)
export class GetResourceByIdHandler
  implements IQueryHandler<GetResourceByIdQuery>
{
  constructor(private readonly resourceService: ResourceService) {}

  async execute(query: GetResourceByIdQuery): Promise<ResourceEntity> {
    return await this.resourceService.getResourceById(query.id);
  }
}
