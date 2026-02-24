/**
 * Delete Approval Request Command
 * Comando para eliminar permanentemente una solicitud de aprobación
 */
export class DeleteApprovalRequestCommand {
  constructor(
    public readonly approvalRequestId: string,
    public readonly deletedBy: string,
  ) {}
}
