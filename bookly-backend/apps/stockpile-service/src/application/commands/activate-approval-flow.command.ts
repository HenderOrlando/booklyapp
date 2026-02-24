/**
 * Activate Approval Flow Command
 * Comando para activar un flujo de aprobación desactivado
 */
export class ActivateApprovalFlowCommand {
  constructor(
    public readonly flowId: string,
    public readonly updatedBy: string,
  ) {}
}
