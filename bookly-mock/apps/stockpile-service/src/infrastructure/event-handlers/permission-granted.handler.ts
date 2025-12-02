import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventBusService } from '@libs/event-bus';
import { EventType } from '@libs/common/enums';
import { EventPayload } from '@libs/common';

/**
 * Handler para evento PERMISSION_GRANTED
 * 
 * Propósito: Actualizar capacidades específicas de aprobación
 */
@Injectable()
export class PermissionGrantedHandler implements OnModuleInit {
  private readonly logger = new Logger(PermissionGrantedHandler.name);

  constructor(private readonly eventBus: EventBusService) {}

  async onModuleInit() {
    await this.eventBus.subscribe(
      EventType.PERMISSION_GRANTED,
      'stockpile-service-auth-group',
      this.handle.bind(this),
    );

    this.logger.log(`Subscribed to ${EventType.PERMISSION_GRANTED}`);
  }

  /**
   * Manejar evento de permiso otorgado
   * Actualiza permisos específicos de aprobación
   */
  async handle(event: EventPayload<any>): Promise<void> {
    const { targetId, targetType, permissionId, permissionName, grantedBy } = event.data;

    this.logger.debug(
      `Handling PERMISSION_GRANTED for ${targetType} ${targetId}, permission: ${permissionName}`,
    );

    try {
      // TODO: Implementar lógica de negocio
      // 1. Invalidar cache de permisos
      // 2. Actualizar permisos específicos:
      //    - approve_reservations: Puede aprobar reservas
      //    - approve_high_priority: Puede aprobar reservas de alta prioridad
      //    - generate_documents: Puede generar documentos oficiales
      //    - override_approvals: Puede anular aprobaciones
      // 3. Actualizar flujos de aprobación afectados

      this.logger.log(
        `Permission ${permissionName} granted to ${targetType} ${targetId} by ${grantedBy}`,
      );
    } catch (error) {
      this.logger.error(
        `Error handling PERMISSION_GRANTED: ${error.message}`,
        error.stack,
      );
    }
  }
}
