import {
  AvailableSlotDto,
  SearchAvailabilityDto,
  SearchAvailabilityResponseDto,
} from "@availability/infrastructure/dtos";
import { SortByField, SortOrder, WeekDay } from "@libs/common/enums";
import { createLogger } from "@libs/common";
import { RedisService } from "@libs/redis";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { AvailabilityEntity } from '@availability/domain/entities/availability.entity';
import { IResourceMetadataRepository } from '@availability/domain/interfaces/resource-metadata.interface';
import { IAvailabilityRepository } from '@availability/domain/repositories/availability.repository.interface';
import { IReservationRepository } from '@availability/domain/repositories/reservation.repository.interface';

const logger = createLogger("AvailabilityService");

/**
 * Availability Service
 * Servicio de aplicación para gestión de disponibilidad
 */
@Injectable()
export class AvailabilityService {
  constructor(
    @Inject("IAvailabilityRepository")
    private readonly availabilityRepository: IAvailabilityRepository,
    @Inject("IReservationRepository")
    private readonly reservationRepository: IReservationRepository,
    @Inject("IResourceMetadataRepository")
    private readonly resourceMetadataRepository: IResourceMetadataRepository,
    private readonly redisService: RedisService
  ) {}

  /**
   * Crea una nueva disponibilidad
   */
  async createAvailability(data: {
    resourceId: string;
    dayOfWeek: WeekDay;
    startTime: string;
    endTime: string;
    isAvailable?: boolean;
    maxConcurrentReservations?: number;
    effectiveFrom?: Date;
    effectiveUntil?: Date;
    notes?: string;
    createdBy?: string;
  }): Promise<AvailabilityEntity> {
    logger.info("Creating availability", {
      resourceId: data.resourceId,
      dayOfWeek: data.dayOfWeek,
    });

    // Verificar solapamientos
    const overlapping = await this.availabilityRepository.findOverlapping(
      data.resourceId,
      data.dayOfWeek,
      data.startTime,
      data.endTime
    );

    if (overlapping.length > 0) {
      throw new Error(
        "Availability overlaps with existing schedule for this day"
      );
    }

    // Crear entidad
    const availability = new AvailabilityEntity(
      undefined as any,
      data.resourceId,
      data.dayOfWeek,
      data.startTime,
      data.endTime,
      data.isAvailable !== undefined ? data.isAvailable : true,
      data.maxConcurrentReservations || 1,
      data.effectiveFrom,
      data.effectiveUntil,
      data.notes,
      new Date(),
      new Date(),
      {
        createdBy: data.createdBy || "system",
      }
    );

    // Validar horario
    if (!availability.isValid()) {
      throw new Error("Invalid time range: end time must be after start time");
    }

    // Guardar
    const savedAvailability =
      await this.availabilityRepository.create(availability);

    logger.info("Availability created successfully", {
      availabilityId: savedAvailability.id,
    });

    return savedAvailability;
  }

  /**
   * Verifica disponibilidad de un recurso en un periodo
   */
  async checkAvailability(
    resourceId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    isAvailable: boolean;
    conflicts: any[];
    availableSlots: any[];
  }> {
    logger.info("Checking availability", {
      resourceId,
      startDate,
      endDate,
    });

    // Buscar conflictos
    const conflicts = await this.reservationRepository.findConflicts(
      resourceId,
      startDate,
      endDate
    );

    // Buscar disponibilidades activas
    const availabilities = await this.availabilityRepository.findActiveOn(
      resourceId,
      startDate
    );

    const isAvailable = conflicts.length === 0 && availabilities.length > 0;

    return {
      isAvailable,
      conflicts: conflicts.map((c) => c.toObject()),
      availableSlots: availabilities.map((a) => a.toObject()),
    };
  }

  /**
   * Obtiene disponibilidades de un recurso
   */
  async findByResource(resourceId: string): Promise<AvailabilityEntity[]> {
    logger.info("Finding availabilities by resource", { resourceId });

    return await this.availabilityRepository.findByResource(resourceId);
  }

  /**
   * Busca disponibilidad por ID
   */
  async findById(id: string): Promise<AvailabilityEntity> {
    logger.info("Finding availability by ID", { id });

    const availability = await this.availabilityRepository.findById(id);

    if (!availability) {
      throw new NotFoundException(`Availability with ID ${id} not found`);
    }

    return availability;
  }

