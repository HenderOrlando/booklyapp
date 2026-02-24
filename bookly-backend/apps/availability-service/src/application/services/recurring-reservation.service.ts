import {
  RecurringInstanceCancelledEvent,
  RecurringInstanceModifiedEvent,
  RecurringSeriesCancelledEvent,
  RecurringSeriesCreatedEvent,
  RecurringSeriesUpdatedEvent,
} from "@availability/domain/events/recurring-series.events";
import { IReservationRepository } from "@availability/domain/repositories";
import {
  CancelInstanceDto,
  CancelRecurringSeriesDto,
  CreateRecurringReservationDto,
  FailedInstanceDto,
  ModifyInstanceDto,
  RecurrencePatternDto,
  RecurringReservationFiltersDto,
  RecurringReservationResponseDto,
  UpdateRecurringSeriesDto,
} from "@availability/infrastructure/dtos";
import { RecurrenceType, ReservationStatus } from "@libs/common/enums";
import { createLogger } from "@libs/common";
import { Inject, Injectable, Optional } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import { RecurringReservationCacheService } from "./recurring-reservation-cache.service";
import { RecurringReservationEventPublisherService } from "./recurring-reservation-event-publisher.service";

const logger = createLogger("RecurringReservationService");

/**
 * Recurring Reservation Service
 * Servicio para gestión de reservas recurrentes
 */
@Injectable()
export class RecurringReservationService {
  private readonly BATCH_SIZE = 20; // Validar en lotes de 20

  constructor(
    @Inject("IReservationRepository")
    private readonly reservationRepository: IReservationRepository,
    @Optional()
    private readonly eventPublisher?: RecurringReservationEventPublisherService,
    @Optional()
    private readonly cacheService?: RecurringReservationCacheService
  ) {}

  /**
   * Crea una serie de reservas recurrentes
   */
  async createRecurringSeries(
    dto: CreateRecurringReservationDto,
    userId: string
  ): Promise<RecurringReservationResponseDto> {
    const startTime = Date.now();
    logger.info("Creating recurring reservation series", {
      userId,
      resourceId: dto.resourceId,
      pattern: dto.recurrencePattern,
    });

    try {
      // Validar patrón de recurrencia
      this.validateRecurrencePattern(dto.recurrencePattern);

      // Generar serie ID único
      const seriesId = `series-${uuidv4()}`;

      // Generar fechas de ocurrencias según patrón
      const occurrences = this.generateOccurrences(
        new Date(dto.startDate),
        new Date(dto.endDate),
        dto.recurrencePattern
      );

      logger.debug(`Generated ${occurrences.length} occurrences`, {
        seriesId,
        occurrences: occurrences.length,
      });

      // Validar disponibilidad para todas las instancias
      // Usar validación asíncrona optimizada si hay muchas instancias
      const useAsyncValidation = occurrences.length > 10;
      const conflicts = useAsyncValidation
        ? await this.validateSeriesAvailabilityAsync(
            dto.resourceId,
            occurrences,
            seriesId,
            {
              failFast: dto.createAllOrNone !== false, // Fail-fast si createAllOrNone=true
              useCache: true,
              batchSize: this.BATCH_SIZE,
            }
          )
        : await this.validateSeriesAvailability(
            dto.resourceId,
            occurrences,
            seriesId
          );

      logger.debug(
        `Validation completed using ${useAsyncValidation ? "async" : "sync"} method`,
        {
          conflicts: conflicts.length,
          totalOccurrences: occurrences.length,
        }
      );

      if (conflicts.length > 0 && dto.createAllOrNone !== false) {
        throw new Error(
          `Conflicts detected in ${conflicts.length} instances. Set createAllOrNone=false to create partial series.`
        );
      }

      // Crear instancias de reserva
      const instances = await this.createReservationInstances(
        dto,
        userId,
        seriesId,
        occurrences,
        conflicts
      );

      const executionTimeMs = Date.now() - startTime;

      const response: RecurringReservationResponseDto = {
        seriesId,
        masterReservationId: instances[0]?.id || "",
        instances: instances.map((inst, idx) => ({
          id: inst.id,
          instanceNumber: idx + 1,
          startDate: inst.startDate.toISOString(),
          endDate: inst.endDate.toISOString(),
          status: inst.status,
          isException: false,
        })),
        totalInstances: occurrences.length,
        successfulInstances: instances.length,
        failedInstances: conflicts,
        pattern: dto.recurrencePattern,
        executionTimeMs,
      };

      logger.info("Recurring series created successfully", {
        seriesId,
        totalInstances: response.totalInstances,
        successfulInstances: response.successfulInstances,
        failedInstances: response.failedInstances.length,
      });

      // Publicar evento de serie creada
      if (this.eventPublisher) {
        await this.eventPublisher.publishSeriesCreated(
          new RecurringSeriesCreatedEvent(
            seriesId,
            userId,
            dto.resourceId,
            new Date(dto.startDate),
            new Date(dto.endDate),
            dto.purpose,
            dto.recurrencePattern as any,
            response.totalInstances,
            instances.map((i) => i.id),
            new Date()
          )
        );
      }

      return response;
    } catch (error) {
      logger.error("Failed to create recurring series", error as Error, {
        userId,
        resourceId: dto.resourceId,
      });
      throw error;
    }
  }

