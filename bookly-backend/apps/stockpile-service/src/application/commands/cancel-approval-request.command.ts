/**
 * Cancel Approval Request Command
 * Comando para cancelar una solicitud de aprobación
 */
export class CancelApprovalRequestCommand {
  constructor(
    public readonly approvalRequestId: string,
    public readonly cancelledBy: string,
    public readonly reason?: string,
    public readonly securityInfo?: { ipAddress?: string; userAgent?: string }
  ) {}
}
