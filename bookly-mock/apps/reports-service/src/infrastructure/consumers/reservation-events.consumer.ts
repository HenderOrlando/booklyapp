import { EventPayload } from "@libs/common";
import { createLogger } from "@libs/common";
import { EventBusService } from "@libs/event-bus";
import { Injectable, OnModuleInit } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ResourceCache } from "../schemas/resource-cache.schema";

const logger = createLogger("ReservationEventsConsumer");

/**
 * Reservation Events Consumer
 * Consume eventos de reservas desde availability-service para actualizar estadísticas
 */
@Injectable()
export class ReservationEventsConsumer implements OnModuleInit {
  constructor(
    private readonly eventBus: EventBusService,
    @InjectModel(ResourceCache.name)
    private readonly resourceCacheModel: Model<ResourceCache>
  ) {}

  async onModuleInit() {
    // Consumir evento de reserva creada
    this.eventBus.subscribe(
      "availability.reservation.created",
      "reports-reservation-group",
      this.handleReservationCreated.bind(this)
    );

    // Consumir evento de reserva confirmada
    this.eventBus.subscribe(
      "availability.reservation.confirmed",
      "reports-reservation-group",
      this.handleReservationConfirmed.bind(this)
    );

    // Consumir evento de reserva cancelada
    this.eventBus.subscribe(
      "availability.reservation.cancelled",
      "reports-reservation-group",
      this.handleReservationCancelled.bind(this)
    );

    // Consumir evento de reserva completada
    this.eventBus.subscribe(
      "availability.reservation.completed",
      "reports-reservation-group",
      this.handleReservationCompleted.bind(this)
    );

    // Consumir evento de no-show
    this.eventBus.subscribe(
      "availability.reservation.noshow",
      "reports-reservation-group",
      this.handleReservationNoShow.bind(this)
    );

    logger.info("ReservationEventsConsumer initialized and subscribed");
  }

  /**
   * Manejar evento de reserva creada
   */
  private async handleReservationCreated(
    event: EventPayload<any>
  ): Promise<void> {
    try {
      logger.info("Processing reservation.created event", {
        eventId: event.eventId,
        reservationId: event.data.reservationId,
      });

      const { resourceId, userId, startTime, endTime, programId } = event.data;

      await this.updateUsageStatistic(resourceId, {
        totalReservations: 1,
        lastReservationDate: new Date(),
        userId,
        programId,
      });
    } catch (error: any) {
      logger.error("Failed to process reservation.created event", error, {
        eventId: event.eventId,
      });
    }
  }

  /**
   * Manejar evento de reserva confirmada
   */
  private async handleReservationConfirmed(
    event: EventPayload<any>
  ): Promise<void> {
    try {
      logger.info("Processing reservation.confirmed event", {
        eventId: event.eventId,
        reservationId: event.data.reservationId,
      });

      const { resourceId, startTime, endTime } = event.data;
      const hours = this.calculateHours(startTime, endTime);

      await this.updateUsageStatistic(resourceId, {
        confirmedReservations: 1,
        totalHoursReserved: hours,
      });
    } catch (error: any) {
      logger.error("Failed to process reservation.confirmed event", error, {
        eventId: event.eventId,
      });
    }
  }

  /**
   * Manejar evento de reserva cancelada
   */
  private async handleReservationCancelled(
    event: EventPayload<any>
  ): Promise<void> {
    try {
      logger.info("Processing reservation.cancelled event", {
        eventId: event.eventId,
        reservationId: event.data.reservationId,
      });

      const { resourceId } = event.data;

      await this.updateUsageStatistic(resourceId, {
        cancelledReservations: 1,
      });
    } catch (error: any) {
      logger.error("Failed to process reservation.cancelled event", error, {
        eventId: event.eventId,
      });
    }
  }

  /**
   * Manejar evento de reserva completada
   */
  private async handleReservationCompleted(
    event: EventPayload<any>
  ): Promise<void> {
    try {
      logger.info("Processing reservation.completed event", {
        eventId: event.eventId,
        reservationId: event.data.reservationId,
      });

      const { resourceId, startTime, endTime } = event.data;
      const hours = this.calculateHours(startTime, endTime);

      await this.updateUsageStatistic(resourceId, {
        completedReservations: 1,
        totalHoursUsed: hours,
      });
    } catch (error: any) {
      logger.error("Failed to process reservation.completed event", error, {
        eventId: event.eventId,
      });
    }
  }