  /**
   * Actualiza una serie recurrente completa o instancias futuras
   */
  async updateRecurringSeries(
    seriesId: string,
    dto: UpdateRecurringSeriesDto,
    userId: string
  ): Promise<any> {
    logger.info("Updating recurring series", { seriesId, userId });

    try {
      // Obtener todas las instancias de la serie
      const instances = await this.reservationRepository.find({
        seriesId,
        status: { $ne: ReservationStatus.CANCELLED },
      });

      if (instances.length === 0) {
        throw new Error(`Series ${seriesId} not found or already cancelled`);
      }

      const now = new Date();
      const instancesToUpdate = dto.updatePastInstances
        ? instances
        : instances.filter((inst) => new Date(inst.startDate) > now);

      logger.debug(`Updating ${instancesToUpdate.length} instances`, {
        seriesId,
        total: instances.length,
        future: instancesToUpdate.length,
      });

      // Actualizar cada instancia
      const updates = instancesToUpdate.map(async (instance) => {
        const updates: any = {
          updatedBy: userId,
        };

        if (dto.startDate) {
          const originalStart = new Date(instance.startDate);
          const newStart = new Date(dto.startDate);
          updates.startDate = newStart;

          // Mantener la duración
          if (dto.endDate) {
            updates.endDate = new Date(dto.endDate);
          }
        }

        if (dto.purpose) {
          updates.purpose = dto.purpose;
        }

        if (dto.notes) {
          updates.notes = dto.notes;
        }

        return this.reservationRepository.update(instance.id, updates);
      });

      await Promise.all(updates);

      logger.info("Recurring series updated successfully", {
        seriesId,
        updatedInstances: instancesToUpdate.length,
      });

      // Publicar evento de serie actualizada
      if (this.eventPublisher && instances.length > 0) {
        const firstInstance = instances[0];
        await this.eventPublisher.publishSeriesUpdated(
          new RecurringSeriesUpdatedEvent(
            seriesId,
            userId,
            firstInstance.resourceId,
            userId,
            {
              startDate: dto.startDate,
              endDate: dto.endDate,
              purpose: dto.purpose,
              notes: dto.notes,
            },
            instancesToUpdate.length,
            new Date()
          )
        );
      }

      return {
        seriesId,
        updatedInstances: instancesToUpdate.length,
        totalInstances: instances.length,
      };
    } catch (error) {
      logger.error("Failed to update recurring series", error as Error, {
        seriesId,
        userId,
      });
      throw error;
    }
  }

