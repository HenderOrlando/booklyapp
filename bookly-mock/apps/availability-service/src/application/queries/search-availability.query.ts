import { SearchAvailabilityDto } from '@availability/infrastructure/dtos/search-availability.dto';

/**
 * Query to search available slots with advanced filters
 */
export class SearchAvailabilityQuery {
  constructor(public readonly filters: SearchAvailabilityDto) {}
}
