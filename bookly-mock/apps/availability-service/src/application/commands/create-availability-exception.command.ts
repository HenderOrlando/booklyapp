import { CreateAvailabilityExceptionDto } from '@availability/infrastructure/dtos/availability-exception.dto";

/**
 * Command para crear excepción de disponibilidad
 */
export class CreateAvailabilityExceptionCommand {
  constructor(
    public readonly userId: string,
    public readonly dto: CreateAvailabilityExceptionDto
  ) {}
}
