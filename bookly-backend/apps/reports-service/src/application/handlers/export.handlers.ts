import { ReportsExportStatus } from "@libs/common/enums";
import { createLogger } from "@libs/common";
import {
  CommandHandler,
  ICommandHandler,
  IQueryHandler,
  QueryHandler,
} from "@nestjs/cqrs";
import { RequestExportCommand } from "../commands/export.commands";
import {
  GetExportStatusQuery,
  GetUserExportHistoryQuery,
} from "../queries/export.queries";
import { ExportService } from "../services";

const logger = createLogger("ExportHandlers");

/**
 * Request Export Handler
 */
@CommandHandler(RequestExportCommand)
export class RequestExportHandler
  implements ICommandHandler<RequestExportCommand>
{
  constructor(private readonly exportService: ExportService) {}

  async execute(command: RequestExportCommand): Promise<any> {
    logger.info("Executing RequestExportCommand", {
      userId: command.userId,
      reportType: command.reportType,
      format: command.format,
    });

    return await this.exportService.requestExport(
      command.userId,
      command.reportType,
      command.format,
      command.filters
    );
  }
}

/**
 * Get Export Status Handler
 */
@QueryHandler(GetExportStatusQuery)
export class GetExportStatusHandler
  implements IQueryHandler<GetExportStatusQuery>
{
  constructor(private readonly exportService: ExportService) {}

  async execute(query: GetExportStatusQuery): Promise<any> {
    logger.info("Executing GetExportStatusQuery", {
      exportId: query.exportId,
    });

    const exportEntity = await this.exportService.getExportStatus(
      query.exportId
    );

    if (!exportEntity) {
      return null;
    }

    // Agregar URL de descarga si está completado
    const response = exportEntity.toJSON();
    if (exportEntity.status === ReportsExportStatus.COMPLETED) {
      response.downloadUrl = this.exportService.getDownloadUrl(exportEntity.id);
    }

    return response;
  }
}

/**
 * Get User Export History Handler
 */
@QueryHandler(GetUserExportHistoryQuery)
export class GetUserExportHistoryHandler
  implements IQueryHandler<GetUserExportHistoryQuery>
{
  constructor(private readonly exportService: ExportService) {}

  async execute(query: GetUserExportHistoryQuery): Promise<any> {
    logger.info("Executing GetUserExportHistoryQuery", {
      userId: query.userId,
      page: query.page,
    });

    const result = await this.exportService.getUserExportHistory(
      query.userId,
      query.page,
      query.limit
    );

    // Agregar URL de descarga a exports completados
    const exportsWithUrls = result.exports.map((exp) => {
      const exportData = exp.toJSON();
      if (exp.status === ReportsExportStatus.COMPLETED) {
        exportData.downloadUrl = this.exportService.getDownloadUrl(exp.id);
      }
      return exportData;
    });

    return {
      ...result,
      exports: exportsWithUrls,
    };
  }
}
