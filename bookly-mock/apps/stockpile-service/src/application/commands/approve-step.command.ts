/**
 * Approve Step Command
 * Comando para aprobar un paso del flujo de aprobación
 */
export class ApproveStepCommand {
  constructor(
    public readonly approvalRequestId: string,
    public readonly approverId: string,
    public readonly stepName: string,
    public readonly comment?: string,
    public readonly securityInfo?: { ipAddress?: string; userAgent?: string }
  ) {}
}
