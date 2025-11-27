import { Injectable, Logger } from "@nestjs/common";
import {
  IAuditQueryOptions,
  IAuditQueryResult,
  IAuditRecord,
} from "@reports/audit-decorators";
import { AuditRepository } from "../repositories/audit.repository";

/**
 * Servicio de auditoría en reports-service
 * Gestiona la lógica de negocio para registros de auditoría
 */
@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly auditRepository: AuditRepository) {}

  /**
   * Guardar un registro de auditoría
   */
  async saveRecord(record: IAuditRecord): Promise<void> {
    try {
      await this.auditRepository.save(record);
      this.logger.log(
        `Audit record saved: ${record.entityType}.${record.action} by ${record.userId}`
      );
    } catch (error) {
      this.logger.error(
        "Error saving audit record",
        error.stack,
        "AuditService"
      );
      throw error;
    }
  }

  /**
   * Guardar múltiples registros
   */
  async saveBatch(records: IAuditRecord[]): Promise<void> {
    await Promise.all(records.map((record) => this.saveRecord(record)));
  }

  /**
   * Consultar historial por entidad
   */
  async getEntityHistory(
    entityId: string,
    entityType: string,
    options?: IAuditQueryOptions
  ): Promise<IAuditQueryResult> {
    return this.auditRepository.findByEntityId(entityId, entityType, options);
  }

  /**
   * Consultar historial por usuario
   */
  async getUserHistory(
    userId: string,
    options?: IAuditQueryOptions
  ): Promise<IAuditQueryResult> {
    return this.auditRepository.findByUserId(userId, options);
  }

  /**
   * Consultar con filtros personalizados
   */
  async query(options: IAuditQueryOptions): Promise<IAuditQueryResult> {
    return this.auditRepository.findWithFilters(options);
  }

  /**
   * Limpiar registros antiguos
   */
  async cleanOldRecords(daysToKeep: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const deletedCount = await this.auditRepository.deleteOlderThan(cutoffDate);
    this.logger.log(`Cleaned ${deletedCount} old audit records`);

    return deletedCount;
  }

  /**
   * Obtener estadísticas
   */
  async getStatistics(startDate: Date, endDate: Date) {
    return this.auditRepository.getStats(startDate, endDate);
  }
}
