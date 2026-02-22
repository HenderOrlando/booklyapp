import { createLogger } from "@libs/common";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {
  AuditLog,
  AuditLogDocument,
} from "@auth/infrastructure/schemas/audit-log.schema";

const logger = createLogger("AuditExportService");

/**
 * Filtros para exportación de auditoría
 */
export interface AuditExportFilters {
  userId?: string;
  action?: string;
  resource?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}

/**
 * Resultado de exportación CSV
 */
export interface CsvExportResult {
  content: string;
  fileName: string;
  mimeType: string;
  rowCount: number;
  generatedAt: Date;
}

/**
 * Audit Export Service (RF-44)
 * Servicio para exportación de logs de auditoría en formato CSV
 */
@Injectable()
export class AuditExportService {
  constructor(
    @InjectModel(AuditLog.name)
    private readonly auditLogModel: Model<AuditLogDocument>,
  ) {}

  /**
   * Exportar logs de auditoría a CSV
   */
  async exportToCsv(filters: AuditExportFilters): Promise<CsvExportResult> {
    logger.info("Exporting audit logs to CSV", { filters });

    const query: any = {};

    if (filters.userId) {
      query.userId = filters.userId;
    }
    if (filters.action) {
      query.action = filters.action;
    }
    if (filters.resource) {
      query.resource = filters.resource;
    }
    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.startDate || filters.endDate) {
      query.timestamp = {};
      if (filters.startDate) {
        query.timestamp.$gte = filters.startDate;
      }
      if (filters.endDate) {
        query.timestamp.$lte = filters.endDate;
      }
    }

    const logs = await this.auditLogModel
      .find(query)
      .sort({ timestamp: -1 })
      .limit(filters.limit || 10000)
      .lean()
      .exec();

    const csvContent = this.generateCsv(logs);

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `audit-export-${timestamp}.csv`;

    logger.info("Audit CSV export completed", {
      rowCount: logs.length,
      fileName,
    });

    return {
      content: csvContent,
      fileName,
      mimeType: "text/csv",
      rowCount: logs.length,
      generatedAt: new Date(),
    };
  }

  /**
   * Generar contenido CSV con BOM para compatibilidad Excel
   */
  private generateCsv(logs: any[]): string {
    const BOM = "\uFEFF";

    const headers = [
      "ID",
      "Timestamp",
      "User ID",
      "Action",
      "Resource",
      "Resource ID",
      "Status",
      "IP Address",
      "User Agent",
      "Error",
      "Details",
    ];

    const rows = logs.map((log) => [
      this.escapeCsv(log._id?.toString() || ""),
      this.escapeCsv(
        log.timestamp ? new Date(log.timestamp).toISOString() : "",
      ),
      this.escapeCsv(log.userId || ""),
      this.escapeCsv(log.action || ""),
      this.escapeCsv(log.resource || ""),
      this.escapeCsv(log.resourceId || ""),
      this.escapeCsv(log.status || ""),
      this.escapeCsv(log.ip || ""),
      this.escapeCsv(log.userAgent || ""),
      this.escapeCsv(log.error || ""),
      this.escapeCsv(
        log.details ? JSON.stringify(log.details) : "",
      ),
    ]);

    const headerLine = headers.join(",");
    const dataLines = rows.map((row) => row.join(","));

    return BOM + [headerLine, ...dataLines].join("\n");
  }

  /**
   * Escapar valor para CSV (RFC 4180)
   */
  private escapeCsv(value: string): string {
    if (!value) return '""';

    const stringValue = String(value);

    if (
      stringValue.includes(",") ||
      stringValue.includes('"') ||
      stringValue.includes("\n") ||
      stringValue.includes("\r")
    ) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }

    return stringValue;
  }

  /**
   * Obtener resumen de auditoría para el período
   */
  async getAuditSummary(
    startDate: Date,
    endDate: Date,
  ): Promise<{
    totalLogs: number;
    byAction: Record<string, number>;
    byStatus: Record<string, number>;
    byResource: Record<string, number>;
    uniqueUsers: number;
  }> {
    const query = {
      timestamp: { $gte: startDate, $lte: endDate },
    };

    const logs = await this.auditLogModel.find(query).lean().exec();

    const byAction: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    const byResource: Record<string, number> = {};
    const uniqueUserIds = new Set<string>();

    for (const log of logs) {
      byAction[log.action] = (byAction[log.action] || 0) + 1;
      byStatus[log.status] = (byStatus[log.status] || 0) + 1;
      byResource[log.resource] = (byResource[log.resource] || 0) + 1;
      if (log.userId) uniqueUserIds.add(log.userId);
    }

    return {
      totalLogs: logs.length,
      byAction,
      byStatus,
      byResource,
      uniqueUsers: uniqueUserIds.size,
    };
  }
}
