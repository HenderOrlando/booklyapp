import { Injectable } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { ReassignmentHistoryRepository } from "../../infrastructure/repositories/reassignment-history.repository";
import { ReassignmentHistory } from "../../infrastructure/schemas/reassignment-history.schema";
import { GetReassignmentHistoryQuery } from "../queries/get-reassignment-history.query";

/**
 * Handler para obtener historial de reasignaciones
 */
@QueryHandler(GetReassignmentHistoryQuery)
@Injectable()
export class GetReassignmentHistoryHandler
  implements IQueryHandler<GetReassignmentHistoryQuery>
{
  constructor(private readonly repository: ReassignmentHistoryRepository) {}

  async execute(
    query: GetReassignmentHistoryQuery
  ): Promise<ReassignmentHistory[]> {
    return await this.repository.findByFilters(query.filters);
  }
}
