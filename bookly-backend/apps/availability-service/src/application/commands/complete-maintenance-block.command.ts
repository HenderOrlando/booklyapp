import { CompleteMaintenanceDto } from '@availability/infrastructure/dtos/maintenance-block.dto';

/**
 * Command para completar mantenimiento
 */
export class CompleteMaintenanceBlockCommand {
  constructor(
    public readonly blockId: string,
    public readonly userId: string,
    public readonly dto?: CompleteMaintenanceDto
  ) {}
}
