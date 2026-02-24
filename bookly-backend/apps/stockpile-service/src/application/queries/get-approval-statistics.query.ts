/**
 * Get Approval Statistics Query
 * Consulta para obtener estadísticas de aprobaciones
 */
export class GetApprovalStatisticsQuery {
  constructor(
    public readonly filters?: {
      startDate?: Date;
      endDate?: Date;
      approvalFlowId?: string;
    }
  ) {}
}
