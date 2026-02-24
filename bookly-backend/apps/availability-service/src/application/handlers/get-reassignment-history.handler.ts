import { Injectable } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { ReassignmentHistoryRepository } from '@availability/infrastructure/repositories/reassignment-history.repository';
import { ReassignmentHistoryResponseDto } from '@availability/infrastructure/dtos/reassignment.dto';
import { GetReassignmentHistoryQuery } from "../queries/get-reassignment-history.query";

/**
 * Handler para obtener historial de reasignaciones
 * Mapea documentos Mongoose (lean) al DTO de respuesta del frontend
 */
@QueryHandler(GetReassignmentHistoryQuery)
@Injectable()
export class GetReassignmentHistoryHandler
  implements IQueryHandler<GetReassignmentHistoryQuery>
{
  constructor(private readonly repository: ReassignmentHistoryRepository) {}

  async execute(
    query: GetReassignmentHistoryQuery
  ): Promise<ReassignmentHistoryResponseDto[]> {
    const results = await this.repository.findByFilters(query.filters);

    return results.map((doc: any) => ({
      id: (doc._id ?? doc.id)?.toString(),
      originalReservationId: doc.originalReservationId?.toString(),
      originalResource: {
        id: doc.originalResourceId?.toString(),
        name: doc.originalResourceName ?? "",
      },
      newResource: {
        id: doc.newResourceId?.toString(),
        name: doc.newResourceName ?? "",
      },
      userId: doc.userId?.toString(),
      reason: doc.reason,
      similarityScore: doc.similarityScore,
      scoreBreakdown: doc.scoreBreakdown,
      alternativesConsidered: doc.alternativesConsidered ?? [],
      accepted: doc.accepted,
      userFeedback: doc.userFeedback,
      notificationSent: doc.notificationSent ?? false,
      notifiedAt: doc.notifiedAt,
      respondedAt: doc.respondedAt,
      createdAt: doc.createdAt,
    }));
  }
}
