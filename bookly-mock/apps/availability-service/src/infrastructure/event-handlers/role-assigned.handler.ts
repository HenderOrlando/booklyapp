import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventBusService } from '@libs/event-bus';
import { EventType } from '@libs/common/enums';
import { EventPayload } from '@libs/common';
import { AvailabilityCacheService } from '../cache';

/**
 * Handler para evento ROLE_ASSIGNED
 * 
 * Propósito: Actualizar permisos de reserva del usuario
 */
@Injectable()
export class RoleAssignedHandler implements OnModuleInit {
  private readonly logger = new Logger(RoleAssignedHandler.name);

  constructor(
    private readonly eventBus: EventBusService,
    private readonly cacheService: AvailabilityCacheService,
  ) {}

  async onModuleInit() {
    await this.eventBus.subscribe(
      EventType.ROLE_ASSIGNED,
      'availability-service-auth-group',
      this.handle.bind(this),
    );

    this.logger.log(`Subscribed to ${EventType.ROLE_ASSIGNED}`);
  }

  /**
   * Manejar evento de rol asignado
   * Actualiza los permisos de reserva del usuario según su nuevo rol
   */
  async handle(event: EventPayload<any>): Promise<void> {
    const { userId, roleId, roleName } = event.data;

    this.logger.debug(
      `Handling ROLE_ASSIGNED for user ${userId}, role: ${roleName}`,
    );

    try {
      // TODO: Implementar lógica de negocio
      // 1. Invalidar cache de permisos del usuario
      // 2. Actualizar límites de reserva según el rol:
      //    - Estudiante: X horas por semana
      //    - Profesor: Y horas por semana
      //    - Admin: Sin límites
      // 3. Actualizar tipos de recursos que puede reservar
      // 4. Actualizar si requiere aprobación o no

      // Invalidar cache de permisos del usuario
      await this.cacheService.invalidateUserPermissions(userId);

      this.logger.log(
        `User ${userId} reservation permissions updated due to role: ${roleName}. Cache invalidated.`,
      );
    } catch (error) {
      this.logger.error(
        `Error handling ROLE_ASSIGNED: ${error.message}`,
        error.stack,
      );
    }
  }
}