  /**
   * Cancela una serie recurrente completa o instancias futuras
   */
  async cancelRecurringSeries(
    seriesId: string,
    dto: CancelRecurringSeriesDto,
    userId: string
  ): Promise<any> {
    logger.info("Cancelling recurring series", { seriesId, userId });

    try {
      const instances = await this.reservationRepository.find({
        seriesId,
        status: { $ne: ReservationStatus.CANCELLED },
      });

      if (instances.length === 0) {
        throw new Error(`Series ${seriesId} not found or already cancelled`);
      }

      const now = new Date();
      const instancesToCancel = dto.cancelPastInstances
        ? instances
        : instances.filter((inst) => new Date(inst.startDate) > now);

      logger.debug(`Cancelling ${instancesToCancel.length} instances`, {
        seriesId,
        total: instances.length,
        toCancel: instancesToCancel.length,
      });

      const cancellations = instancesToCancel.map(async (instance) => {
        const currentAudit = instance.audit || { createdBy: userId };
        return this.reservationRepository.update(instance.id, {
          status: ReservationStatus.CANCELLED,
          audit: {
            ...currentAudit,
            cancelledBy: userId,
            cancelledAt: new Date(),
            cancellationReason: dto.reason,
          },
        });
      });

      await Promise.all(cancellations);

      logger.info("Recurring series cancelled successfully", {
        seriesId,
        cancelledInstances: instancesToCancel.length,
      });

      // Publicar evento de serie cancelada
      if (this.eventPublisher && instances.length > 0) {
        const firstInstance = instances[0];
        await this.eventPublisher.publishSeriesCancelled(
          new RecurringSeriesCancelledEvent(
            seriesId,
            userId,
            firstInstance.resourceId,
            userId,
            dto.reason || "No reason provided",
            instancesToCancel.length,
            instances.length,
            new Date()
          )
        );
      }

      return {
        seriesId,
        cancelledInstances: instancesToCancel.length,
        totalInstances: instances.length,
      };
    } catch (error) {
      logger.error("Failed to cancel recurring series", error as Error, {
        seriesId,
        userId,
      });
      throw error;
    }
  }

  /**
   * Cancela una instancia individual
   */
  async cancelRecurringInstance(
    dto: CancelInstanceDto,
    userId: string
  ): Promise<any> {
    logger.info("Cancelling recurring instance", {
      instanceId: dto.instanceId,
      userId,
    });

    try {
      const instance = await this.reservationRepository.findById(
        dto.instanceId
      );

      if (!instance) {
        throw new Error(`Instance ${dto.instanceId} not found`);
      }

      if (!instance.seriesId) {
        throw new Error(`Instance ${dto.instanceId} is not part of a series`);
      }

      const currentAudit = instance.audit || { createdBy: userId };
      await this.reservationRepository.update(dto.instanceId, {
        status: ReservationStatus.CANCELLED,
        audit: {
          ...currentAudit,
          cancelledBy: userId,
          cancelledAt: new Date(),
          cancellationReason: dto.reason,
        },
      });

      // Agregar excepción a la serie master
      const masterInstance = await this.reservationRepository.findOne({
        seriesId: instance.seriesId,
        parentReservationId: null,
      });

      if (masterInstance) {
        const exceptions = masterInstance.exceptions || [];
        exceptions.push({
          date: instance.startDate,
          reason: "cancelled",
        });

        await this.reservationRepository.update(masterInstance.id, {
          exceptions,
        });
      }

      logger.info("Recurring instance cancelled successfully", {
        instanceId: dto.instanceId,
        seriesId: instance.seriesId,
      });

      // Publicar evento de instancia cancelada
      if (this.eventPublisher) {
        await this.eventPublisher.publishInstanceCancelled(
          new RecurringInstanceCancelledEvent(
            dto.instanceId,
            instance.seriesId,
            userId,
            instance.resourceId,
            userId,
            dto.reason || "No reason provided",
            instance.startDate,
            new Date()
          )
        );
      }

      return {
        instanceId: dto.instanceId,
        seriesId: instance.seriesId,
      };
    } catch (error) {
      logger.error("Failed to cancel recurring instance", error as Error, {
        instanceId: dto.instanceId,
        userId,
      });
      throw error;
    }
  }

