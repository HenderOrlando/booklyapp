import { ApprovalStep } from '@stockpile/domain/entities/approval-flow.entity";

/**
 * Update Approval Flow Command
 * Comando para actualizar un flujo de aprobación
 */
export class UpdateApprovalFlowCommand {
  constructor(
    public readonly flowId: string,
    public readonly name?: string,
    public readonly description?: string,
    public readonly resourceTypes?: string[],
    public readonly steps?: ApprovalStep[],
    public readonly autoApproveConditions?: Record<string, any>,
    public readonly updatedBy?: string
  ) {}
}
