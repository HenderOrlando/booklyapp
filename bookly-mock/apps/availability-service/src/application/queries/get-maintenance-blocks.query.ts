import { QueryMaintenanceBlocksDto } from "../../infrastructure/dtos/maintenance-block.dto";

/**
 * Query para obtener bloqueos de mantenimiento
 */
export class GetMaintenanceBlocksQuery {
  constructor(public readonly filters: QueryMaintenanceBlocksDto) {}
}
