import { PaginationMeta } from "@libs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { ResourceEntity } from "../../domain/entities/resource.entity";
import { SearchResourcesAdvancedQuery } from "../queries/search-resources-advanced.query";
import { ResourceService } from "../services/resource.service";

/**
 * Search Resources Advanced Query Handler
 * Handler para búsqueda avanzada de recursos con filtros complejos
 */
@QueryHandler(SearchResourcesAdvancedQuery)
export class SearchResourcesAdvancedHandler
  implements
    IQueryHandler<
      SearchResourcesAdvancedQuery,
      { resources: ResourceEntity[]; meta: PaginationMeta }
    >
{
  constructor(private readonly resourceService: ResourceService) {}

  async execute(
    query: SearchResourcesAdvancedQuery
  ): Promise<{ resources: ResourceEntity[]; meta: PaginationMeta }> {
    return await this.resourceService.searchResourcesAdvanced({
      types: query.types,
      minCapacity: query.minCapacity,
      maxCapacity: query.maxCapacity,
      categoryIds: query.categoryIds,
      programIds: query.programIds,
      hasEquipment: query.hasEquipment,
      location: query.location,
      building: query.building,
      status: query.status,
      availableOn: query.availableOn,
      page: query.page,
      limit: query.limit,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });
  }
}
