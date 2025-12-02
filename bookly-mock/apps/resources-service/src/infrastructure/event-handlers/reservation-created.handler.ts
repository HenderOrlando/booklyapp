import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventBusService } from '@libs/event-bus';
import { EventType } from '@libs/common/enums';
import { EventPayload } from '@libs/common';

/**
 * Handler para evento RESERVATION_CREATED
 * 
 * Propósito: Actualizar el estado de uso del recurso cuando se crea una reserva
 */
@Injectable()
export class ReservationCreatedHandler implements OnModuleInit {
  private readonly logger = new Logger(ReservationCreatedHandler.name);

  constructor(private readonly eventBus: EventBusService) {}

  async onModuleInit() {
    await this.eventBus.subscribe(
      EventType.RESERVATION_CREATED,
      'resources-service-reservations-group',
      this.handle.bind(this),
    );

    this.logger.log(`Subscribed to ${EventType.RESERVATION_CREATED}`);
  }

  /**
   * Manejar evento de reserva creada
   * Actualiza el estado de uso del recurso
   */
  async handle(event: EventPayload<any>): Promise<void> {
    const { reservationId, resourceId, userId, startTime, endTime } = event.data;

    this.logger.debug(
      `Handling RESERVATION_CREATED for resource ${resourceId}, reservation ${reservationId}`,
    );

    try {
      // TODO: Implementar lógica de negocio
      // 1. Actualizar contador de uso del recurso
      // 2. Registrar historial de reservas del recurso
      // 3. Actualizar métricas de demanda

      this.logger.log(
        `Resource ${resourceId} reserved from ${startTime} to ${endTime} by user ${userId}`,
      );
    } catch (error) {
      this.logger.error(
        `Error handling RESERVATION_CREATED: ${error.message}`,
        error.stack,
      );
      // No re-throw para evitar que el event bus reintente indefinidamente
    }
  }
}
