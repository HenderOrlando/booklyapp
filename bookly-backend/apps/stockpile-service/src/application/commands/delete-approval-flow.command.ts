/**
 * Delete Approval Flow Command
 * Comando para eliminar permanentemente un flujo de aprobación
 */
export class DeleteApprovalFlowCommand {
  constructor(
    public readonly flowId: string,
    public readonly deletedBy: string,
  ) {}
}
