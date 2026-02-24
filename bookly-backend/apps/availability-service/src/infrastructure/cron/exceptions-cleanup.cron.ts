import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { AvailabilityExceptionRepository } from "../repositories/availability-exception.repository";

/**
 * CronJob para limpieza de excepciones de disponibilidad antiguas
 * Se ejecuta semanalmente para eliminar excepciones pasadas
 */
@Injectable()
export class ExceptionsCleanupCron {
  private readonly logger = new Logger(ExceptionsCleanupCron.name);

  constructor(private readonly repository: AvailabilityExceptionRepository) {}

  /**
   * Limpia excepciones de disponibilidad con más de 90 días de antigüedad
   * Se ejecuta todos los domingos a las 02:00 AM
   */
  @Cron(CronExpression.EVERY_WEEK, {
    name: "exceptions-cleanup",
    timeZone: "America/Bogota",
  })
  async cleanupOldExceptions(): Promise<void> {
    this.logger.log("🧹 Iniciando limpieza de excepciones antiguas...");

    try {
      // Calcular fecha límite (90 días atrás)
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 90);

      this.logger.log(
        `📅 Eliminando excepciones anteriores a: ${cutoffDate.toISOString()}`
      );

      // Eliminar excepciones antiguas
      const deletedCount =
        await this.repository.deleteOldExceptions(cutoffDate);

      this.logger.log(
        `✅ Limpieza completada: ${deletedCount} excepción(es) eliminada(s)`
      );
    } catch (error) {
      this.logger.error(
        `❌ Error en limpieza de excepciones: ${error.message}`,
        error.stack
      );
    }
  }

  /**
   * Limpieza de excepciones canceladas o expiradas (opcional)
   * Se ejecuta mensualmente el primer día del mes a las 03:00 AM
   */
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT, {
    name: "expired-exceptions-cleanup",
    timeZone: "America/Bogota",
  })
  async cleanupExpiredExceptions(): Promise<void> {
    this.logger.log("🧹 Iniciando limpieza de excepciones expiradas...");

    try {
      const now = new Date();

      // En este ejemplo, asumimos que las excepciones con isAvailable=false
      // que ya pasaron su fecha pueden limpiarse más agresivamente
      const oldExceptions = await this.repository.findByFilters({
        endDate: now,
        isAvailable: false,
      });

      // Filtrar las que tienen más de 30 días
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      let deletedCount = 0;
      for (const exception of oldExceptions) {
        // Verificar si la excepción es más antigua que 30 días
        if ((exception as any).createdAt < thirtyDaysAgo) {
          await this.repository.delete((exception as any)._id.toString());
          deletedCount++;
        }
      }

      this.logger.log(
        `✅ Limpieza de expiradas completada: ${deletedCount} excepción(es) eliminada(s)`
      );
    } catch (error) {
      this.logger.error(
        `❌ Error en limpieza de excepciones expiradas: ${error.message}`,
        error.stack
      );
    }
  }
}
