import { createLogger } from "@libs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ImportResourcesCommand } from "../commands/import-resources.command";
import { ResourceImportService, ImportResult } from "../services/resource-import.service";

/**
 * Handler para importar recursos desde CSV
 */
@CommandHandler(ImportResourcesCommand)
export class ImportResourcesHandler
  implements ICommandHandler<ImportResourcesCommand>
{
  private readonly logger = createLogger("ImportResourcesHandler");

  constructor(private readonly resourceImportService: ResourceImportService) {}

  async execute(command: ImportResourcesCommand): Promise<ImportResult> {
    this.logger.info("Executing ImportResourcesCommand", {
      mode: command.mode,
      skipErrors: command.skipErrors,
    });

    const result = await this.resourceImportService.importFromCSV(
      command.csvContent,
      command.mode,
      command.userId,
      command.skipErrors
    );

    return result;
  }
}
