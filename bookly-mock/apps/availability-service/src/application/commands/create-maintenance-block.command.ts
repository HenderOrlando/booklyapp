import { CreateMaintenanceBlockDto } from '@availability/infrastructure/dtos/maintenance-block.dto";

/**
 * Command para crear bloqueo por mantenimiento
 */
export class CreateMaintenanceBlockCommand {
  constructor(
    public readonly userId: string,
    public readonly dto: CreateMaintenanceBlockDto
  ) {}
}