  /**
   * Modifica una instancia individual
   */
  async modifyRecurringInstance(
    dto: ModifyInstanceDto,
    userId: string
  ): Promise<any> {
    logger.info("Modifying recurring instance", {
      instanceId: dto.instanceId,
      userId,
    });

    try {
      const instance = await this.reservationRepository.findById(
        dto.instanceId
      );

      if (!instance) {
        throw new Error(`Instance ${dto.instanceId} not found`);
      }

      if (!instance.seriesId) {
        throw new Error(`Instance ${dto.instanceId} is not part of a series`);
      }

      const updates: any = {
        updatedBy: userId,
      };

      if (dto.newStartDate) {
        updates.startDate = new Date(dto.newStartDate);
      }

      if (dto.newEndDate) {
        updates.endDate = new Date(dto.newEndDate);
      }

      if (dto.purpose) {
        updates.purpose = dto.purpose;
      }

      await this.reservationRepository.update(dto.instanceId, updates);

      // Agregar excepción a la serie master
      const masterInstance = await this.reservationRepository.findOne({
        seriesId: instance.seriesId,
        parentReservationId: null,
      });

      if (masterInstance) {
        const exceptions = masterInstance.exceptions || [];
        exceptions.push({
          date: instance.startDate,
          reason: "modified",
          modifiedTo: updates.startDate || instance.startDate,
        });

        await this.reservationRepository.update(masterInstance.id, {
          exceptions,
        });
      }

      logger.info("Recurring instance modified successfully", {
        instanceId: dto.instanceId,
        seriesId: instance.seriesId,
      });

      // Publicar evento de instancia modificada
      if (this.eventPublisher) {
        await this.eventPublisher.publishInstanceModified(
          new RecurringInstanceModifiedEvent(
            dto.instanceId,
            instance.seriesId,
            userId,
            instance.resourceId,
            userId,
            {
              oldStartDate: instance.startDate,
              newStartDate: updates.startDate,
              oldEndDate: instance.endDate,
              newEndDate: updates.endDate,
              oldPurpose: instance.purpose,
              newPurpose: dto.purpose,
            },
            dto.reason || "Manual modification",
            new Date()
          )
        );
      }

      return {
        instanceId: dto.instanceId,
        seriesId: instance.seriesId,
      };
    } catch (error) {
      logger.error("Failed to modify recurring instance", error as Error, {
        instanceId: dto.instanceId,
        userId,
      });
      throw error;
    }
  }

  /**
   * Obtiene una serie recurrente con todas sus instancias
   */
  async getRecurringSeries(
    seriesId: string,
    includeInstances: boolean = true
  ): Promise<any> {
    logger.info("Getting recurring series", { seriesId, includeInstances });

    try {
      const instances = await this.reservationRepository.find({
        seriesId,
      });

      if (instances.length === 0) {
        throw new Error(`Series ${seriesId} not found`);
      }

      const master =
        instances.find((inst) => !inst.parentReservationId) || instances[0];

      const response: any = {
        seriesId,
        masterReservation: master,
        totalInstances: instances.length,
        pattern: master.recurringPattern,
      };

      if (includeInstances) {
        response.instances = instances
          .filter((inst) => inst.parentReservationId)
          .map((inst) => ({
            id: inst.id,
            instanceNumber: inst.instanceNumber,
            startDate: inst.startDate.toISOString(),
            endDate: inst.endDate.toISOString(),
            status: inst.status,
            isException: master.exceptions?.some(
              (ex) =>
                new Date(ex.date).getTime() ===
                new Date(inst.startDate).getTime()
            ),
          }));
      }

      logger.info("Recurring series retrieved successfully", {
        seriesId,
        instances: response.instances?.length || 0,
      });

      return response;
    } catch (error) {
      logger.error("Failed to get recurring series", error as Error, {
        seriesId,
      });
      throw error;
    }
  }

