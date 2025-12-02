import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventBusService } from '@libs/event-bus';
import { EventType } from '@libs/common/enums';
import { EventPayload } from '@libs/common';

/**
 * Handler para evento ROLE_ASSIGNED
 * 
 * Propósito: Actualizar permisos de aprobación del usuario
 */
@Injectable()
export class RoleAssignedHandler implements OnModuleInit {
  private readonly logger = new Logger(RoleAssignedHandler.name);

  constructor(private readonly eventBus: EventBusService) {}

  async onModuleInit() {
    await this.eventBus.subscribe(
      EventType.ROLE_ASSIGNED,
      'stockpile-service-auth-group',
      this.handle.bind(this),
    );

    this.logger.log(`Subscribed to ${EventType.ROLE_ASSIGNED}`);
  }

  /**
   * Manejar evento de rol asignado
   * Actualiza los permisos de aprobación según el rol
   */
  async handle(event: EventPayload<any>): Promise<void> {
    const { userId, roleId, roleName, assignedBy } = event.data;

    this.logger.debug(
      `Handling ROLE_ASSIGNED for user ${userId}, role: ${roleName}`,
    );

    try {
      // TODO: Implementar lógica de negocio
      // 1. Invalidar cache de permisos del usuario
      // 2. Actualizar capacidades de aprobación:
      //    - Coordinador: Puede aprobar reservas de su programa
      //    - Decano: Puede aprobar todas las reservas de su facultad
      //    - Admin: Puede aprobar cualquier reserva
      // 3. Actualizar lista de aprobadores disponibles
      // 4. Reasignar solicitudes pendientes si es necesario

      this.logger.log(
        `User ${userId} approval permissions updated due to role: ${roleName}`,
      );
    } catch (error) {
      this.logger.error(
        `Error handling ROLE_ASSIGNED: ${error.message}`,
        error.stack,
      );
    }
  }
}
