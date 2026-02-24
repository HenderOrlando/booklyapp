import { EventPayload } from "@libs/common";
import { createLogger } from "@libs/common";
import { EventBusService } from "@libs/event-bus";
import { Injectable, OnModuleInit } from "@nestjs/common";

const logger = createLogger("AvailabilityServiceClient");

/**
 * Reservation Data from Availability Service
 */
export interface ReservationData {
  id: string;
  resourceId: string;
  userId: string;
  startTime: Date;
  endTime: Date;
  status: string;
  purpose?: string;
  metadata?: Record<string, any>;
}

/**
 * Resource Data from Availability Service
 */
export interface ResourceData {
  id: string;
  name: string;
  type: string;
  location?: string;
  capacity?: number;
  metadata?: Record<string, any>;
}

/**
 * Availability Service Client
 * Cliente para comunicación con availability-service vía Event Bus
 */
@Injectable()
export class AvailabilityServiceClient implements OnModuleInit {
  // Map de promesas pendientes para respuestas síncronas
  private pendingReservationRequests = new Map<
    string,
    (data: ReservationData | null) => void
  >();
  private pendingResourceRequests = new Map<
    string,
    (data: ResourceData | null) => void
  >();

  // Timeout por defecto: 5 segundos
  private readonly requestTimeout = 5000;

  constructor(private readonly eventBus: EventBusService) {}

  async onModuleInit() {
    await this.initializeResponseListeners();
  }

  /**
   * Obtener datos de una reserva por ID
   */
  async getReservationById(
    reservationId: string
  ): Promise<ReservationData | null> {
    try {
      const requestId = `get-reservation-${reservationId}-${Date.now()}`;

      logger.info("Requesting reservation data from availability-service", {
        reservationId,
        requestId,
      });

      // Crear promesa pendiente con timeout
      const responsePromise = new Promise<ReservationData | null>((resolve) => {
        this.pendingReservationRequests.set(requestId, resolve);

        // Timeout: resolver con null después de 5 segundos
        setTimeout(() => {
          if (this.pendingReservationRequests.has(requestId)) {
            logger.warn("Reservation data request timeout", {
              requestId,
              reservationId,
            });
            this.pendingReservationRequests.delete(requestId);
            resolve(null);
          }
        }, this.requestTimeout);
      });

      // Publicar evento de solicitud
      const payload: EventPayload = {
        eventId: requestId,
        eventType: "reservation.data.requested",
        service: "stockpile-service",
        timestamp: new Date(),
        data: {
          reservationId,
          requestId,
          replyTo: "bookly.stockpile.reservation-data-response",
        },
      };

      await this.eventBus.publish(
        "bookly.availability.reservation-data-request",
        payload
      );

      // Esperar respuesta (await)
      return await responsePromise;
    } catch (error) {
      logger.error("Error requesting reservation data", error as Error, {
        reservationId,
      });
      return null;
    }
  }

  /**
   * Obtener datos de un recurso por ID
   */
  async getResourceById(resourceId: string): Promise<ResourceData | null> {
    try {
      const requestId = `get-resource-${resourceId}-${Date.now()}`;

      logger.info("Requesting resource data from availability-service", {
        resourceId,
        requestId,
      });

      // Crear promesa pendiente con timeout
      const responsePromise = new Promise<ResourceData | null>((resolve) => {
        this.pendingResourceRequests.set(requestId, resolve);

        // Timeout: resolver con null después de 5 segundos
        setTimeout(() => {
          if (this.pendingResourceRequests.has(requestId)) {
            logger.warn("Resource data request timeout", {
              requestId,
              resourceId,
            });
            this.pendingResourceRequests.delete(requestId);
            resolve(null);
          }
        }, this.requestTimeout);
      });

      // Publicar evento de solicitud
      const payload: EventPayload = {
        eventId: requestId,
        eventType: "resource.data.requested",
        service: "stockpile-service",
        timestamp: new Date(),
        data: {
          resourceId,
          requestId,
          replyTo: "bookly.stockpile.resource-data-response",
        },
      };

      await this.eventBus.publish(
        "bookly.resources.resource-data-request",
        payload
      );

      // Esperar respuesta (await)
      return await responsePromise;
    } catch (error) {
      logger.error("Error requesting resource data", error as Error, {
        resourceId,
      });
      return null;
    }
  }

  /**
   * Inicializar listeners para respuestas
   */
  private async initializeResponseListeners(): Promise<void> {
    // Listener para respuestas de reservas
    await this.eventBus.subscribe(
      "bookly.stockpile.reservation-data-response",
      "stockpile-service",
      async (event: EventPayload) => {
        this.handleReservationDataResponse(event);
      }
    );

    // Listener para respuestas de recursos
    await this.eventBus.subscribe(
      "bookly.stockpile.resource-data-response",
      "stockpile-service",
      async (event: EventPayload) => {
        this.handleResourceDataResponse(event);
      }
    );

    logger.info("Availability service client response listeners initialized");
  }

  /**
   * Manejar respuesta de datos de reserva
   */
  private handleReservationDataResponse(payload: EventPayload): void {
    const { requestId, reservation } = payload.data;

    logger.debug("Received reservation data response", {
      requestId,
      reservationId: reservation?.id,
    });

    const resolver = this.pendingReservationRequests.get(requestId);
    if (resolver) {
      resolver(reservation || null);
      this.pendingReservationRequests.delete(requestId);
      logger.debug("Reservation request resolved", { requestId });
    } else {
      logger.warn("No pending request found for reservation response", {
        requestId,
      });
    }
  }

  /**
   * Manejar respuesta de datos de recurso
   */
  private handleResourceDataResponse(payload: EventPayload): void {
    const { requestId, resource } = payload.data;

    logger.debug("Received resource data response", {
      requestId,
      resourceId: resource?.id,
    });

    const resolver = this.pendingResourceRequests.get(requestId);
    if (resolver) {
      resolver(resource || null);
      this.pendingResourceRequests.delete(requestId);
      logger.debug("Resource request resolved", { requestId });
    } else {
      logger.warn("No pending request found for resource response", {
        requestId,
      });
    }
  }
}
