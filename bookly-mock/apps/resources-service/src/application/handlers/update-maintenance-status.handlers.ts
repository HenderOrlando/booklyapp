import { createLogger } from "@libs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import {
  CancelMaintenanceCommand,
  CompleteMaintenanceCommand,
  StartMaintenanceCommand,
} from "../commands";
import { MaintenanceService } from "../services/maintenance.service";

/**
 * Handler para iniciar un mantenimiento
 * Bloquea automáticamente el recurso si affectsAvailability es true
 */
@CommandHandler(StartMaintenanceCommand)
export class StartMaintenanceHandler
  implements ICommandHandler<StartMaintenanceCommand>
{
  private readonly logger = createLogger("StartMaintenanceHandler");

  constructor(private readonly maintenanceService: MaintenanceService) {}

  async execute(command: StartMaintenanceCommand) {
    this.logger.info(`Starting maintenance ${command.maintenanceId}`);
    
    const maintenance = await this.maintenanceService.startMaintenanceWithResourceBlock(
      command.maintenanceId
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

  constructor(private readonly maintenanceService: MaintenanceService) {}

  async execute(command: CompleteMaintenanceCommand) {
    this.logger.info(`Completing maintenance ${command.maintenanceId}`);
    
    const maintenance = await this.maintenanceService.completeMaintenanceWithResourceRestore(
      command.maintenanceId
    );
    
    // Actualizar costo y notas si se proporcionaron
    if (command.cost !== undefined || command.notes) {
      const updates: any = {};
      if (command.cost !== undefined) {
        updates.cost = command.cost;
      }
      if (command.notes) {
        updates.notes = command.notes;
      }
      await this.maintenanceService.updateMaintenance(command.maintenanceId, updates);
    }
    
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

  constructor(private readonly maintenanceService: MaintenanceService) {}

  async execute(command: CancelMaintenanceCommand) {
    this.logger.info(`Cancelling maintenance ${command.maintenanceId}`);
    
    const maintenance = await this.maintenanceService.cancelMaintenanceWithResourceRestore(
      command.maintenanceId
    );
    
    // Agregar razón de cancelación en notas si se proporcionó
    if (command.reason) {
      const updates: any = {
        notes: maintenance.notes
          ? `${maintenance.notes}\nCancelled: ${command.reason}`
          : `Cancelled: ${command.reason}`,
      };
      await this.maintenanceService.updateMaintenance(command.maintenanceId, updates);
    }
    
    return maintenance;
  }
}
