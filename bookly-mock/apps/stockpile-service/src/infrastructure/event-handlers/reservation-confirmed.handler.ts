import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventBusService } from '@libs/event-bus';
import { EventType } from '@libs/common/enums';
import { EventPayload } from '@libs/common';

/**
 * Handler para evento RESERVATION_CONFIRMED
 * 
 * Propósito: Preparar el check-in para la reserva confirmada
 */
@Injectable()
export class ReservationConfirmedHandler implements OnModuleInit {
  private readonly logger = new Logger(ReservationConfirmedHandler.name);

  constructor(private readonly eventBus: EventBusService) {}

  async onModuleInit() {
    await this.eventBus.subscribe(
      EventType.RESERVATION_CONFIRMED,
      'stockpile-service-reservations-group',
      this.handle.bind(this),
    );

    this.logger.log(`Subscribed to ${EventType.RESERVATION_CONFIRMED}`);
  }

  /**
   * Manejar evento de reserva confirmada
   * Prepara el sistema para el check-in
   */
  async handle(event: EventPayload<any>): Promise<void> {
    const { reservationId, resourceId, userId, confirmedAt } = event.data;

    this.logger.debug(
      `Handling RESERVATION_CONFIRMED for reservation ${reservationId}`,
    );

    try {
      // TODO: Implementar lógica de negocio
      // 1. Crear registro de check-in pendiente
      // 2. Generar código QR o token para check-in
      // 3. Preparar documento de confirmación
      // 4. Publicar evento DOCUMENT_GENERATED
      // 5. Notificar al usuario con instrucciones de check-in
      // 6. Notificar a vigilancia sobre la reserva confirmada

      this.logger.log(
        `Reservation ${reservationId} confirmed. Preparing check-in process`,
      );

      // TODO: Generar documento de confirmación
      // TODO: Publicar DOCUMENT_GENERATED
    } catch (error) {
      this.logger.error(
        `Error handling RESERVATION_CONFIRMED: ${error.message}`,
        error.stack,
      );
    }
  }
}