  /**
   * Search available slots with advanced filters
   * Implementa búsqueda avanzada OPTIMIZADA con:
   * - Cache Redis para resultados frecuentes
   * - Filtrado de recursos por tipo, capacidad, features (desde cache sincronizado via EDA)
   * - Búsqueda de availabilities en rango de fechas
   * - Validación contra reservas existentes
   * - Scoring/ranking de resultados
   * - Paginación y sorting
   * - Tracking de tiempo de ejecución
   */
  async searchAvailableSlots(
    filters: SearchAvailabilityDto
  ): Promise<SearchAvailabilityResponseDto> {
    const startTime = Date.now();
    logger.info("Searching available slots (OPTIMIZED)", { filters });

    // Defaults para paginación y sorting
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const sortBy = filters.sortBy || SortByField.SCORE;
    const sortOrder = filters.sortOrder || SortOrder.DESC;

    // Generar cache key basado en filtros
    const cacheKey = this.generateCacheKey(filters);

    // Intentar obtener resultado desde cache Redis
    const cachedResult = await this.getCachedSearchResult(cacheKey);
    if (cachedResult) {
      logger.info("Returning cached result", { cacheKey });
      const executionTimeMs = Date.now() - startTime;
      return {
        ...cachedResult,
        executionTimeMs,
        pagination: this.calculatePagination(cachedResult.total, page, limit),
      };
    }

    const startDate = new Date(filters.dateRange.start);
    const endDate = new Date(filters.dateRange.end);

    // PASO 1: Filtrar recursos que cumplan con criterios de negocio
    // Usa cache local de metadatos sincronizado via eventos Kafka (EDA pattern)
    const resourceFilters: any = {};

    if (filters.resourceTypes && filters.resourceTypes.length > 0) {
      resourceFilters.types = filters.resourceTypes;
    }

    if (filters.capacity) {
      if (filters.capacity.min) {
        resourceFilters.minCapacity = filters.capacity.min;
      }
      if (filters.capacity.max) {
        resourceFilters.maxCapacity = filters.capacity.max;
      }
    }

    if (filters.features && filters.features.length > 0) {
      resourceFilters.features = filters.features;
    }

    if (filters.program) {
      resourceFilters.program = filters.program;
    }

    if (filters.location) {
      resourceFilters.location = filters.location;
    }

    if (filters.status) {
      resourceFilters.status = filters.status;
    } else {
      // Por defecto solo buscar recursos disponibles
      resourceFilters.status = "AVAILABLE";
    }

    logger.debug("Filtering resources with metadata cache", {
      resourceFilters,
    });

    const matchingResources =
      await this.resourceMetadataRepository.findByFilters(resourceFilters);

    if (matchingResources.length === 0) {
      logger.info("No resources match filters", { resourceFilters });
      return {
        total: 0,
        totalResources: 0,
        slots: [],
        filters,
      };
    }

    const resourceIds = matchingResources.map((r) => r.id);

    logger.debug("Resources matching filters", {
      count: resourceIds.length,
      resourceIds,
    });

    // PASO 2: Buscar disponibilidades de esos recursos en el rango de fechas
    const availabilityFilters: any = {};

    if (filters.timeRange) {
      availabilityFilters.timeStart = filters.timeRange.start;
      availabilityFilters.timeEnd = filters.timeRange.end;
    }

    const availabilities =
      await this.availabilityRepository.findAvailableInDateRange(
        startDate,
        endDate,
        availabilityFilters
      );

    // Filtrar solo las disponibilidades de los recursos que cumplen criterios
    const relevantAvailabilities = availabilities.filter((av) =>
      resourceIds.includes(av.resourceId)
    );

    logger.debug("Availabilities found", {
      total: relevantAvailabilities.length,
    });

    if (relevantAvailabilities.length === 0) {
      logger.info("No availabilities found in date range", {
        startDate,
        endDate,
      });
      return {
        total: 0,
        totalResources: resourceIds.length,
        slots: [],
        filters,
      };
    }

    // PASO 3: Generar slots y validar contra reservas existentes
    const slots: AvailableSlotDto[] = [];
    const processedResources = new Set<string>();

    for (const availability of relevantAvailabilities) {
      // Buscar metadatos del recurso
      const resourceMetadata = matchingResources.find(
        (r) => r.id === availability.resourceId
      );

      if (!resourceMetadata) {
        continue;
      }

      processedResources.add(availability.resourceId);

      // Generar slots para cada día en el rango de fechas
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const dayOfWeek = this.getDayOfWeek(currentDate);

        // Verificar si la disponibilidad aplica a este día
        if (availability.dayOfWeek === dayOfWeek) {
          // Construir fecha/hora completa del slot
          const slotStart = this.combineDateAndTime(
            currentDate,
            availability.startTime
          );
          const slotEnd = this.combineDateAndTime(
            currentDate,
            availability.endTime
          );

          // Validar duración mínima si se especificó
          if (filters.minDuration) {
            const durationMinutes =
              (slotEnd.getTime() - slotStart.getTime()) / 60000;
            if (durationMinutes < filters.minDuration) {
              currentDate.setDate(currentDate.getDate() + 1);
              continue;
            }
          }

          // Verificar conflictos con reservas existentes
          const conflicts = await this.reservationRepository.findConflicts(
            availability.resourceId,
            slotStart,
            slotEnd
          );

          if (conflicts.length === 0) {
            // Slot disponible - calcular scoring
            const score = this.calculateSlotScore(
              resourceMetadata,
              filters,
              slotStart,
              slotEnd
            );

            slots.push({
              resourceId: resourceMetadata.id,
              resourceName: resourceMetadata.name,
              resourceType: resourceMetadata.type,
              availableFrom: slotStart.toISOString(),
              availableUntil: slotEnd.toISOString(),
              capacity: resourceMetadata.capacity,
              location: resourceMetadata.location,
              features: resourceMetadata.features,
              program: resourceMetadata.program,
              score,
            });
          }
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    // PASO 4: Aplicar scoring, sorting y paginación
    const sortedSlots = this.sortSlots(slots, sortBy, sortOrder);
    const totalSlots = sortedSlots.length;
    const paginatedSlots = this.paginateSlots(sortedSlots, page, limit);

    const executionTimeMs = Date.now() - startTime;

    logger.info("Search completed (OPTIMIZED)", {
      totalSlots,
      totalResources: processedResources.size,
      executionTimeMs,
      cacheKey,
    });

    const response: SearchAvailabilityResponseDto = {
      total: totalSlots,
      totalResources: processedResources.size,
      slots: paginatedSlots,
      filters,
      pagination: this.calculatePagination(totalSlots, page, limit),
      executionTimeMs,
    };

    // Cachear resultado por 5 minutos
    await this.cacheSearchResult(cacheKey, response, 300);

    return response;
  }

  /**
   * Obtiene el día de la semana (enum WeekDay) de una fecha
   */
  private getDayOfWeek(date: Date): WeekDay {
    const dayIndex = date.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
    const weekDayMap: { [key: number]: WeekDay } = {
      0: WeekDay.SUNDAY,
      1: WeekDay.MONDAY,
      2: WeekDay.TUESDAY,
      3: WeekDay.WEDNESDAY,
      4: WeekDay.THURSDAY,
      5: WeekDay.FRIDAY,
      6: WeekDay.SATURDAY,
    };
    return weekDayMap[dayIndex];
  }

  /**
   * Combina una fecha con una hora (formato HH:MM) para crear un Date completo
   */
  private combineDateAndTime(date: Date, time: string): Date {
    const [hours, minutes] = time.split(":").map(Number);
    const combined = new Date(date);
    combined.setHours(hours, minutes, 0, 0);
    return combined;
  }

  /**
   * Genera cache key único basado en filtros de búsqueda
   */
  private generateCacheKey(filters: SearchAvailabilityDto): string {
    const crypto = require("crypto");
    const normalized = JSON.stringify({
      dateRange: filters.dateRange,
      timeRange: filters.timeRange,
      resourceTypes: filters.resourceTypes?.sort(),
      capacity: filters.capacity,
      features: filters.features?.sort(),
      program: filters.program,
      location: filters.location,
      minDuration: filters.minDuration,
      status: filters.status,
      page: filters.page,
      limit: filters.limit,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    });
    const hash = crypto.createHash("md5").update(normalized).digest("hex");
    return `availability:search:${hash}`;
  }

  /**
   * Obtiene resultado cacheado de Redis
   */
  private async getCachedSearchResult(
    cacheKey: string
  ): Promise<SearchAvailabilityResponseDto | null> {
    try {
      const cached = await this.redisService.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      logger.error("Error getting cached search result", error as Error);
      logger.debug("Cache key failed", { cacheKey });
    }
    return null;
  }

  /**
   * Cachea resultado de búsqueda en Redis
   */
  private async cacheSearchResult(
    cacheKey: string,
    result: SearchAvailabilityResponseDto,
    ttlSeconds: number
  ): Promise<void> {
    try {
      await this.redisService.set(cacheKey, JSON.stringify(result), {
        key: cacheKey,
        ttl: ttlSeconds,
      });
      logger.debug("Search result cached", { cacheKey, ttlSeconds });
    } catch (error) {
      logger.error("Error caching search result", error as Error);
      logger.debug("Cache key failed", { cacheKey });
    }
  }

  /**
   * Calcula score de relevancia para un slot
   * Algoritmo de scoring:
   * - Base score: 100
   * - Coincidencia exacta de features: +10 por feature
   * - Capacidad óptima (sin mucho sobrante): +20
   * - Slot en hora pico (8-18): +15
   * - Programa coincidente: +10
   * - Location coincidente: +5
   */
  private calculateSlotScore(
    resource: any,
    filters: SearchAvailabilityDto,
    slotStart: Date,
    slotEnd: Date
  ): number {
    let score = 100;

    // Feature matching
    if (filters.features && filters.features.length > 0 && resource.features) {
      const matchedFeatures = filters.features.filter((f) =>
        resource.features.includes(f)
      );
      score += matchedFeatures.length * 10;
    }

    // Capacity optimization (penalizar sobrecapacidad excesiva)
    if (filters.capacity?.min) {
      const capacityRatio = resource.capacity / filters.capacity.min;
      if (capacityRatio >= 1 && capacityRatio <= 1.5) {
        score += 20; // Capacidad óptima
      } else if (capacityRatio > 1.5 && capacityRatio <= 2) {
        score += 10; // Aceptable
      } else if (capacityRatio > 2) {
        score -= 5; // Penalizar sobrecapacidad
      }
    }

    // Hora pico (8:00 - 18:00)
    const hour = slotStart.getHours();
    if (hour >= 8 && hour < 18) {
      score += 15;
    }

    // Programa coincidente
    if (filters.program && resource.program === filters.program) {
      score += 10;
    }

    // Location coincidente
    if (
      filters.location &&
      resource.location &&
      resource.location.toLowerCase().includes(filters.location.toLowerCase())
    ) {
      score += 5;
    }

    // Normalizar a 0-100
    return Math.min(Math.max(score, 0), 100);
  }

  /**
   * Ordena slots según criterio especificado
   */
  private sortSlots(
    slots: AvailableSlotDto[],
    sortBy: SortByField,
    sortOrder: SortOrder
  ): AvailableSlotDto[] {
    const sorted = [...slots];
    const multiplier = sortOrder === SortOrder.ASC ? 1 : -1;

    sorted.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case SortByField.SCORE:
          comparison = (a.score || 0) - (b.score || 0);
          break;
        case SortByField.CAPACITY:
          comparison = a.capacity - b.capacity;
          break;
        case SortByField.AVAILABLE_FROM:
          comparison =
            new Date(a.availableFrom).getTime() -
            new Date(b.availableFrom).getTime();
          break;
        case SortByField.RESOURCE_NAME:
          comparison = a.resourceName.localeCompare(b.resourceName);
          break;
        default:
          comparison = 0;
      }

      return comparison * multiplier;
    });

    return sorted;
  }

  /**
   * Aplica paginación a slots
   */
  private paginateSlots(
    slots: AvailableSlotDto[],
    page: number,
    limit: number
  ): AvailableSlotDto[] {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    return slots.slice(startIndex, endIndex);
  }

  /**
   * Calcula metadata de paginación
   */
  private calculatePagination(
    total: number,
    page: number,
    limit: number
  ): {
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  } {
    const totalPages = Math.ceil(total / limit);
    return {
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }
}
