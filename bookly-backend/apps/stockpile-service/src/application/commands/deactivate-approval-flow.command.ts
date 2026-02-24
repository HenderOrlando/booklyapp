/**
 * Deactivate Approval Flow Command
 * Comando para desactivar un flujo de aprobación
 */
export class DeactivateApprovalFlowCommand {
  constructor(
    public readonly flowId: string,
    public readonly updatedBy: string
  ) {}
}
