import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventBusService } from '@libs/event-bus';
import { EventType } from '@libs/common/enums';
import { EventPayload } from '@libs/common';
import { AvailabilityCacheService } from '../cache';

/**
 * Handler para evento RESOURCE_AVAILABILITY_CHANGED
 * 
 * Propósito: Actualizar disponibilidad del recurso en el calendario
 */
@Injectable()
export class ResourceAvailabilityChangedHandler implements OnModuleInit {
  private readonly logger = new Logger(ResourceAvailabilityChangedHandler.name);

  constructor(
    private readonly eventBus: EventBusService,
    private readonly cacheService: AvailabilityCacheService,
  ) {}

  async onModuleInit() {
    await this.eventBus.subscribe(
      EventType.RESOURCE_AVAILABILITY_CHANGED,
      'availability-service-resources-group',
      this.handle.bind(this),
    );

    this.logger.log(`Subscribed to ${EventType.RESOURCE_AVAILABILITY_CHANGED}`);
  }

  /**
   * Manejar evento de cambio de disponibilidad
   * Actualiza el calendario y verifica conflictos
   */
  async handle(event: EventPayload<any>): Promise<void> {
    const { resourceId, previousAvailability, newAvailability, affectedTimeSlots } = event.data;

    this.logger.debug(
      `Handling RESOURCE_AVAILABILITY_CHANGED for resource ${resourceId}`,
    );

    try {
      // TODO: Implementar lógica de negocio
      // 1. Actualizar cache de disponibilidad del recurso
      // 2. Si newAvailability es false, verificar reservas en affectedTimeSlots
      // 3. Notificar conflictos si existen reservas en slots bloqueados
      // 4. Actualizar calendario visual

      if (!newAvailability && affectedTimeSlots?.length > 0) {
        this.logger.warn(
          `Resource ${resourceId} became unavailable. Checking ${affectedTimeSlots.length} affected time slots`,
        );
        // TODO: Verificar y notificar conflictos
      }

      // Invalidar cache de disponibilidad del recurso
      await this.cacheService.invalidateResourceAvailability(resourceId);
      await this.cacheService.invalidateAllResourceCache(resourceId);

      this.logger.log(
        `Updated availability for resource ${resourceId}. Cache invalidated.`,
      );
      this.logger.log(
        `Resource ${resourceId} availability updated: ${previousAvailability} -> ${newAvailability}`,
      );
    } catch (error) {
      this.logger.error(
        `Error handling RESOURCE_AVAILABILITY_CHANGED: ${error.message}`,
        error.stack,
      );
    }
  }
}
