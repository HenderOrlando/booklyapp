import { PaginationMeta } from "@libs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { ResourceEntity } from "../../domain/entities/resource.entity";
import { GetResourcesQuery } from "../queries/get-resources.query";
import { ResourceService } from "../services/resource.service";

export interface GetResourcesResponse {
  resources: ResourceEntity[];
  meta: PaginationMeta;
}

/**
 * Get Resources Query Handler
 * Handler para obtener lista paginada de recursos
 */
@QueryHandler(GetResourcesQuery)
export class GetResourcesHandler implements IQueryHandler<GetResourcesQuery> {
  constructor(private readonly resourceService: ResourceService) {}

  async execute(query: GetResourcesQuery): Promise<GetResourcesResponse> {
    return await this.resourceService.getResources(
      query.pagination,
      query.filters
    );
  }
}
