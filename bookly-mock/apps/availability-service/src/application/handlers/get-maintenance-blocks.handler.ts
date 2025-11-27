import { Injectable } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { MaintenanceBlockRepository } from "../../infrastructure/repositories/maintenance-block.repository";
import { MaintenanceBlock } from "../../infrastructure/schemas/maintenance-block.schema";
import { GetMaintenanceBlocksQuery } from "../queries/get-maintenance-blocks.query";

/**
 * Handler para obtener bloqueos de mantenimiento
 */
@QueryHandler(GetMaintenanceBlocksQuery)
@Injectable()
export class GetMaintenanceBlocksHandler
  implements IQueryHandler<GetMaintenanceBlocksQuery>
{
  constructor(private readonly repository: MaintenanceBlockRepository) {}

  async execute(query: GetMaintenanceBlocksQuery): Promise<MaintenanceBlock[]> {
    return await this.repository.findByFilters(query.filters);
  }
}
