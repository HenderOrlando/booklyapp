import { Module, OnModuleInit } from "@nestjs/common";
import { EventBusService } from "@libs/event-bus";
import { EventType, createLogger } from "@libs/common";

const logger = createLogger("EventBusIntegrationModule");

/**
 * Módulo de integración del Event Bus para Stockpile Service
 * 
 * Responsabilidades:
 * - Configurar suscripciones a eventos de availability-service
 * - Gestionar el ciclo de vida de las suscripciones
 * 
 * Nota: Los handlers deben estar registrados en StockpileModule
 */
@Module({})
export class EventBusIntegrationModule implements OnModuleInit {
  constructor(
    private readonly eventBus: EventBusService,
  ) {}

  async onModuleInit() {
    logger.info("Initializing Event Bus integrations for Stockpile Service");

    // Registrar suscripciones a eventos de reservas
    await this.subscribeToReservationEvents();

    logger.info("Event Bus integrations initialized successfully");
  }

  /**
   * Suscribirse a eventos de reservas desde availability-service
   * 
   * Nota: Los handlers reales deben implementarse cuando se integre
   * con NotificationEventHandler
   */
  private async subscribeToReservationEvents(): Promise<void> {
    const groupId = "stockpile-service-notifications";

    // RESERVATION_CREATED
    await this.eventBus.subscribe(
      EventType.RESERVATION_CREATED,
      groupId,
      async (event) => {
        logger.info("Received RESERVATION_CREATED event", {
          eventId: event.eventId,
          reservationId: event.data?.id,
        });
        // TODO: Integrar con NotificationEventHandler.handleReservationCreated
      },
    );

    // RESERVATION_UPDATED
    await this.eventBus.subscribe(
      EventType.RESERVATION_UPDATED,
      groupId,
      async (event) => {
        logger.info("Received RESERVATION_UPDATED event", {
          eventId: event.eventId,
          reservationId: event.data?.id,
        });
        // TODO: Integrar con NotificationEventHandler.handleReservationUpdated
      },
    );

    // RESERVATION_CANCELLED
    await this.eventBus.subscribe(
      EventType.RESERVATION_CANCELLED,
      groupId,
      async (event) => {
        logger.info("Received RESERVATION_CANCELLED event", {
          eventId: event.eventId,
          reservationId: event.data?.id,
        });
        // TODO: Integrar con NotificationEventHandler.handleReservationCancelled
      },
    );

    // RESERVATION_APPROVED
    await this.eventBus.subscribe(
      EventType.RESERVATION_APPROVED,
      groupId,
      async (event) => {
        logger.info("Received RESERVATION_APPROVED event", {
          eventId: event.eventId,
          reservationId: event.data?.id,
        });
        // TODO: Integrar con NotificationEventHandler.handleReservationApproved
      },
    );

    // RESERVATION_REJECTED
    await this.eventBus.subscribe(
      EventType.RESERVATION_REJECTED,
      groupId,
      async (event) => {
        logger.info("Received RESERVATION_REJECTED event", {
          eventId: event.eventId,
          reservationId: event.data?.id,
        });
        // TODO: Integrar con NotificationEventHandler.handleReservationRejected
      },
    );

    logger.info("Subscribed to reservation events", {
      groupId,
      events: [
        EventType.RESERVATION_CREATED,
        EventType.RESERVATION_UPDATED,
        EventType.RESERVATION_CANCELLED,
        EventType.RESERVATION_APPROVED,
        EventType.RESERVATION_REJECTED,
      ],
    });
  }
}
