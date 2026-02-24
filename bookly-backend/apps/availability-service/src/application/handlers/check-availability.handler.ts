import { createLogger } from "@libs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { CheckAvailabilityQuery } from "../queries/check-availability.query";
import { AvailabilityService } from "../services/availability.service";

const logger = createLogger("CheckAvailabilityHandler");

/**
 * Check Availability Handler
 * Handler para la query de verificar disponibilidad
 */
@QueryHandler(CheckAvailabilityQuery)
export class CheckAvailabilityHandler
  implements IQueryHandler<CheckAvailabilityQuery>
{
  constructor(private readonly availabilityService: AvailabilityService) {}

  async execute(query: CheckAvailabilityQuery): Promise<any> {
    logger.info("Executing CheckAvailabilityQuery", {
      resourceId: query.resourceId,
      startDate: query.startDate,
      endDate: query.endDate,
    });

    const result = await this.availabilityService.checkAvailability(
      query.resourceId,
      query.startDate,
      query.endDate
    );

    logger.info("Availability checked successfully", {
      isAvailable: result.isAvailable,
    });

    return result;
  }
}