  /**
   * Manejar evento de no-show
   */
  private async handleReservationNoShow(
    event: EventPayload<any>
  ): Promise<void> {
    try {
      logger.info("Processing reservation.noshow event", {
        eventId: event.eventId,
        reservationId: event.data.reservationId,
      });

      const { resourceId } = event.data;

      await this.updateUsageStatistic(resourceId, {
        noShowReservations: 1,
      });
    } catch (error: any) {
      logger.error("Failed to process reservation.noshow event", error, {
        eventId: event.eventId,
      });
    }
  }

  /**
   * Actualizar estadística de uso del recurso
   */
  private async updateUsageStatistic(
    resourceId: string,
    updates: Partial<{
      totalReservations: number;
      confirmedReservations: number;
      completedReservations: number;
      cancelledReservations: number;
      noShowReservations: number;
      totalHoursReserved: number;
      totalHoursUsed: number;
      lastReservationDate: Date;
      userId: string;
      programId: string;
    }>
  ): Promise<void> {
    try {
      // Buscar o crear cache para este recurso
      const resourceCache = await this.resourceCacheModel.findOne({
        resourceId,
      });

      if (resourceCache) {
        // Incrementar contadores
        if (updates.totalReservations) {
          resourceCache.totalReservations += updates.totalReservations;
        }
        if (updates.confirmedReservations) {
          resourceCache.confirmedReservations += updates.confirmedReservations;
        }
        if (updates.completedReservations) {
          resourceCache.completedReservations += updates.completedReservations;
        }
        if (updates.cancelledReservations) {
          resourceCache.cancelledReservations += updates.cancelledReservations;
        }
        if (updates.noShowReservations) {
          resourceCache.noShowReservations += updates.noShowReservations;
        }
        if (updates.totalHoursReserved) {
          resourceCache.totalHoursReserved += updates.totalHoursReserved;
        }
        if (updates.totalHoursUsed) {
          resourceCache.totalHoursUsed += updates.totalHoursUsed;
        }
        if (updates.lastReservationDate) {
          resourceCache.lastReservationDate = updates.lastReservationDate;
        }

        // Actualizar breakdown por programa
        if (updates.programId) {
          if (!resourceCache.programsBreakdown) {
            resourceCache.programsBreakdown = {};
          }
          resourceCache.programsBreakdown[updates.programId] =
            (resourceCache.programsBreakdown[updates.programId] || 0) + 1;
        }

        // Recalcular tasa de ocupación
        resourceCache.occupancyRate = this.calculateOccupancyRate(
          resourceCache.totalHoursUsed,
          resourceCache.totalReservations
        );

        // Promedio de duración
        resourceCache.averageSessionDuration =
          resourceCache.completedReservations > 0
            ? resourceCache.totalHoursUsed / resourceCache.completedReservations
            : 0;

        await resourceCache.save();

        logger.debug("Resource cache updated", {
          resourceId,
          totalReservations: resourceCache.totalReservations,
          occupancyRate: resourceCache.occupancyRate,
        });
      } else {
        // Crear nuevo cache
        await this.resourceCacheModel.create({
          resourceId,
          name: "Unknown", // Se actualizará con evento de recurso
          type: "UNKNOWN",
          totalReservations: updates.totalReservations || 0,
          confirmedReservations: updates.confirmedReservations || 0,
          completedReservations: updates.completedReservations || 0,
          cancelledReservations: updates.cancelledReservations || 0,
          noShowReservations: updates.noShowReservations || 0,
          totalHoursReserved: updates.totalHoursReserved || 0,
          totalHoursUsed: updates.totalHoursUsed || 0,
          occupancyRate: 0,
          averageSessionDuration: 0,
          peakUsageHours: [],
          programsBreakdown: updates.programId
            ? { [updates.programId]: 1 }
            : {},
          lastReservationDate: updates.lastReservationDate || new Date(),
        });

        logger.info("New resource cache created", { resourceId });
      }
    } catch (error: any) {
      logger.error("Failed to update resource cache", error, { resourceId });
    }
  }

  /**
   * Calcular horas entre dos fechas
   */
  private calculateHours(startTime: string, endTime: string): number {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  }

  /**
   * Calcular tasa de ocupación
   */
  private calculateOccupancyRate(
    totalHoursUsed: number,
    totalReservations: number
  ): number {
    // Estimación simple: asumiendo 12 horas disponibles por día
    const estimatedDays =
      totalReservations > 0 ? Math.ceil(totalReservations / 2) : 1;
    const maxPossibleHours = estimatedDays * 12;
    return maxPossibleHours > 0
      ? Math.min((totalHoursUsed / maxPossibleHours) * 100, 100)
      : 0;
  }
}
