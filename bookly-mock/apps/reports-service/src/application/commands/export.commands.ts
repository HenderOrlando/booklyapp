import { ReportDataType, ReportsExportFormat } from "@libs/common/enums";

/**
 * Request Export Command
 * Comando para solicitar una exportación
 */
export class RequestExportCommand {
  constructor(
    public readonly userId: string,
    public readonly reportType: ReportDataType,
    public readonly format: ReportsExportFormat,
    public readonly filters: Record<string, any>
  ) {}
}
