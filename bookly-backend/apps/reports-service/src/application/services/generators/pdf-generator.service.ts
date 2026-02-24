import { createLogger } from "@libs/common";
import { Injectable } from "@nestjs/common";

const logger = createLogger("PdfGeneratorService");

/**
 * PDF Generator Service
 * Servicio para generar archivos PDF a partir de datos de reportes
 *
 * NOTA: Esta es una implementación simplificada.
 * En producción, usar librerías como pdfkit, puppeteer, o jspdf
 */
@Injectable()
export class PdfGeneratorService {
  /**
   * Generar PDF de reporte de uso
   */
  async generateUsageReportPdf(report: any): Promise<Buffer> {
    try {
      logger.debug("Generating PDF for usage report", {
        resourceId: report.resourceId,
      });

      // Generar contenido HTML (simulado)
      const htmlContent = this.generateUsageReportHtml(report);

      // En producción, convertir HTML a PDF usando puppeteer o similar
      // Por ahora, retornamos el HTML como Buffer
      const pdfBuffer = Buffer.from(htmlContent, "utf-8");

      logger.info("PDF generated successfully", {
        resourceId: report.resourceId,
        size: pdfBuffer.length,
      });

      return pdfBuffer;
    } catch (error: any) {
      logger.error("Failed to generate usage report PDF", error);
      throw new Error(`PDF generation failed: ${error.message}`);
    }
  }

  /**
   * Generar PDF de reporte de usuario
   */
  async generateUserReportPdf(report: any): Promise<Buffer> {
    try {
      logger.debug("Generating PDF for user report", {
        userId: report.userId,
      });

      const htmlContent = this.generateUserReportHtml(report);
      const pdfBuffer = Buffer.from(htmlContent, "utf-8");

      logger.info("PDF generated successfully", {
        userId: report.userId,
        size: pdfBuffer.length,
      });

      return pdfBuffer;
    } catch (error: any) {
      logger.error("Failed to generate user report PDF", error);
      throw error;
    }
  }

  /**
   * Generar PDF de reporte de demanda
   */
  async generateDemandReportPdf(report: any): Promise<Buffer> {
    try {
      logger.debug("Generating PDF for demand report", {
        resourceId: report.resourceId,
      });

      const htmlContent = this.generateDemandReportHtml(report);
      const pdfBuffer = Buffer.from(htmlContent, "utf-8");

      logger.info("PDF generated successfully", {
        resourceId: report.resourceId,
        size: pdfBuffer.length,
      });

      return pdfBuffer;
    } catch (error: any) {
      logger.error("Failed to generate demand report PDF", error);
      throw error;
    }
  }

