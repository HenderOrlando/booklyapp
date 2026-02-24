/**
 * Comando para iniciar un mantenimiento programado
 */
export class StartMaintenanceCommand {
  constructor(
    public readonly maintenanceId: string,
    public readonly userId: string
  ) {}
}
