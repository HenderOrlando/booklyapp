import { RequestReassignmentDto } from "../../infrastructure/dtos/reassignment.dto";

/**
 * Command para solicitar reasignación de recurso
 */
export class RequestReassignmentCommand {
  constructor(
    public readonly dto: RequestReassignmentDto,
    public readonly userId: string
  ) {}
}
