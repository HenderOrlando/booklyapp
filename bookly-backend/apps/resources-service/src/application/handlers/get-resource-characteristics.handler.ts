import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetResourceCharacteristicsQuery } from "@resources/application/queries";
import { ResourceService } from "@resources/application/services";

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
