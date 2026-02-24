/**
 * Get Active Today Approvals Query
 * Consulta para obtener aprobaciones activas del día (para vigilantes)
 * RF-23: Visualización de reservas aprobadas para vigilante con filtros y paginación
 */
export class GetActiveTodayApprovalsQuery {
  constructor(
    public readonly date?: string, // ISO date (default: hoy)
    public readonly page: number = 1,
    public readonly limit: number = 20,
    public readonly filters?: {
      resourceId?: string;
      programId?: string;
      resourceType?: string;
    }
  ) {}
}
