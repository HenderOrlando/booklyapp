import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetResourceCharacteristicsQuery } from "../queries/get-resource-characteristics.query";
import { ResourceService } from "../services/resource.service";

/**
 * Get Resource Characteristics Query Handler
 * Handler para listar características de recursos desde reference_data
 */
@QueryHandler(GetResourceCharacteristicsQuery)
export class GetResourceCharacteristicsHandler
  implements IQueryHandler<GetResourceCharacteristicsQuery>
{
  constructor(private readonly resourceService: ResourceService) {}

  async execute(query: GetResourceCharacteristicsQuery) {
    return await this.resourceService.getResourceCharacteristics(
      query.onlyActive,
    );
  }
}
