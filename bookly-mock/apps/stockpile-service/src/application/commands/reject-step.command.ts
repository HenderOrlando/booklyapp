/**
 * Reject Step Command
 * Comando para rechazar un paso del flujo de aprobación
 */
export class RejectStepCommand {
  constructor(
    public readonly approvalRequestId: string,
    public readonly approverId: string,
    public readonly stepName: string,
    public readonly comment?: string,
    public readonly securityInfo?: { ipAddress?: string; userAgent?: string }
  ) {}
}
