import { ImportResourceMode, ResourceType } from "@libs/common/enums";

/**
 * Comando para importar horarios institucionales desde CSV
 * Crea recursos, reservas recurrentes y usuarios docentes
 */
export class ImportScheduleCommand {
  constructor(
    public readonly csvContent: string,
    public readonly resourceType: ResourceType,
    public readonly recurrenceStartDate: string,
    public readonly recurrenceEndDate: string,
    public readonly userId: string,
    public readonly mode: ImportResourceMode = ImportResourceMode.UPSERT,
    public readonly skipErrors: boolean = true,
    public readonly defaultCategoryCodes?: string[],
    public readonly defaultTeacherRole?: string,
    public readonly institutionalEmailDomain?: string
  ) {}
}
