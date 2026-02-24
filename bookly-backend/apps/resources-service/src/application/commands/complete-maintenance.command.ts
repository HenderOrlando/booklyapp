/**
 * Comando para completar un mantenimiento
 */
export class CompleteMaintenanceCommand {
  constructor(
    public readonly maintenanceId: string,
    public readonly userId: string,
    public readonly cost?: number,
    public readonly notes?: string
  ) {}
}
