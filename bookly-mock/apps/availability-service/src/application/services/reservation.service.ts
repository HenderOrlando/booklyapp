import { ReservationEntity } from "@availability/domain/entities/reservation.entity";
import { IReservationRepository } from "@availability/domain/repositories/reservation.repository.interface";
import { createLogger, PaginationMeta, PaginationQuery } from "@libs/common";
import { ReservationStatus } from "@libs/common/enums";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";

const logger = createLogger("ReservationService");

/**
 * Reservation Service
 * Servicio de aplicación para gestión de reservas
 */
@Injectable()
export class ReservationService {
  private readonly CACHE_TTL = 300; // 5 minutos para reservas
  private readonly CACHE_PREFIX = "reservation";

  constructor(
    @Inject("IReservationRepository")
    private readonly reservationRepository: IReservationRepository,
    @Inject("RedisService")
    private readonly redisService?: any,
    @Inject("CacheMetricsService")
    private readonly cacheMetrics?: any,
  ) {}

  /**
   * Crea una nueva reserva
   */
  async createReservation(data: {
    resourceId: string;
    userId: string;
    startDate: Date;
    endDate: Date;
    purpose: string;
    isRecurring?: boolean;
    recurringPattern?: {
      frequency: "daily" | "weekly" | "monthly";
      interval: number;
      endDate?: Date;
      daysOfWeek?: number[];
    };
    participants?: {
      userId: string;
      name: string;
      email: string;
    }[];
    notes?: string;
    externalCalendarId?: string;
    externalCalendarEventId?: string;
    createdBy?: string;
  }): Promise<ReservationEntity> {
    logger.info("Creating reservation", {
      resourceId: data.resourceId,
      userId: data.userId,
    });

    // Verificar conflictos (incluye buffer de preparación RF-17)
    const preparationTimeMinutes = await this.getPreparationTimeMinutes(
      data.resourceId,
    );
    const bufferedStartDate = new Date(
      data.startDate.getTime() - preparationTimeMinutes * 60000,
    );
    const bufferedEndDate = new Date(
      data.endDate.getTime() + preparationTimeMinutes * 60000,
    );

    const conflicts = await this.reservationRepository.findConflicts(
      data.resourceId,
      bufferedStartDate,
      bufferedEndDate,
    );

    if (conflicts.length > 0) {
      const isBufferConflict = conflicts.every((c: any) => {
        const cEnd = new Date(c.endDate);
        const cStart = new Date(c.startDate);
        return (
          (cEnd <= data.startDate && cEnd > bufferedStartDate) ||
          (cStart >= data.endDate && cStart < bufferedEndDate)
        );
      });

      if (isBufferConflict && preparationTimeMinutes > 0) {
        throw new Error(
          `Resource requires ${preparationTimeMinutes} minutes of preparation time between reservations`,
        );
      }
      throw new Error("Resource is not available for the requested period");
    }

    // Crear entidad
    const reservationEntity = new ReservationEntity(
      undefined as any,
      data.resourceId,
      data.userId,
      data.startDate,
      data.endDate,
      data.purpose,
      ReservationStatus.PENDING,
      data.isRecurring || false,
      data.recurringPattern as any,
      data.participants,
      data.notes,
      undefined,
      undefined,
      data.externalCalendarId,
      data.externalCalendarEventId,
      undefined,
      undefined,
      undefined,
      undefined,
      new Date(),
      new Date(),
      {
        createdBy: data.createdBy || data.userId,
      },
    );

    // Guardar
    const savedReservation =
      await this.reservationRepository.create(reservationEntity);

    logger.info("Reservation created successfully", {
      reservationId: savedReservation.id,
    });

    return savedReservation;
  }

  /**
   * Busca reservas con filtros y paginación
   */
  async findReservations(
    query: PaginationQuery,
    filters?: {
      userId?: string;
      resourceId?: string;
      status?: ReservationStatus;
      startDate?: Date;
      endDate?: Date;
    },
  ): Promise<{ reservations: ReservationEntity[]; meta: PaginationMeta }> {
    logger.info("Finding reservations", { filters, query });

    return await this.reservationRepository.findMany(query, filters);
  }

  /**
   * Busca una reserva por ID
   */
  async findReservationById(id: string): Promise<ReservationEntity> {
    logger.info("Finding reservation by ID", { id });

    // Intentar obtener desde cache
    if (this.redisService && this.cacheMetrics) {
      try {
        const cached = await this.redisService.getCachedWithPrefix(
          "cache",
          `${this.CACHE_PREFIX}:${id}`,
        );
        if (cached) {
          this.cacheMetrics.recordHit();
          logger.debug(`Reservation ${id} found in cache`);
          return cached;
        }
        this.cacheMetrics.recordMiss();
      } catch (error) {
        logger.warn("Cache read error, fetching from DB", error as Error);
      }
    }

    const reservation = await this.reservationRepository.findById(id);

    if (!reservation) {
      throw new NotFoundException(`Reservation with ID ${id} not found`);
    }

    // Cachear el resultado
    if (this.redisService) {
      try {
        await this.redisService.cacheWithPrefix(
          "cache",
          `${this.CACHE_PREFIX}:${id}`,
          reservation,
          this.CACHE_TTL,
        );
      } catch (error) {
        logger.warn("Cache write error", error as Error);
      }
    }

    return reservation;
  }

