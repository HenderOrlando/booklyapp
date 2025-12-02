import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventBusService } from '@libs/event-bus';
import { EventType } from '@libs/common/enums';
import { EventPayload } from '@libs/common';

/**
 * Handler para evento APPROVAL_REJECTED
 * 
 * Propósito: Rechazar la reserva cuando se rechaza la solicitud
 */
@Injectable()
export class ApprovalRejectedHandler implements OnModuleInit {
  private readonly logger = new Logger(ApprovalRejectedHandler.name);

  constructor(private readonly eventBus: EventBusService) {}

  async onModuleInit() {
    await this.eventBus.subscribe(
      EventType.APPROVAL_REJECTED,
      'availability-service-approvals-group',
      this.handle.bind(this),
    );

    this.logger.log(`Subscribed to ${EventType.APPROVAL_REJECTED}`);
  }

  /**
   * Manejar evento de aprobación rechazada
   * Rechaza la reserva y libera el recurso
   */
  async handle(event: EventPayload<any>): Promise<void> {
    const { approvalId, reservationId, resourceId, rejectedBy, reason } = event.data;

    this.logger.debug(
      `Handling APPROVAL_REJECTED for reservation ${reservationId}`,
    );

    try {
      // TODO: Implementar lógica de negocio
      // 1. Buscar la reserva por reservationId
      // 2. Actualizar estado a 'rejected'
      // 3. Registrar quién rechazó y la razón
      // 4. Liberar el slot de tiempo
      // 5. Publicar evento RESERVATION_REJECTED
      // 6. Notificar al usuario solicitante
      // 7. Verificar lista de espera para ese recurso/horario

      this.logger.warn(
        `Reservation ${reservationId} rejected by ${rejectedBy}. Reason: ${reason}`,
      );

      // TODO: Publicar RESERVATION_REJECTED
      // TODO: Verificar y notificar lista de espera
    } catch (error) {
      this.logger.error(
        `Error handling APPROVAL_REJECTED: ${error.message}`,
        error.stack,
      );
    }
  }
}
