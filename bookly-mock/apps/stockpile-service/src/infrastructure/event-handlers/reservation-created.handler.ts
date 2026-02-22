import { Injectable, Inject, Logger, OnModuleInit } from "@nestjs/common";
import { EventBusService } from "@libs/event-bus";
import { EventType } from "@libs/common/enums";
import { EventPayload } from "@libs/common";
import { ApprovalFlowService } from "@stockpile/application/services/approval-flow.service";
import { RedisService } from "@libs/redis";

/**
 * Handler para evento RESERVATION_CREATED
 * 
 * Propósito: Iniciar flujo de aprobación si es necesario
 */
@Injectable()
export class ReservationCreatedHandler implements OnModuleInit {
  private readonly logger = new Logger(ReservationCreatedHandler.name);

  constructor(
    private readonly eventBus: EventBusService,
    private readonly approvalFlowService: ApprovalFlowService,
    private readonly redis: RedisService,
  ) {}

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
      const requiresApproval = await this.checkRequiresApproval(resourceId, userId);

      if (requiresApproval) {
        this.logger.log(
          `Reservation ${reservationId} requires approval. Initiating approval flow`,
        );

        await this.eventBus.publish(EventType.APPROVAL_REQUESTED, {
          eventId: `approval-req-${reservationId}-${Date.now()}`,
          eventType: EventType.APPROVAL_REQUESTED,
          service: 'stockpile-service',
          timestamp: new Date(),
          data: {
            reservationId,
            resourceId,
            userId,
            startTime,
            endTime,
            purpose,
            priority: 'NORMAL',
          },
          metadata: {
            correlationId: event.metadata?.correlationId,
          },
        });
      } else {
        this.logger.log(
          `Reservation ${reservationId} auto-approved (no approval required)`,
        );

        await this.eventBus.publish(EventType.APPROVAL_GRANTED, {
          eventId: `auto-approve-${reservationId}-${Date.now()}`,
          eventType: EventType.APPROVAL_GRANTED,
          service: 'stockpile-service',
          timestamp: new Date(),
          data: {
            reservationId,
            resourceId,
            approvedBy: 'system',
            comments: 'Auto-approved: resource does not require approval',
          },
          metadata: {
            correlationId: event.metadata?.correlationId,
          },
        });
      }
    } catch (error) {
      this.logger.error(
        `Error handling RESERVATION_CREATED: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Determina si una reserva requiere aprobación basándose en la configuración
   * del recurso y los permisos del usuario
   */
  private async checkRequiresApproval(resourceId: string, userId: string): Promise<boolean> {
    try {
      const cachedConfig = await this.redis.get(`resource:config:${resourceId}`);

      if (cachedConfig) {
        const config = typeof cachedConfig === 'string' ? JSON.parse(cachedConfig) : cachedConfig;
        if (config.requiresApproval === false) return false;
      }

      const userPerms = await this.redis.get(`auth:perms:${userId}`);
      if (userPerms) {
        const perms = typeof userPerms === 'string' ? JSON.parse(userPerms) : userPerms;
        if (perms.autoApprove === true) return false;
      }

      return true;
    } catch {
      return true;
    }
  }
}
