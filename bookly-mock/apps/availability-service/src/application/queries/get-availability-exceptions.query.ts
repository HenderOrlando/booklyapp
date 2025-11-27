import { QueryAvailabilityExceptionsDto } from "../../infrastructure/dtos/availability-exception.dto";

/**
 * Query para obtener excepciones de disponibilidad
 */
export class GetAvailabilityExceptionsQuery {
  constructor(public readonly filters: QueryAvailabilityExceptionsDto) {}
}
