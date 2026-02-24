import { PaginationQuery } from "@libs/common";
import { ResourceStatus, ResourceType } from "@libs/common/enums";

/**
 * Get Resources Query
 * Query para obtener lista de recursos con paginación y filtros
 */
export class GetResourcesQuery {
  constructor(
    public readonly pagination: PaginationQuery,
    public readonly filters?: {
      type?: ResourceType;
      categoryId?: string;
      programId?: string;
      status?: ResourceStatus | ResourceStatus[];
      isActive?: boolean;
      location?: string;
      building?: string;
      minCapacity?: number;
      maxCapacity?: number;
      search?: string;
    },
  ) {}
}
