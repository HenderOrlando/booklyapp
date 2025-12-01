import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { SearchAvailabilityResponseDto } from '@availability/infrastructure/dtos/search-availability.dto";
import { SearchAvailabilityQuery } from "../queries/search-availability.query";
import { AvailabilityService } from "../services/availability.service";

/**
 * Handler for SearchAvailabilityQuery
 * Searches for available slots with advanced filters
 */
@QueryHandler(SearchAvailabilityQuery)
export class SearchAvailabilityHandler
  implements IQueryHandler<SearchAvailabilityQuery>
{
  constructor(private readonly availabilityService: AvailabilityService) {}

  async execute(
    query: SearchAvailabilityQuery
  ): Promise<SearchAvailabilityResponseDto> {
    return await this.availabilityService.searchAvailableSlots(query.filters);
  }
}
