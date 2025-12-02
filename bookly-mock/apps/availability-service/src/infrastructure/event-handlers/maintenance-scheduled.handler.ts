import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventBusService } from '@libs/event-bus';
import { EventType } from '@libs/common/enums';
import { EventPayload } from '@libs/common';
import { AvailabilityCacheService } from '../cache';

/**
 * Handler para evento MAINTENANCE_SCHEDULED
 * 
 * Propósito: Bloquear el recurso durante el período de mantenimiento
 */
@Injectable()
export class MaintenanceScheduledHandler implements OnModuleInit {
  private readonly logger = new Logger(MaintenanceScheduledHandler.name);

  constructor(
    private readonly eventBus: EventBusService,
    private readonly cacheService: AvailabilityCacheService,
  ) {}

  async onModuleInit() {
    await this.eventBus.subscribe(
      EventType.MAINTENANCE_SCHEDULED,
      'availability-service-maintenance-group',
      this.handle.bind(this),
    );

    this.logger.log(`Subscribed to ${EventType.MAINTENANCE_SCHEDULED}`);
  }

  /**
   * Manejar evento de mantenimiento programado
   * Bloquea el recurso y verifica conflictos con reservas existentes
   */
  async handle(event: EventPayload<any>): Promise<void> {
    const { maintenanceId, resourceId, scheduledStartDate, scheduledEndDate, priority } = event.data;

    this.logger.debug(
      `Handling MAINTENANCE_SCHEDULED for resource ${resourceId}, maintenance ${maintenanceId}`,
    );

    try {
      // TODO: Implementar lógica de negocio
      // 1. Bloquear recurso en el calendario para el período de mantenimiento
      // 2. Verificar reservas existentes en ese período
      // 3. Si hay conflictos:
      //    - Si priority es 'critical', cancelar reservas y notificar
      //    - Si priority es 'low', sugerir reprogramar mantenimiento
      // 4. Actualizar cache de disponibilidad

      if (priority === 'critical' || priority === 'high') {
        this.logger.warn(
          `Critical maintenance scheduled for resource ${resourceId} from ${scheduledStartDate} to ${scheduledEndDate}`,
        );
        // TODO: Verificar y manejar conflictos con reservas
      }

      // Invalidar cache de disponibilidad y horarios
      await this.cacheService.invalidateResourceAvailability(resourceId);
      await this.cacheService.invalidateAllResourceCache(resourceId);

      this.logger.log(
        `Resource ${resourceId} blocked for maintenance from ${scheduledStartDate} to ${scheduledEndDate}. Cache invalidated.`,
      );
    } catch (error) {
      this.logger.error(
        `Error handling MAINTENANCE_SCHEDULED: ${error.message}`,
        error.stack,
      );
    }
  }
}