  /**
   * Generar HTML para reporte de uso
   */
  private generateUsageReportHtml(report: any): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Reporte de Uso - ${report.resourceName || report.resourceId}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
    .section { margin: 20px 0; }
    .label { font-weight: bold; color: #34495e; }
    .value { margin-left: 10px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 12px; text-align: left; border: 1px solid #ddd; }
    th { background-color: #3498db; color: white; }
    tr:nth-child(even) { background-color: #f2f2f2; }
  </style>
</head>
<body>
  <h1>Reporte de Uso de Recurso</h1>
  
  <div class="section">
    <p><span class="label">Recurso:</span><span class="value">${report.resourceName || report.resourceId}</span></p>
    <p><span class="label">Tipo:</span><span class="value">${report.resourceType}</span></p>
    <p><span class="label">Período:</span><span class="value">${report.startDate} - ${report.endDate}</span></p>
  </div>

  <h2>Estadísticas</h2>
  <table>
    <tr>
      <th>Métrica</th>
      <th>Valor</th>
    </tr>
    <tr>
      <td>Total Reservas</td>
      <td>${report.totalReservations}</td>
    </tr>
    <tr>
      <td>Reservas Confirmadas</td>
      <td>${report.confirmedReservations}</td>
    </tr>
    <tr>
      <td>Reservas Canceladas</td>
      <td>${report.cancelledReservations}</td>
    </tr>
    <tr>
      <td>No Show</td>
      <td>${report.noShowReservations || 0}</td>
    </tr>
    <tr>
      <td>Horas Totales</td>
      <td>${report.totalHoursReserved}</td>
    </tr>
    <tr>
      <td>Horas Usadas</td>
      <td>${report.totalHoursUsed}</td>
    </tr>
    <tr>
      <td>Tasa de Ocupación</td>
      <td>${report.occupancyRate}%</td>
    </tr>
    <tr>
      <td>Duración Promedio</td>
      <td>${report.averageSessionDuration} horas</td>
    </tr>
  </table>

  <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #7f8c8d; font-size: 12px;">
    <p>Generado por Bookly - Sistema de Reservas UFPS</p>
    <p>Fecha de generación: ${new Date().toLocaleString()}</p>
  </footer>
</body>
</html>
    `;
  }

  /**
   * Generar HTML para reporte de usuario
   */
  private generateUserReportHtml(report: any): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Reporte de Usuario - ${report.userName}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
    .section { margin: 20px 0; }
    .label { font-weight: bold; color: #34495e; }
    .value { margin-left: 10px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 12px; text-align: left; border: 1px solid #ddd; }
    th { background-color: #3498db; color: white; }
  </style>
</head>
<body>
  <h1>Reporte de Usuario</h1>
  
  <div class="section">
    <p><span class="label">Usuario:</span><span class="value">${report.userName}</span></p>
    <p><span class="label">Email:</span><span class="value">${report.userEmail}</span></p>
    <p><span class="label">Período:</span><span class="value">${report.startDate} - ${report.endDate}</span></p>
  </div>

  <h2>Resumen de Actividad</h2>
  <table>
    <tr>
      <th>Métrica</th>
      <th>Valor</th>
    </tr>
    <tr>
      <td>Total Reservas</td>
      <td>${report.totalReservations}</td>
    </tr>
    <tr>
      <td>Completadas</td>
      <td>${report.completedReservations}</td>
    </tr>
    <tr>
      <td>Canceladas</td>
      <td>${report.cancelledReservations}</td>
    </tr>
    <tr>
      <td>No Show</td>
      <td>${report.noShowReservations || 0}</td>
    </tr>
    <tr>
      <td>Horas Totales</td>
      <td>${report.totalHours}</td>
    </tr>
    <tr>
      <td>Recursos Utilizados</td>
      <td>${report.resourcesUsed}</td>
    </tr>
  </table>

  <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #7f8c8d; font-size: 12px;">
    <p>Generado por Bookly - Sistema de Reservas UFPS</p>
    <p>Fecha de generación: ${new Date().toLocaleString()}</p>
  </footer>
</body>
</html>
    `;
  }

  /**
   * Generar HTML para reporte de demanda
   */
  private generateDemandReportHtml(report: any): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Reporte de Demanda Insatisfecha</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    h1 { color: #2c3e50; border-bottom: 3px solid #e74c3c; padding-bottom: 10px; }
    .section { margin: 20px 0; }
    .label { font-weight: bold; color: #34495e; }
    .value { margin-left: 10px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 12px; text-align: left; border: 1px solid #ddd; }
    th { background-color: #e74c3c; color: white; }
  </style>
</head>
<body>
  <h1>Reporte de Demanda Insatisfecha</h1>
  
  <div class="section">
    <p><span class="label">Recurso:</span><span class="value">${report.resourceId}</span></p>
    <p><span class="label">Período:</span><span class="value">${report.period}</span></p>
  </div>

  <h2>Estadísticas de Demanda</h2>
  <table>
    <tr>
      <th>Métrica</th>
      <th>Valor</th>
    </tr>
    <tr>
      <td>Intentos de Reserva</td>
      <td>${report.attemptCount || 0}</td>
    </tr>
    <tr>
      <td>Usuarios Afectados</td>
      <td>${report.affectedUsers || 0}</td>
    </tr>
    <tr>
      <td>Horas Solicitadas</td>
      <td>${report.requestedHours || 0}</td>
    </tr>
  </table>

  <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #7f8c8d; font-size: 12px;">
    <p>Generado por Bookly - Sistema de Reservas UFPS</p>
    <p>Fecha de generación: ${new Date().toLocaleString()}</p>
  </footer>
</body>
</html>
    `;
  }
}
