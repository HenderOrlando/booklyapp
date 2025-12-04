import { CancelMaintenanceDto } from '@availability/infrastructure/dtos/maintenance-block.dto';

/**
 * Command para cancelar mantenimiento
 */
export class CancelMaintenanceBlockCommand {
  constructor(
    public readonly blockId: string,
    public readonly userId: string,
    public readonly dto: CancelMaintenanceDto
  ) {}
}
