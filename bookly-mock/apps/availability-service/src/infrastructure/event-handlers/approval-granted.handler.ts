import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventBusService } from '@libs/event-bus';
import { EventType } from '@libs/common/enums';
import { EventPayload } from '@libs/common';

/**
 * Handler para evento APPROVAL_GRANTED
 * 
 * Propósito: Confirmar la reserva cuando se aprueba la solicitud
 */
@Injectable()
export class ApprovalGrantedHandler implements OnModuleInit {
  private readonly logger = new Logger(ApprovalGrantedHandler.name);

  constructor(private readonly eventBus: EventBusService) {}

  async onModuleInit() {
    await this.eventBus.subscribe(
      EventType.APPROVAL_GRANTED,
      'availability-service-approvals-group',
      this.handle.bind(this),
    );

    this.logger.log(`Subscribed to ${EventType.APPROVAL_GRANTED}`);
  }

  /**
   * Manejar evento de aprobación concedida
   * Confirma la reserva y actualiza su estado
   */
  async handle(event: EventPayload<any>): Promise<void> {
    const { approvalId, reservationId, resourceId, approvedBy, comments } = event.data;

    this.logger.debug(
      `Handling APPROVAL_GRANTED for reservation ${reservationId}`,
    );

    try {
      // TODO: Implementar lógica de negocio
      // 1. Buscar la reserva por reservationId
      // 2. Actualizar estado a 'confirmed'
      // 3. Registrar quién aprobó y comentarios
      // 4. Publicar evento RESERVATION_CONFIRMED
      // 5. Notificar al usuario solicitante

      this.logger.log(
        `Reservation ${reservationId} approved by ${approvedBy}. Comments: ${comments || 'None'}`,
      );

      // TODO: Publicar RESERVATION_CONFIRMED
    } catch (error) {
      this.logger.error(
        `Error handling APPROVAL_GRANTED: ${error.message}`,
        error.stack,
      );
    }
  }
}
