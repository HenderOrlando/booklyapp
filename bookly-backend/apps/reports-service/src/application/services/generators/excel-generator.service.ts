import { createLogger } from "@libs/common";
import { Injectable } from "@nestjs/common";

const logger = createLogger("ExcelGeneratorService");

/**
 * Excel Generator Service
 * Servicio para generar archivos Excel a partir de datos de reportes
 *
 * NOTA: Esta es una implementación simplificada que genera XML compatible con Excel.
 * En producción, usar librerías como exceljs o xlsx
 */
@Injectable()
export class ExcelGeneratorService {
  /**
   * Generar Excel desde datos
   */
  async generate(data: any[], sheetName: string = "Sheet1"): Promise<Buffer> {
    try {
      logger.debug("Generating Excel", { recordCount: data.length });

      if (data.length === 0) {
        logger.warn("No data provided for Excel generation");
        return Buffer.from("", "utf-8");
      }

      const fields = Object.keys(data[0]);
      const xmlContent = this.generateSpreadsheetXml(data, fields, sheetName);
      const buffer = Buffer.from(xmlContent, "utf-8");

      logger.info("Excel generated successfully", {
        recordCount: data.length,
        fieldCount: fields.length,
        size: buffer.length,
      });

      return buffer;
    } catch (error: any) {
      logger.error("Failed to generate Excel", error);
      throw new Error(`Excel generation failed: ${error.message}`);
    }
  }

  /**
   * Generar Excel de reporte de uso
   */
  async generateUsageReportExcel(report: any): Promise<Buffer> {
    try {
      const data = [
        {
          Recurso: report.resourceName || report.resourceId,
          Tipo: report.resourceType,
          "Período Inicio": report.startDate,
          "Período Fin": report.endDate,
          "Total Reservas": report.totalReservations,
          "Reservas Confirmadas": report.confirmedReservations,
          "Reservas Canceladas": report.cancelledReservations,
          "No Show": report.noShowReservations || 0,
          "Horas Totales": report.totalHoursReserved,
          "Horas Usadas": report.totalHoursUsed,
          "Ocupación (%)": report.occupancyRate,
          "Duración Promedio": report.averageSessionDuration,
        },
      ];

      return await this.generate(data, "Reporte de Uso");
    } catch (error: any) {
      logger.error("Failed to generate usage report Excel", error);
      throw error;
    }
  }

  /**
   * Generar Excel de reporte de usuario
   */
  async generateUserReportExcel(report: any): Promise<Buffer> {
    try {
      const data = [
        {
          "Usuario ID": report.userId,
          Nombre: report.userName,
          Email: report.userEmail,
          "Período Inicio": report.startDate,
          "Período Fin": report.endDate,
          "Total Reservas": report.totalReservations,
          "Reservas Completadas": report.completedReservations,
          "Reservas Canceladas": report.cancelledReservations,
          "No Show": report.noShowReservations || 0,
          "Horas Totales": report.totalHours,
          "Recursos Utilizados": report.resourcesUsed,
        },
      ];

      return await this.generate(data, "Reporte de Usuario");
    } catch (error: any) {
      logger.error("Failed to generate user report Excel", error);
      throw error;
    }
  }

  /**
   * Generar Excel de múltiples registros
   */
  async generateMultiRecordExcel(
    records: any[],
    sheetName: string = "Datos"
  ): Promise<Buffer> {
    try {
      return await this.generate(records, sheetName);
    } catch (error: any) {
      logger.error("Failed to generate multi-record Excel", error);
      throw error;
    }
  }

  /**
   * Generar XML compatible con Excel (SpreadsheetML)
   */
  private generateSpreadsheetXml(
    data: any[],
    fields: string[],
    sheetName: string
  ): string {
    const header = fields
      .map(
        (f) => `<Cell><Data ss:Type="String">${this.escapeXml(f)}</Data></Cell>`
      )
      .join("");

    const rows = data
      .map(
        (record) =>
          `<Row>${fields
            .map((field) => {
              const value = record[field] || "";
              const type = typeof value === "number" ? "Number" : "String";
              return `<Cell><Data ss:Type="${type}">${this.escapeXml(String(value))}</Data></Cell>`;
            })
            .join("")}</Row>`
      )
      .join("");

    return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Header">
   <Font ss:Bold="1"/>
   <Interior ss:Color="#4472C4" ss:Pattern="Solid"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="${this.escapeXml(sheetName)}">
  <Table>
   <Row ss:StyleID="Header">${header}</Row>
   ${rows}
  </Table>
 </Worksheet>
</Workbook>`;
  }

  /**
   * Escapar caracteres XML
   */
  private escapeXml(value: string): string {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }
}
