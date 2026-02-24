import { createLogger } from "@libs/common";
import { ImportResourceMode } from "@libs/common/enums";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ImportScheduleCommand } from "../commands/import-schedule.command";
import { ScheduleImportService } from "../services/schedule-import.service";
import { ImportScheduleResponseDto } from "@resources/infrastructure/dto/import-schedule.dto";

/**
 * Handler para importar horarios institucionales desde CSV
 * Orquesta la creación de recursos, docentes y reservas recurrentes
 */
@CommandHandler(ImportScheduleCommand)
export class ImportScheduleHandler
  implements ICommandHandler<ImportScheduleCommand>
{
  private readonly logger = createLogger("ImportScheduleHandler");

  constructor(
    private readonly scheduleImportService: ScheduleImportService
  ) {}

  async execute(
    command: ImportScheduleCommand
  ): Promise<ImportScheduleResponseDto> {
    this.logger.info("Executing ImportScheduleCommand", {
      resourceType: command.resourceType,
      mode: command.mode,
      recurrenceStartDate: command.recurrenceStartDate,
      recurrenceEndDate: command.recurrenceEndDate,
    });

    const result = await this.scheduleImportService.importScheduleFromCSV({
      csvContent: command.csvContent,
      resourceType: command.resourceType,
      recurrenceStartDate: command.recurrenceStartDate,
      recurrenceEndDate: command.recurrenceEndDate,
      userId: command.userId,
      mode: command.mode || ImportResourceMode.UPSERT,
      skipErrors: command.skipErrors ?? true,
      defaultCategoryCodes: command.defaultCategoryCodes,
      defaultTeacherRole: command.defaultTeacherRole,
      institutionalEmailDomain: command.institutionalEmailDomain,
    });

    this.logger.info("ImportScheduleCommand completed", {
      totalRows: result.totalRows,
      resourcesCreated: result.resourcesCreated,
      reservationsCreated: result.reservationsCreated,
      teachersCreated: result.teachersCreated,
      errorCount: result.errorCount,
    });

    return result;
  }
}