  /**
   * Obtiene las series recurrentes de un usuario con filtros
   */
  async getUserRecurringReservations(
    filters: RecurringReservationFiltersDto
  ): Promise<any> {
    logger.info("Getting user recurring reservations", { filters });

    try {
      const query: any = {
        isRecurring: true,
        parentReservationId: null, // Solo masters
      };

      if (filters.userId) {
        query.userId = filters.userId;
      }

      if (filters.resourceId) {
        query.resourceId = filters.resourceId;
      }

      if (filters.startDate || filters.endDate) {
        query.startDate = {};
        if (filters.startDate) {
          query.startDate.$gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          query.startDate.$lte = new Date(filters.endDate);
        }
      }

      if (filters.status) {
        query.status = filters.status;
      }

      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const skip = (page - 1) * limit;

      const [series, total] = await Promise.all([
        this.reservationRepository.find(query, { skip, limit }),
        this.reservationRepository.count(query),
      ]);

      const seriesWithInstances = filters.includeInstances
        ? await Promise.all(
            series.map(async (s) => {
              const instances = await this.reservationRepository.find({
                seriesId: s.seriesId,
                parentReservationId: { $ne: null },
              });
              return {
                ...s,
                instances: instances.map((inst) => ({
                  id: inst.id,
                  instanceNumber: inst.instanceNumber,
                  startDate: inst.startDate.toISOString(),
                  endDate: inst.endDate.toISOString(),
                  status: inst.status,
                })),
              };
            })
          )
        : series;

      logger.info("User recurring reservations retrieved successfully", {
        total,
        page,
        limit,
      });

      return {
        data: seriesWithInstances,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error(
        "Failed to get user recurring reservations",
        error as Error,
        { filters }
      );
      throw error;
    }
  }

  /**
   * Preview de serie recurrente sin crear instancias
   * Genera las fechas de ocurrencias y las retorna paginadas
   */
  async previewRecurringSeries(dto: {
    resourceId: string;
    startDate: string;
    endDate: string;
    recurrencePattern: RecurrencePatternDto;
    page?: number;
    limit?: number;
  }): Promise<{
    occurrences: Array<{
      startDate: string;
      endDate: string;
      instanceNumber: number;
    }>;
    totalInstances: number;
    page: number;
    limit: number;
    hasMore: boolean;
    totalPages: number;
    pattern: RecurrencePatternDto;
  }> {
    logger.info("Previewing recurring series", {
      resourceId: dto.resourceId,
      pattern: dto.recurrencePattern,
    });

    try {
      // Validar patrón de recurrencia
      this.validateRecurrencePattern(dto.recurrencePattern);

      // Generar TODAS las ocurrencias
      const allOccurrences = this.generateOccurrences(
        new Date(dto.startDate),
        new Date(dto.endDate),
        dto.recurrencePattern
      );

      const totalInstances = allOccurrences.length;

      // Paginación
      const page = dto.page || 1;
      const limit = Math.min(dto.limit || 50, 100); // Max 100 por página
      const skip = (page - 1) * limit;
      const totalPages = Math.ceil(totalInstances / limit);

      // Obtener solo la página solicitada
      const pagedOccurrences = allOccurrences.slice(skip, skip + limit);

      // Formatear respuesta
      const formattedOccurrences = pagedOccurrences.map((occ, idx) => ({
        startDate: occ.startDate.toISOString(),
        endDate: occ.endDate.toISOString(),
        instanceNumber: skip + idx + 1,
      }));

      logger.info("Preview generated successfully", {
        totalInstances,
        page,
        limit,
        returnedInstances: formattedOccurrences.length,
      });

      return {
        occurrences: formattedOccurrences,
        totalInstances,
        page,
        limit,
        hasMore: page < totalPages,
        totalPages,
        pattern: dto.recurrencePattern,
      };
    } catch (error) {
      logger.error("Failed to preview recurring series", error as Error, {
        resourceId: dto.resourceId,
      });
      throw error;
    }
  }

  /**
   * Obtiene analytics y métricas de series recurrentes
   */
  async getRecurringSeriesAnalytics(filters: {
    startDate?: string;
    endDate?: string;
    resourceId?: string;
    userId?: string;
  }): Promise<any> {
    logger.info("Getting recurring series analytics", { filters });

    try {
      const query: any = {
        isRecurring: true,
      };

      // Aplicar filtros
      if (filters.userId) {
        query.userId = filters.userId;
      }

      if (filters.resourceId) {
        query.resourceId = filters.resourceId;
      }

      if (filters.startDate || filters.endDate) {
        query.startDate = {};
        if (filters.startDate) {
          query.startDate.$gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          query.startDate.$lte = new Date(filters.endDate);
        }
      }

      // Obtener todas las reservas recurrentes
      const allReservations = await this.reservationRepository.find(query);

      // Calcular estadísticas generales
      const masters = allReservations.filter((r) => !r.parentReservationId);
      const instances = allReservations.filter((r) => r.parentReservationId);

      const usageStats = {
        totalSeries: masters.length,
        totalInstances: instances.length,
        completedInstances: instances.filter(
          (i) => i.status === ReservationStatus.COMPLETED
        ).length,
        cancelledInstances: instances.filter(
          (i) => i.status === ReservationStatus.CANCELLED
        ).length,
        pendingInstances: instances.filter(
          (i) => i.status === ReservationStatus.PENDING
        ).length,
        cancellationRate:
          instances.length > 0
            ? (instances.filter((i) => i.status === ReservationStatus.CANCELLED)
                .length /
                instances.length) *
              100
            : 0,
        averageInstancesPerSeries:
          masters.length > 0 ? instances.length / masters.length : 0,
      };

      // Top recursos más usados (simplificado)
      const resourceUsage = new Map<string, any>();
      instances.forEach((inst) => {
        if (!resourceUsage.has(inst.resourceId)) {
          resourceUsage.set(inst.resourceId, {
            resourceId: inst.resourceId,
            resourceName: `Resource ${inst.resourceId}`,
            totalSeries: 0,
            totalInstances: 0,
            totalHoursBooked: 0,
            occupancyRate: 0,
          });
        }
        const usage = resourceUsage.get(inst.resourceId);
        usage.totalInstances++;
        const duration =
          (new Date(inst.endDate).getTime() -
            new Date(inst.startDate).getTime()) /
          (1000 * 60 * 60);
        usage.totalHoursBooked += duration;
      });

      const topResources = Array.from(resourceUsage.values())
        .sort((a, b) => b.totalInstances - a.totalInstances)
        .slice(0, 10);

      // Demanda insatisfecha (simplificado - basado en instancias canceladas)
      const unsatisfiedDemand: any[] = [];

      // Patrones temporales (simplificado)
      const temporalPatterns: any[] = [];
      const hourMap = new Map<string, number>();

      instances.forEach((inst) => {
        const date = new Date(inst.startDate);
        const dayOfWeek = date.getDay();
        const hour = date.getHours();
        const key = `${dayOfWeek}-${hour}`;
        hourMap.set(key, (hourMap.get(key) || 0) + 1);
      });

      hourMap.forEach((count, key) => {
        const [dayOfWeek, hour] = key.split("-").map(Number);
        temporalPatterns.push({
          dayOfWeek,
          hour,
          totalReservations: count,
          uniqueResources: 0, // Simplificado
        });
      });

      const period = {
        startDate: filters.startDate || new Date(0).toISOString(),
        endDate:
          filters.endDate ||
          new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      };

      logger.info("Analytics generated successfully", {
        totalSeries: usageStats.totalSeries,
        totalInstances: usageStats.totalInstances,
      });

      return {
        usageStats,
        topResources,
        unsatisfiedDemand,
        temporalPatterns: temporalPatterns
          .sort((a, b) => b.totalReservations - a.totalReservations)
          .slice(0, 20),
        period,
      };
    } catch (error) {
      logger.error("Failed to generate analytics", error as Error, { filters });
      throw error;
    }
  }

  // ==================== PRIVATE METHODS ====================

  /**
   * Valida el patrón de recurrencia
   */
  private validateRecurrencePattern(pattern: RecurrencePatternDto): void {
    // Validar que tenga endDate O occurrences
    if (!pattern.endDate && !pattern.occurrences) {
      throw new Error(
        "Must specify either endDate or occurrences for recurring pattern"
      );
    }

    // Validar daysOfWeek para weekly
    if (
      pattern.frequency === RecurrenceType.WEEKLY &&
      (!pattern.daysOfWeek || pattern.daysOfWeek.length === 0)
    ) {
      throw new Error("daysOfWeek is required for weekly recurrence");
    }

    // Validar monthDay para monthly
    if (pattern.frequency === RecurrenceType.MONTHLY && !pattern.monthDay) {
      throw new Error("monthDay is required for monthly recurrence");
    }
  }

  /**
   * Genera todas las ocurrencias según el patrón
   */
  private generateOccurrences(
    startDate: Date,
    instanceEndDate: Date,
    pattern: RecurrencePatternDto
  ): Array<{ startDate: Date; endDate: Date }> {
    const occurrences: Array<{ startDate: Date; endDate: Date }> = [];
    let currentDate = new Date(startDate);

    const instanceDuration = instanceEndDate.getTime() - startDate.getTime();
    const maxOccurrences = pattern.occurrences || 365;
    const endDate = pattern.endDate ? new Date(pattern.endDate) : null;

    for (let i = 0; i < maxOccurrences; i++) {
      if (endDate && currentDate > endDate) break;

      if (this.matchesPattern(currentDate, pattern)) {
        occurrences.push({
          startDate: new Date(currentDate),
          endDate: new Date(currentDate.getTime() + instanceDuration),
        });
      }

      // Avanzar según frequency e interval
      switch (pattern.frequency) {
        case RecurrenceType.DAILY:
          currentDate.setDate(currentDate.getDate() + pattern.interval);
          break;
        case RecurrenceType.WEEKLY:
          currentDate.setDate(currentDate.getDate() + 7 * pattern.interval);
          break;
        case RecurrenceType.MONTHLY:
          currentDate.setMonth(currentDate.getMonth() + pattern.interval);
          break;
      }

      if (pattern.occurrences && occurrences.length >= pattern.occurrences) {
        break;
      }
    }

    return occurrences;
  }

  /**
   * Verifica si una fecha coincide con el patrón
   */
  private matchesPattern(date: Date, pattern: RecurrencePatternDto): boolean {
    if (
      pattern.frequency === RecurrenceType.WEEKLY &&
      pattern.daysOfWeek?.length
    ) {
      const dayOfWeek = date.getDay();
      return pattern.daysOfWeek.includes(dayOfWeek);
    }

    if (pattern.frequency === RecurrenceType.MONTHLY && pattern.monthDay) {
      return date.getDate() === pattern.monthDay;
    }

    return true;
  }

  /**
   * Valida disponibilidad de forma asíncrona con optimizaciones
   * - Batching: procesa en chunks de 20
   * - Parallel: ejecuta validaciones en paralelo
   * - Cache: usa cache de validación
   * - Fail-fast: retorna al primer conflicto si failFast=true
   */
  async validateSeriesAvailabilityAsync(
    resourceId: string,
    occurrences: Array<{ startDate: Date; endDate: Date }>,
    seriesId: string,
    options: {
      failFast?: boolean;
      useCache?: boolean;
      batchSize?: number;
    } = {}
  ): Promise<FailedInstanceDto[]> {
    const {
      failFast = false,
      useCache = true,
      batchSize = this.BATCH_SIZE,
    } = options;
    const conflicts: FailedInstanceDto[] = [];

    logger.debug("Starting async availability validation", {
      resourceId,
      occurrencesCount: occurrences.length,
      failFast,
      useCache,
      batchSize,
    });

    // Verificar cache de disponibilidad si está habilitado
    if (useCache && this.cacheService) {
      const dates = occurrences.map((o) => o.startDate);
      const cachedValidation =
        await this.cacheService.getCachedAvailabilityValidation(
          resourceId,
          dates
        );

      if (cachedValidation && !cachedValidation.isAvailable) {
        logger.debug("Cache hit: Availability validation failed (cached)", {
          resourceId,
        });
        // Retornar conflicto genérico desde cache
        return [
          {
            date: occurrences[0].startDate.toISOString(),
            reason: "Conflicto detectado (cached)",
            conflictingReservationId: "",
          },
        ];
      }
    }

    // Dividir occurrences en batches
    const batches = this.chunkArray(occurrences, batchSize);

    logger.debug(`Processing ${batches.length} batches`, {
      batchSize,
      totalOccurrences: occurrences.length,
    });

    // Procesar batches en paralelo
    for (const batch of batches) {
      const batchConflicts = await Promise.all(
        batch.map((occurrence) =>
          this.validateSingleOccurrence(resourceId, occurrence, seriesId)
        )
      );

      // Filtrar conflictos válidos
      const validConflicts = batchConflicts.filter(
        (c) => c !== null
      ) as FailedInstanceDto[];
      conflicts.push(...validConflicts);

      // Si fail-fast está habilitado y hay conflictos, retornar inmediatamente
      if (failFast && conflicts.length > 0) {
        logger.debug("Fail-fast triggered: returning first conflict", {
          conflictDate: conflicts[0].date,
        });
        break;
      }
    }

    // Cachear resultado de validación
    if (useCache && this.cacheService) {
      const isAvailable = conflicts.length === 0;
      const dates = occurrences.map((o) => o.startDate);
      await this.cacheService.cacheAvailabilityValidation(
        resourceId,
        dates,
        isAvailable,
        60 // 1 minuto TTL
      );
    }

    logger.debug("Async availability validation completed", {
      resourceId,
      conflictsFound: conflicts.length,
    });

    return conflicts;
  }

  /**
   * Valida una sola ocurrencia
   */
  private async validateSingleOccurrence(
    resourceId: string,
    occurrence: { startDate: Date; endDate: Date },
    seriesId: string
  ): Promise<FailedInstanceDto | null> {
    try {
      const existingReservations = await this.reservationRepository.find({
        resourceId,
        status: { $ne: ReservationStatus.CANCELLED },
        $or: [
          {
            startDate: { $lt: occurrence.endDate },
            endDate: { $gt: occurrence.startDate },
          },
        ],
      });

      if (existingReservations.length > 0) {
        return {
          date: occurrence.startDate.toISOString(),
          reason: "Conflicto con reserva existente",
          conflictingReservationId: existingReservations[0].id,
        };
      }

      return null;
    } catch (error) {
      logger.error("Error validating single occurrence", error as Error, {
        date: occurrence.startDate,
      });
      return {
        date: occurrence.startDate.toISOString(),
        reason: "Error al validar disponibilidad",
        conflictingReservationId: "",
      };
    }
  }

  /**
   * Divide un array en chunks del tamaño especificado
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Valida disponibilidad para toda la serie (método original - mantenido para compatibilidad)
   */
  private async validateSeriesAvailability(
    resourceId: string,
    occurrences: Array<{ startDate: Date; endDate: Date }>,
    seriesId: string
  ): Promise<FailedInstanceDto[]> {
    const conflicts: FailedInstanceDto[] = [];

    for (const occurrence of occurrences) {
      const existingReservations = await this.reservationRepository.find({
        resourceId,
        status: { $ne: ReservationStatus.CANCELLED },
        $or: [
          {
            startDate: { $lt: occurrence.endDate },
            endDate: { $gt: occurrence.startDate },
          },
        ],
      });

      if (existingReservations.length > 0) {
        conflicts.push({
          date: occurrence.startDate.toISOString(),
          reason: "Conflicto con reserva existente",
          conflictingReservationId: existingReservations[0].id,
        });
      }
    }

    return conflicts;
  }

  /**
   * Crea las instancias de reserva
   */
  private async createReservationInstances(
    dto: CreateRecurringReservationDto,
    userId: string,
    seriesId: string,
    occurrences: Array<{ startDate: Date; endDate: Date }>,
    conflicts: FailedInstanceDto[]
  ): Promise<any[]> {
    const conflictDates = new Set(conflicts.map((c) => c.date));
    const validOccurrences = occurrences.filter(
      (occ) => !conflictDates.has(occ.startDate.toISOString())
    );

    // Crear reserva master
    const masterData = {
      resourceId: dto.resourceId,
      userId,
      startDate: validOccurrences[0].startDate,
      endDate: validOccurrences[0].endDate,
      purpose: dto.purpose,
      isRecurring: true,
      seriesId,
      parentReservationId: null,
      instanceNumber: null,
      recurringPattern: dto.recurrencePattern,
      participants: dto.participants,
      notes: dto.notes,
      status: "pending",
      audit: {
        createdBy: userId,
      },
    };

    const master = await this.reservationRepository.create(masterData as any);

    // Crear instancias
    const instancePromises = validOccurrences.map(async (occurrence, idx) => {
      const instanceData = {
        resourceId: dto.resourceId,
        userId,
        startDate: occurrence.startDate,
        endDate: occurrence.endDate,
        purpose: dto.purpose,
        isRecurring: true,
        seriesId,
        parentReservationId: master.id as any,
        instanceNumber: idx + 1,
        participants: dto.participants,
        notes: dto.notes,
        status: "pending",
        audit: {
          createdBy: userId,
        },
      };

      return this.reservationRepository.create(instanceData as any);
    });

    const instances = await Promise.all(instancePromises);
    return [master, ...instances];
  }
}
