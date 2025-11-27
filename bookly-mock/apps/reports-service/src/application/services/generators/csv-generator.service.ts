import { createLogger } from "@libs/common";
import { Injectable } from "@nestjs/common";

const logger = createLogger("CsvGeneratorService");

/**
 * CSV Generator Service
 * Servicio para generar archivos CSV a partir de datos de reportes
 */
@Injectable()
export class CsvGeneratorService {
  /**
   * Generar CSV desde datos
   */
  async generate(data: any[], fields?: string[]): Promise<string> {
    try {
      logger.debug("Generating CSV", { recordCount: data.length });

      if (data.length === 0) {
        logger.warn("No data provided for CSV generation");
        return "";
      }

      // Determinar campos automáticamente si no se especifican
      const csvFields = fields || Object.keys(data[0]);

      // Generar header
      const header = csvFields
        .map((field) => this.escapeField(field))
        .join(",");

      // Generar rows
      const rows = data.map((record) =>
        csvFields
          .map((field) => this.escapeField(String(record[field] || "")))
          .join(",")
      );

      const csv = [header, ...rows].join("\n");

      logger.info("CSV generated successfully", {
        recordCount: data.length,
        fieldCount: csvFields.length,
        size: csv.length,
      });

      return csv;
    } catch (error: any) {
      logger.error("Failed to generate CSV", error);
      throw new Error(`CSV generation failed: ${error.message}`);
    }
  }

  /**
   * Escapar campos CSV
   */
  private escapeField(field: string): string {
    if (field.includes(",") || field.includes('"') || field.includes("\n")) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  }

  /**
   * Generar CSV de reporte de uso
   */
  async generateUsageReportCsv(report: any): Promise<string> {
    try {
      const data = [
        {
          recurso: report.resourceName || report.resourceId,
          tipo: report.resourceType,
          periodo_inicio: report.startDate,
          periodo_fin: report.endDate,
          total_reservas: report.totalReservations,
          reservas_confirmadas: report.confirmedReservations,
          reservas_canceladas: report.cancelledReservations,
          no_show: report.noShowReservations || 0,
          horas_totales: report.totalHoursReserved,
          horas_usadas: report.totalHoursUsed,
          ocupacion_porcentaje: report.occupancyRate,
          duracion_promedio: report.averageSessionDuration,
        },
      ];

      return await this.generate(data);
    } catch (error: any) {
      logger.error("Failed to generate usage report CSV", error);
      throw error;
    }
  }

  /**
   * Generar CSV de reporte de usuario
   */
  async generateUserReportCsv(report: any): Promise<string> {
    try {
      const data = [
        {
          usuario_id: report.userId,
          nombre: report.userName,
          email: report.userEmail,
          periodo_inicio: report.startDate,
          periodo_fin: report.endDate,
          total_reservas: report.totalReservations,
          reservas_completadas: report.completedReservations,
          reservas_canceladas: report.cancelledReservations,
          no_show: report.noShowReservations || 0,
          horas_totales: report.totalHours,
          recursos_utilizados: report.resourcesUsed,
        },
      ];

      return await this.generate(data);
    } catch (error: any) {
      logger.error("Failed to generate user report CSV", error);
      throw error;
    }
  }

  /**
   * Generar CSV de múltiples registros
   */
  async generateMultiRecordCsv(
    records: any[],
    fields?: string[]
  ): Promise<string> {
    try {
      return await this.generate(records, fields);
    } catch (error: any) {
      logger.error("Failed to generate multi-record CSV", error);
      throw error;
    }
  }
}
