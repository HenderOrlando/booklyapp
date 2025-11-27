/**
 * Comando para cancelar un mantenimiento
 */
export class CancelMaintenanceCommand {
  constructor(
    public readonly maintenanceId: string,
    public readonly userId: string,
    public readonly reason?: string
  ) {}
}
