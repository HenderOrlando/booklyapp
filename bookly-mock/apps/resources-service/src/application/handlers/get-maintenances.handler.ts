import { PaginationMeta } from "@libs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { MaintenanceEntity } from '@resources/domain/entities/maintenance.entity";
import { GetMaintenancesQuery } from "../queries/get-maintenances.query";
import { MaintenanceService } from "../services/maintenance.service";

export interface GetMaintenancesResponse {
  maintenances: MaintenanceEntity[];
  meta: PaginationMeta;
}

/**
 * Get Maintenances Query Handler
 * Handler para obtener lista paginada de mantenimientos
 */
@QueryHandler(GetMaintenancesQuery)
export class GetMaintenancesHandler
  implements IQueryHandler<GetMaintenancesQuery>
{
  constructor(private readonly maintenanceService: MaintenanceService) {}

  async execute(query: GetMaintenancesQuery): Promise<GetMaintenancesResponse> {
    return await this.maintenanceService.getMaintenances(
      query.pagination,
      query.filters
    );
  }
}
