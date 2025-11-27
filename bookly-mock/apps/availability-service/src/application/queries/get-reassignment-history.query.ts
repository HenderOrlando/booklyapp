import { GetReassignmentHistoryDto } from "../../infrastructure/dtos/reassignment.dto";

/**
 * Query para obtener historial de reasignaciones
 */
export class GetReassignmentHistoryQuery {
  constructor(public readonly filters: GetReassignmentHistoryDto) {}
}
