import { Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { EventBus } from "@nestjs/cqrs";
import { Types } from "mongoose";
import { IReservationRepository } from "../../domain/repositories/reservation.repository.interface";
import {
  ReassignmentResponseDto,
  RequestReassignmentDto,
  ResourceAlternativeDto,
  SimilarityWeightsDto,
} from "../../infrastructure/dtos/reassignment.dto";
import { ReassignmentHistoryRepository } from "../../infrastructure/repositories/reassignment-history.repository";
import {
  ResourceForScoring,
  ResourceSimilarityService,
} from "./resource-similarity.service";
import { ResourcesEventService } from "./resources-event.service";

/**
 * Servicio de reasignación automática de recursos
 * Orquesta el proceso completo de encontrar alternativas y notificar usuarios
 */
@Injectable()
export class ReassignmentService {
  private readonly logger = new Logger(ReassignmentService.name);

  constructor(
    @Inject("IReservationRepository")
    private readonly reservationRepository: IReservationRepository,
    private readonly reassignmentHistoryRepository: ReassignmentHistoryRepository,
    private readonly similarityService: ResourceSimilarityService,
    private readonly resourcesEventService: ResourcesEventService,
    private readonly eventBus: EventBus
  ) {}

  /**
   * Solicita reasignación de un recurso
   * Encuentra alternativas y notifica al usuario
   */
  async requestReassignment(
    dto: RequestReassignmentDto,
    userId: string
  ): Promise<ReassignmentResponseDto> {
    // 1. Obtener reserva original
    const reservation = await this.reservationRepository.findById(
      dto.reservationId
    );
    if (!reservation) {
      throw new NotFoundException("Reserva no encontrada");
    }

    // 2. Obtener información del recurso original (simulado - en producción vendría de Resources Service)
    const originalResource = await this.getResourceInfo(
      reservation.resourceId.toString()
    );

    // 3. Obtener lista de recursos candidatos
    const candidateResources = await this.getCandidateResources(
      originalResource.type,
      reservation.resourceId.toString()
    );

    // 4. Verificar disponibilidad de cada candidato
    const availabilityMap = await this.checkAvailabilityForCandidates(
      candidateResources,
      reservation.startDate,
      reservation.endDate
    );

    // 5. Calcular similitud con pesos personalizados
    const weights = dto.weights
      ? Object.assign(new SimilarityWeightsDto(), dto.weights)
      : new SimilarityWeightsDto();

    const similarityResults = this.similarityService.calculateSimilarity(
      originalResource,
      candidateResources,
      weights,
      availabilityMap
    );

    // 6. Filtrar por score mínimo (60%) y obtener top 5
    const topAlternatives = this.similarityService.getTopN(
      this.similarityService.filterByMinimumScore(similarityResults, 60),
      5
    );

    // 7. Construir respuesta con detalles completos
    const alternatives: ResourceAlternativeDto[] = topAlternatives.map(
      (result) => {
        const resource = candidateResources.find(
          (r) => r.id === result.resourceId
        )!;
        const isAvailable = availabilityMap.get(resource.id) || false;

        return {
          resourceId: resource.id,
          resourceName: resource.name,
          resourceType: resource.type,
          similarityScore: result.similarityScore,
          scoreBreakdown: {
            capacity: result.scoreBreakdown.capacity,
            features: result.scoreBreakdown.features,
            location: result.scoreBreakdown.location,
            availability: result.scoreBreakdown.availability,
          },
          isAvailable,
          capacity: resource.capacity,
          features: resource.features,
          location: resource.location,
          unavailabilityReason: !isAvailable
            ? "No disponible en el horario solicitado"
            : undefined,
        };
      }
    );

    const bestAlternative = alternatives.length > 0 ? alternatives[0] : null;

    // 8. Registrar en historial
    if (bestAlternative) {
      await this.reassignmentHistoryRepository.create({
        originalReservationId: new Types.ObjectId(dto.reservationId),
        originalResourceId: new Types.ObjectId(reservation.resourceId),
        originalResourceName: originalResource.name,
        newResourceId: new Types.ObjectId(bestAlternative.resourceId),
        newResourceName: bestAlternative.resourceName,
        userId: new Types.ObjectId(userId),
        reason: dto.reason,
        similarityScore: bestAlternative.similarityScore,
        scoreBreakdown: {
          ...bestAlternative.scoreBreakdown,
          total: bestAlternative.similarityScore,
        },
        alternativesConsidered: topAlternatives.map((a) => a.resourceId),
        accepted: false, // Pending
        notificationSent: false,
      });

      // 9. Publicar evento para notificación
      await this.eventBus.publish({
        type: "reassignment.suggested",
        payload: {
          reservationId: dto.reservationId,
          userId,
          originalResourceId: originalResource.id,
          newResourceId: bestAlternative.resourceId,
          similarityScore: bestAlternative.similarityScore,
          reason: dto.reason,
          alternatives: alternatives.slice(0, 3), // Top 3
        },
      });
    }

    return {
      originalReservationId: dto.reservationId,
      originalResourceId: originalResource.id,
      originalResourceName: originalResource.name,
      alternatives,
      reason: dto.reason,
      totalAlternatives: topAlternatives.length,
      bestAlternative,
    };
  }

  /**
   * Acepta o rechaza una reasignación
   */
  async respondToReassignment(
    reassignmentId: string,
    accepted: boolean,
    newResourceId?: string,
    feedback?: string
  ): Promise<void> {
    const reassignment =
      await this.reassignmentHistoryRepository.findById(reassignmentId);
    if (!reassignment) {
      throw new NotFoundException("Reasignación no encontrada");
    }

    // Actualizar respuesta
    await this.reassignmentHistoryRepository.update(reassignmentId, {
      accepted,
      userFeedback: feedback,
      respondedAt: new Date(),
    } as any);

    // Si acepta, actualizar la reserva
    if (accepted && newResourceId) {
      await this.reservationRepository.update(
        reassignment.originalReservationId.toString(),
        {
          resourceId: new Types.ObjectId(newResourceId),
        } as any
      );

      // Publicar evento
      await this.eventBus.publish({
        type: "reassignment.accepted",
        payload: {
          reassignmentId,
          reservationId: reassignment.originalReservationId.toString(),
          newResourceId,
          userId: reassignment.userId.toString(),
        },
      });
    } else {
      // Publicar evento de rechazo
      await this.eventBus.publish({
        type: "reassignment.rejected",
        payload: {
          reassignmentId,
          reservationId: reassignment.originalReservationId.toString(),
          userId: reassignment.userId.toString(),
          feedback,
        },
      });
    }
  }

  /**
   * Obtiene información de un recurso desde Resources Service vía eventos
   */
  private async getResourceInfo(
    resourceId: string
  ): Promise<ResourceForScoring> {
    // Consultar Resources Service vía eventos (EDA)
    const resourceData =
      await this.resourcesEventService.getResourceById(resourceId);

    if (resourceData) {
      return this.resourcesEventService.toResourceForScoring(resourceData);
    }

    // Fallback: Mock data si el servicio no está disponible o no responde
    this.logger.warn(
      `Resources Service unavailable, using mock data for ${resourceId}`
    );
    return {
      id: resourceId,
      name: "Sala A-101",
      type: "CLASSROOM",
      capacity: 30,
      features: ["PROJECTOR", "WHITEBOARD", "AC", "WIFI"],
      location: "Edificio A, Piso 1",
      building: "A",
      floor: 1,
    };
  }

  /**
   * Obtiene recursos candidatos del mismo tipo desde Resources Service vía eventos
   */
  private async getCandidateResources(
    resourceType: string,
    excludeId: string
  ): Promise<ResourceForScoring[]> {
    // Consultar Resources Service vía eventos (EDA)
    const candidates = await this.resourcesEventService.getCandidateResources(
      resourceType,
      excludeId
    );

    if (candidates.length > 0) {
      return candidates.map((c) =>
        this.resourcesEventService.toResourceForScoring(c)
      );
    }

    // Fallback: Mock data
    this.logger.warn(
      `Resources Service unavailable or no candidates found, using mock data`
    );
    return [
      {
        id: "507f1f77bcf86cd799439012",
        name: "Sala A-102",
        type: "CLASSROOM",
        capacity: 32,
        features: ["PROJECTOR", "WHITEBOARD", "AC", "WIFI"],
        location: "Edificio A, Piso 1",
        building: "A",
        floor: 1,
      },
      {
        id: "507f1f77bcf86cd799439013",
        name: "Sala B-201",
        type: "CLASSROOM",
        capacity: 28,
        features: ["PROJECTOR", "WHITEBOARD", "WIFI"],
        location: "Edificio B, Piso 2",
        building: "B",
        floor: 2,
      },
      {
        id: "507f1f77bcf86cd799439014",
        name: "Sala A-103",
        type: "CLASSROOM",
        capacity: 30,
        features: ["PROJECTOR", "WHITEBOARD", "AC", "WIFI", "SPEAKERS"],
        location: "Edificio A, Piso 1",
        building: "A",
        floor: 1,
      },
    ];
  }

  /**
   * Verifica disponibilidad de candidatos vía Resources Service
   */
  private async checkAvailabilityForCandidates(
    candidates: ResourceForScoring[],
    startTime: Date,
    endTime: Date
  ): Promise<Map<string, boolean>> {
    const map = new Map<string, boolean>();

    for (const candidate of candidates) {
      // Verificar disponibilidad vía eventos (EDA)
      const isAvailable =
        await this.resourcesEventService.checkResourceAvailability(
          candidate.id,
          startTime,
          endTime
        );

      map.set(candidate.id, isAvailable);
    }

    return map;
  }
}
