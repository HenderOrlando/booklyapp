import { EventType, ResourceStatus } from "@libs/common/enums";
import { createLogger } from "@libs/common";
import { EventBusService } from "@libs/event-bus";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { MaintenanceRepository } from "../../infrastructure/repositories/maintenance.repository";
import { ResourceRepository } from "../../infrastructure/repositories/resource.repository";
import {
  CancelMaintenanceCommand,
  CompleteMaintenanceCommand,
  StartMaintenanceCommand,
} from "../commands";

/**
 * Handler para iniciar un mantenimiento
 * Bloquea automáticamente el recurso si affectsAvailability es true
 */
@CommandHandler(StartMaintenanceCommand)
export class StartMaintenanceHandler
  implements ICommandHandler<StartMaintenanceCommand>
{
  private readonly logger = createLogger("StartMaintenanceHandler");

  constructor(
    private readonly maintenanceRepository: MaintenanceRepository,
    private readonly resourceRepository: ResourceRepository,
    private readonly eventBusService: EventBusService
  ) {}

  async execute(command: StartMaintenanceCommand) {
    this.logger.info(`Starting maintenance ${command.maintenanceId}`);

    const maintenance = await this.maintenanceRepository.findById(
      command.maintenanceId
    );

    if (!maintenance) {
      throw new Error(`Maintenance with ID ${command.maintenanceId} not found`);
    }

    // Cambiar estado usando método de dominio
    maintenance.start();

    // Bloquear recurso automáticamente si el mantenimiento afecta la disponibilidad
    if (maintenance.affectsAvailability) {
      this.logger.info(
        `Blocking resource ${maintenance.resourceId} due to maintenance`
      );

      const resource = await this.resourceRepository.findById(
        maintenance.resourceId
      );
      const previousStatus = resource?.status || ResourceStatus.AVAILABLE;

      await this.resourceRepository.update(maintenance.resourceId, {
        status: ResourceStatus.MAINTENANCE,
      });

      // Publicar evento de cambio de estado
      await this.eventBusService.publish(EventType.RESOURCE_STATUS_CHANGED, {
        eventId: `resource-status-changed-${maintenance.resourceId}-${Date.now()}`,
        eventType: EventType.RESOURCE_STATUS_CHANGED,
        service: "resources-service",
        timestamp: new Date(),
        data: {
          resourceId: maintenance.resourceId,
          previousStatus,
          newStatus: ResourceStatus.MAINTENANCE,
          updatedBy: "system",
          reason: `Maintenance started: ${command.maintenanceId}`,
        },
        metadata: {
          aggregateId: maintenance.resourceId,
          aggregateType: "Resource",
          version: 1,
        },
      });

      this.logger.info(
        `Resource ${maintenance.resourceId} status set to MAINTENANCE`
      );
    }

    // Guardar cambios del mantenimiento
    await this.maintenanceRepository.update(command.maintenanceId, {
      status: maintenance.status,
      actualStartDate: maintenance.actualStartDate,
    });

    this.logger.info(
      `Maintenance ${command.maintenanceId} started successfully`
    );

    return maintenance;
  }
}

/**
 * Handler para completar un mantenimiento
 * Restaura el recurso a AVAILABLE si affectsAvailability es true
 */
@CommandHandler(CompleteMaintenanceCommand)
export class CompleteMaintenanceHandler
  implements ICommandHandler<CompleteMaintenanceCommand>
{
  private readonly logger = createLogger("CompleteMaintenanceHandler");

  constructor(
    private readonly maintenanceRepository: MaintenanceRepository,
    private readonly resourceRepository: ResourceRepository,
    private readonly eventBusService: EventBusService
  ) {}

  async execute(command: CompleteMaintenanceCommand) {
    this.logger.info(`Completing maintenance ${command.maintenanceId}`);

    const maintenance = await this.maintenanceRepository.findById(
      command.maintenanceId
    );

    if (!maintenance) {
      throw new Error(`Maintenance with ID ${command.maintenanceId} not found`);
    }

    // Cambiar estado usando método de dominio
    maintenance.complete();

    // Restaurar recurso a AVAILABLE automáticamente si el mantenimiento afectó la disponibilidad
    if (maintenance.affectsAvailability) {
      this.logger.info(
        `Restoring resource ${maintenance.resourceId} after maintenance completion`
      );

      const resource = await this.resourceRepository.findById(
        maintenance.resourceId
      );
      const previousStatus = resource?.status || ResourceStatus.MAINTENANCE;

      await this.resourceRepository.update(maintenance.resourceId, {
        status: ResourceStatus.AVAILABLE,
      });

      // Publicar evento de cambio de estado
      await this.eventBusService.publish(EventType.RESOURCE_STATUS_CHANGED, {
        eventId: `resource-status-changed-${maintenance.resourceId}-${Date.now()}`,
        eventType: EventType.RESOURCE_STATUS_CHANGED,
        service: "resources-service",
        timestamp: new Date(),
        data: {
          resourceId: maintenance.resourceId,
          previousStatus,
          newStatus: ResourceStatus.AVAILABLE,
          updatedBy: "system",
          reason: `Maintenance completed: ${command.maintenanceId}`,
        },
        metadata: {
          aggregateId: maintenance.resourceId,
          aggregateType: "Resource",
          version: 1,
        },
      });

      this.logger.info(
        `Resource ${maintenance.resourceId} status restored to AVAILABLE`
      );
    }

    // Actualizar costo y notas si se proporcionaron
    const updates: any = {
      status: maintenance.status,
      actualEndDate: maintenance.actualEndDate,
    };

    if (command.cost !== undefined) {
      updates.cost = command.cost;
    }
    if (command.notes) {
      updates.notes = command.notes;
    }

    // Guardar cambios
    await this.maintenanceRepository.update(command.maintenanceId, updates);

    this.logger.info(
      `Maintenance ${command.maintenanceId} completed successfully`
    );

    return maintenance;
  }
}

/**
 * Handler para cancelar un mantenimiento
 */
@CommandHandler(CancelMaintenanceCommand)
export class CancelMaintenanceHandler
  implements ICommandHandler<CancelMaintenanceCommand>
{
  private readonly logger = createLogger("CancelMaintenanceHandler");

  constructor(private readonly maintenanceRepository: MaintenanceRepository) {}

  async execute(command: CancelMaintenanceCommand) {
    this.logger.info(`Cancelling maintenance ${command.maintenanceId}`);

    const maintenance = await this.maintenanceRepository.findById(
      command.maintenanceId
    );

    if (!maintenance) {
      throw new Error(`Maintenance with ID ${command.maintenanceId} not found`);
    }

    // Cambiar estado usando método de dominio
    maintenance.cancel();

    // Preparar updates
    const updates: any = {
      status: maintenance.status,
    };

    // Agregar razón de cancelación en notas si se proporcionó
    if (command.reason) {
      updates.notes = maintenance.notes
        ? `${maintenance.notes}\nCancelled: ${command.reason}`
        : `Cancelled: ${command.reason}`;
    }

    // Guardar cambios
    await this.maintenanceRepository.update(command.maintenanceId, updates);

    this.logger.info(
      `Maintenance ${command.maintenanceId} cancelled successfully`
    );

    return maintenance;
  }
}