  /**
   * Actualiza una reserva
   */
  async updateReservation(
    id: string,
    data: {
      startDate?: Date;
      endDate?: Date;
      purpose?: string;
      participants?: {
        userId: string;
        name: string;
        email: string;
      }[];
      notes?: string;
      updatedBy?: string;
    },
  ): Promise<ReservationEntity> {
    logger.info("Updating reservation", { id });

    // Invalidar cache
    if (this.redisService) {
      try {
        await this.redisService.deleteCachedWithPrefix(
          "cache",
          `${this.CACHE_PREFIX}:${id}`,
        );
      } catch (error) {
        logger.warn("Cache invalidation error", error as Error);
      }
    }

    const reservation = await this.findReservationById(id);

    if (!reservation.canBeModified()) {
      throw new Error(
        `Cannot modify reservation with status: ${reservation.status}`,
      );
    }

    // Verificar conflictos si se cambian las fechas
    if (data.startDate || data.endDate) {
      const conflicts = await this.reservationRepository.findConflicts(
        reservation.resourceId,
        data.startDate || reservation.startDate,
        data.endDate || reservation.endDate,
        id,
      );

      if (conflicts.length > 0) {
        throw new Error("Resource is not available for the requested period");
      }
    }

    // Actualizar en BD
    const updated = await this.reservationRepository.update(id, {
      ...data,
      updatedAt: new Date(),
      audit: {
        ...reservation.audit,
        updatedBy: data.updatedBy || reservation.userId,
      },
    } as Partial<ReservationEntity>);

    logger.info("Reservation updated successfully", { id });

    return updated;
  }

  /**
   * Cancela una reserva
   */
  async cancelReservation(
    id: string,
    cancelledBy: string,
    reason?: string,
  ): Promise<ReservationEntity> {
    logger.info("Cancelling reservation", { id, cancelledBy });

    const reservation = await this.findReservationById(id);

    // Cancelar usando método de entidad
    const cancelledReservation = reservation.cancel(cancelledBy, reason);

    // Actualizar en BD
    await this.reservationRepository.update(id, {
      status: cancelledReservation.status,
      updatedAt: cancelledReservation.updatedAt,
      audit: cancelledReservation.audit,
    } as Partial<ReservationEntity>);

    logger.info("Reservation cancelled successfully", { id });

    return cancelledReservation;
  }

  /**
   * Realiza check-in de una reserva
   */
  async checkIn(id: string): Promise<ReservationEntity> {
    logger.info("Checking in reservation", { id });

    const reservation = await this.findReservationById(id);

    // Check-in usando método de entidad
    const checkedInReservation = reservation.checkIn();

    // Actualizar en BD
    await this.reservationRepository.update(id, {
      status: checkedInReservation.status,
      checkInTime: checkedInReservation.checkInTime,
      updatedAt: checkedInReservation.updatedAt,
    } as Partial<ReservationEntity>);

    logger.info("Check-in successful", { id });

    return checkedInReservation;
  }

  /**
   * Realiza check-out de una reserva
   */
  async checkOut(id: string): Promise<ReservationEntity> {
    logger.info("Checking out reservation", { id });

    const reservation = await this.findReservationById(id);

    // Check-out usando método de entidad
    const checkedOutReservation = reservation.checkOut();

    // Actualizar en BD
    await this.reservationRepository.update(id, {
      status: checkedOutReservation.status,
      checkOutTime: checkedOutReservation.checkOutTime,
      updatedAt: checkedOutReservation.updatedAt,
    } as Partial<ReservationEntity>);

    logger.info("Check-out successful", { id });

    return checkedOutReservation;
  }

  /**
   * Obtener tiempo de preparación en minutos para un recurso (RF-17)
   * El valor se obtiene de la metadata del recurso o se usa un default de 0
   */
  private async getPreparationTimeMinutes(resourceId: string): Promise<number> {
    try {
      if (this.redisService) {
        const cached = await this.redisService.get(
          `${this.CACHE_PREFIX}:prep:${resourceId}`,
        );
        if (cached !== null && cached !== undefined) {
          return Number(cached);
        }
      }
      // Default: sin buffer de preparación
      return 0;
    } catch {
      return 0;
    }
  }
}
