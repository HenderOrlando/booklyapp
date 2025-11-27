/**
 * Create Approval Request Command
 * Comando para crear una nueva solicitud de aprobación
 */
export class CreateApprovalRequestCommand {
  constructor(
    public readonly reservationId: string,
    public readonly requesterId: string,
    public readonly approvalFlowId: string,
    public readonly metadata?: Record<string, any>,
    public readonly createdBy?: string
  ) {}
}
