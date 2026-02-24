import { ApprovalStep } from '@stockpile/domain/entities/approval-flow.entity';

/**
 * Create Approval Flow Command
 * Comando para crear un nuevo flujo de aprobación
 */
export class CreateApprovalFlowCommand {
  constructor(
    public readonly name: string,
    public readonly description: string,
    public readonly resourceTypes: string[],
    public readonly steps: ApprovalStep[],
    public readonly autoApproveConditions?: Record<string, any>,
    public readonly createdBy?: string
  ) {}
}
