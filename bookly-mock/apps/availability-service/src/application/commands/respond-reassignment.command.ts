import { RespondReassignmentDto } from '@availability/infrastructure/dtos/reassignment.dto';

/**
 * Command para responder a una reasignación
 */
export class RespondReassignmentCommand {
  constructor(
    public readonly dto: RespondReassignmentDto,
    public readonly userId: string
  ) {}
}
