import { ResourceStatus, ResourceType } from "@libs/common/enums";

/**
 * Search Resources Advanced Query
 * Query para búsqueda avanzada de recursos con múltiples filtros
 */
export class SearchResourcesAdvancedQuery {
  constructor(
    public readonly types?: ResourceType[],
    public readonly minCapacity?: number,
    public readonly maxCapacity?: number,
    public readonly categoryIds?: string[],
    public readonly programIds?: string[],
    public readonly hasEquipment?: string[],
    public readonly location?: string,
    public readonly building?: string,
    public readonly status?: ResourceStatus,
    public readonly availableOn?: string,
    public readonly page: number = 1,
    public readonly limit: number = 10,
    public readonly sortBy: string = "createdAt",
    public readonly sortOrder: "asc" | "desc" = "desc"
  ) {}
}
