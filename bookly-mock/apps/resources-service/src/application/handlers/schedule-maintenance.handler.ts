import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { MaintenanceEntity } from "../../domain/entities/maintenance.entity";
import { ScheduleMaintenanceCommand } from "../commands/schedule-maintenance.command";
import { MaintenanceService } from "../services/maintenance.service";

/**
 * Schedule Maintenance Command Handler
 * Handler para programar un mantenimiento
 */
@CommandHandler(ScheduleMaintenanceCommand)
export class ScheduleMaintenanceHandler
  implements ICommandHandler<ScheduleMaintenanceCommand>
{
  constructor(private readonly maintenanceService: MaintenanceService) {}

  async execute(
    command: ScheduleMaintenanceCommand
  ): Promise<MaintenanceEntity> {
    return await this.maintenanceService.scheduleMaintenance({
      resourceId: command.resourceId,
      type: command.type,
      title: command.title,
      description: command.description,
      scheduledStartDate: command.scheduledStartDate,
      scheduledEndDate: command.scheduledEndDate,
      performedBy: command.performedBy,
      cost: command.cost,
      notes: command.notes,
      affectsAvailability: command.affectsAvailability,
      audit: command.createdBy
        ? {
            createdBy: command.createdBy,
          }
        : undefined,
    });
  }
}
