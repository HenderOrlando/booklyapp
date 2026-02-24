import { MaintenanceType } from "@libs/common/enums";
import { PaginationQuery } from "@libs/common";
import { MaintenanceStatus } from '@resources/domain/entities/maintenance.entity';

/**
 * Get Maintenances Query
 * Query para obtener lista de mantenimientos con paginación y filtros
 */
export class GetMaintenancesQuery {
  constructor(
    public readonly pagination: PaginationQuery,
    public readonly filters?: {
      resourceId?: string;
      type?: MaintenanceType;
      status?: MaintenanceStatus;
    }
  ) {}
}
