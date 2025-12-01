import { Injectable } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { AvailabilityExceptionRepository } from '@availability/infrastructure/repositories/availability-exception.repository";
import { AvailabilityException } from '@availability/infrastructure/schemas/availability-exception.schema";
import { GetAvailabilityExceptionsQuery } from "../queries/get-availability-exceptions.query";

/**
 * Handler para obtener excepciones de disponibilidad
 */
@QueryHandler(GetAvailabilityExceptionsQuery)
@Injectable()
export class GetAvailabilityExceptionsHandler
  implements IQueryHandler<GetAvailabilityExceptionsQuery>
{
  constructor(private readonly repository: AvailabilityExceptionRepository) {}

  async execute(
    query: GetAvailabilityExceptionsQuery
  ): Promise<AvailabilityException[]> {
    return await this.repository.findByFilters(query.filters);
  }
}
