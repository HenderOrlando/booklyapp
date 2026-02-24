import { MaintenanceType } from "@libs/common/enums";

/**
 * Schedule Maintenance Command
 * Command para programar un mantenimiento para un recurso
 */
export class ScheduleMaintenanceCommand {
  constructor(
    public readonly resourceId: string,
    public readonly type: MaintenanceType,
    public readonly title: string,
    public readonly description: string,
    public readonly scheduledStartDate: Date,
    public readonly scheduledEndDate: Date,
    public readonly performedBy?: string,
    public readonly cost?: number,
    public readonly notes?: string,
    public readonly affectsAvailability: boolean = true,
    public readonly createdBy?: string
  ) {}
}
