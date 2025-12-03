import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { EventBusService } from "@libs/event-bus";
import { EventType } from "@libs/common/enums";
import { EventPayload } from "@libs/common";

/**
 * Handler para evento RESERVATION_CREATED
 * 
 * Propósito: Iniciar flujo de aprobación si es necesario
 */
@Injectable()
export class ReservationCreatedHandler implements OnModuleInit {
  private readonly logger = new Logger(ReservationCreatedHandler.name);

  constructor(private readonly eventBus: EventBusService) {}

  async onModuleInit() {
    await this.eventBus.subscribe(
      EventType.RESERVATION_CREATED,
      'stockpile-service-reservations-group',
      this.handle.bind(this),
    );

    this.logger.log(`Subscribed to ${EventType.RESERVATION_CREATED}`);
  }

  /**
   * Manejar evento de reserva creada
   * Determina si requiere aprobación e inicia el flujo correspondiente
   */
  async handle(event: EventPayload<any>): Promise<void> {
    const { reservationId, resourceId, userId, startTime, endTime, purpose } = event.data;

    this.logger.debug(
      `Handling RESERVATION_CREATED for reservation ${reservationId}`,
    );

    try {
      // TODO: Implementar lógica de negocio
      // 1. Verificar si el recurso requiere aprobación
      // 2. Verificar si el usuario tiene permisos de auto-aprobación
      // 3. Si requiere aprobación:
      //    - Crear registro de aprobación
      //    - Determinar prioridad (low, medium, high)
      //    - Publicar evento APPROVAL_REQUESTED
      //    - Notificar a aprobadores
      // 4. Si no requiere aprobación:
      //    - Auto-aprobar
      //    - Publicar evento APPROVAL_GRANTED

      const requiresApproval = true; // TODO: Lógica real de validación

      if (requiresApproval) {
        this.logger.log(
          `Reservation ${reservationId} requires approval. Initiating approval flow`,
        );
        // TODO: Publicar APPROVAL_REQUESTED
      } else {
        this.logger.log(
          `Reservation ${reservationId} auto-approved`,
        );
        // TODO: Publicar APPROVAL_GRANTED
      }
    } catch (error) {
      this.logger.error(
        `Error handling RESERVATION_CREATED: ${error.message}`,
        error.stack,
      );
    }
  }
}
