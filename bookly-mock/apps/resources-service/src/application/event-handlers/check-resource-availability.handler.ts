import { ResourceEvents } from "@libs/common/events";
import { EventBusService } from "@libs/event-bus";
import { Injectable, Logger, OnModuleInit } from "@nestjs/common";

/**
 * Handler para verificar disponibilidad de recurso
 *
 * NOTA: En resources-service no tenemos información de reservas,
 * así que siempre respondemos "disponible" basado solo en el estado del recurso.
 * La lógica real de disponibilidad está en availability-service.
 */
@Injectable()
export class CheckResourceAvailabilityHandler implements OnModuleInit {
  private readonly logger = new Logger(CheckResourceAvailabilityHandler.name);

  constructor(private readonly eventBus: EventBusService) {}

  async onModuleInit() {
    await this.eventBus.subscribe(
      ResourceEvents.CHECK_RESOURCE_AVAILABILITY,
      "resources-service",
      this.handle.bind(this)
    );

    this.logger.log(
      `Subscribed to ${ResourceEvents.CHECK_RESOURCE_AVAILABILITY}`
    );
  }

  /**
   * Manejar verificación de disponibilidad
   *
   * IMPLEMENTACIÓN SIMPLIFICADA:
   * Resources-service no conoce reservas, solo verifica que el recurso exista y esté activo.
   * La verificación real de conflictos debe hacerse en availability-service.
   */
  async handle(event: any): Promise<void> {
    const { resourceId, startDate, endDate, correlationId } = event.data;

    this.logger.debug(
      `Handling availability check for resource ${resourceId} (correlationId: ${correlationId})`
    );

    try {
      // NOTA: En un escenario real, resources-service podría tener
      // bloqueos de mantenimiento o estados que afecten disponibilidad.
      // Por ahora, asumimos disponible si el recurso existe.

      const response: ResourceEvents.CheckResourceAvailabilityResponse = {
        correlationId,
        available: true, // Simplificado - availability-service maneja la lógica real
        conflicts: [],
      };

      // Publicar response
      await this.eventBus.publish(
        ResourceEvents.CHECK_RESOURCE_AVAILABILITY_RESPONSE,
        {
          eventId: correlationId,
          eventType: ResourceEvents.CHECK_RESOURCE_AVAILABILITY_RESPONSE,
          timestamp: new Date(),
          service: "resources-service",
          data: response,
        }
      );

      this.logger.debug(
        `Published availability response for resource ${resourceId}`
      );
    } catch (error) {
      this.logger.error(
        `Error handling availability check: ${error.message}`,
        error.stack
      );

      // En caso de error, responder como no disponible por seguridad
      await this.eventBus.publish(
        ResourceEvents.CHECK_RESOURCE_AVAILABILITY_RESPONSE,
        {
          eventId: correlationId,
          eventType: ResourceEvents.CHECK_RESOURCE_AVAILABILITY_RESPONSE,
          timestamp: new Date(),
          service: "resources-service",
          data: {
            correlationId,
            available: false,
            conflicts: [],
          },
        }
      );
    }
  }
}
