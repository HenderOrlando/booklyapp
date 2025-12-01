import { createLogger, LogLevel } from "@libs/common";
import { Injectable } from "@nestjs/common";
import { BooklyWebSocketGateway } from "@gateway/infrastructure/websocket/websocket.gateway";
import { LogFilterDto, WebSocketEvent } from "../dto/websocket.dto";

const logger = createLogger("LogStreamingService");

export interface LogEntry {
  timestamp: Date;
  level: "error" | "warn" | "info" | "debug";
  service: string;
  context: string;
  message: string;
  metadata?: Record<string, any>;
  stack?: string;
}

/**
 * Log Streaming Service
 * Servicio para streaming de logs en tiempo real via WebSocket
 *
 * Características:
 * - Stream de logs en tiempo real
 * - Filtrado por nivel, servicio, contexto
 * - Buffer circular de logs recientes
 * - Integración con Winston transport
 */
@Injectable()
export class LogStreamingService {
  private logBuffer: LogEntry[] = [];
  private maxBufferSize = 1000;
  private wsGateway: BooklyWebSocketGateway;

  /**
   * Configurar gateway WebSocket
   */
  setWebSocketGateway(gateway: BooklyWebSocketGateway) {
    this.wsGateway = gateway;
  }

  /**
   * Agregar entrada de log al buffer y streaming
   */
  addLogEntry(entry: LogEntry) {
    // Agregar al buffer circular
    this.logBuffer.push(entry);

    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer.shift();
    }

    // Stream via WebSocket
    if (this.wsGateway) {
      const event =
        entry.level === "error"
          ? WebSocketEvent.LOG_ERROR
          : entry.level === "warn"
            ? WebSocketEvent.LOG_WARNING
            : WebSocketEvent.LOG_ENTRY;

      this.wsGateway.emitToChannel("logs", event, entry);
    }
  }

  /**
   * Obtener logs recientes con filtros
   */
  getRecentLogs(filters?: LogFilterDto, limit: number = 100): LogEntry[] {
    let filtered = [...this.logBuffer];

    if (filters) {
      if (filters.level) {
        filtered = filtered.filter((log) => log.level === filters.level);
      }

      if (filters.service) {
        filtered = filtered.filter((log) => log.service === filters.service);
      }

      if (filters.context) {
        filtered = filtered.filter((log) =>
          log.context.includes(filters.context!)
        );
      }
    }

    // Retornar los más recientes primero
    return filtered.reverse().slice(0, limit);
  }

  /**
   * Limpiar buffer de logs
   */
  clearBuffer() {
    const count = this.logBuffer.length;
    this.logBuffer = [];

    logger.info(`Log buffer cleared`, { count });
  }

  /**
   * Obtener estadísticas de logs
   */
  getLogStats() {
    const stats = {
      total: this.logBuffer.length,
      byLevel: {
        error: 0,
        warn: 0,
        info: 0,
        debug: 0,
      },
      byService: {} as Record<string, number>,
      recentErrors: [] as LogEntry[],
    };

    this.logBuffer.forEach((log) => {
      stats.byLevel[log.level]++;

      if (!stats.byService[log.service]) {
        stats.byService[log.service] = 0;
      }
      stats.byService[log.service]++;
    });

    // Obtener 10 errores más recientes
    stats.recentErrors = this.logBuffer
      .filter((log) => log.level === "error")
      .reverse()
      .slice(0, 10);

    return stats;
  }

  /**
   * Log de error crítico con notificación
   */
  async logCriticalError(
    service: string,
    context: string,
    message: string,
    error: Error,
    metadata?: Record<string, any>
  ) {
    const entry: LogEntry = {
      timestamp: new Date(),
      level: "error",
      service,
      context,
      message,
      metadata: {
        ...metadata,
        errorName: error.name,
        errorMessage: error.message,
      },
      stack: error.stack,
    };

    this.addLogEntry(entry);

    // Log también en Winston
    logger.error(`[${service}] ${context}: ${message}`, error);

    // TODO: Crear notificación para administradores
    // await this.notificationService.notifyError(adminUserId, ...);
  }

  /**
   * Log de evento importante
   */
  async logImportantEvent(
    service: string,
    context: string,
    message: string,
    metadata?: Record<string, any>
  ) {
    const entry: LogEntry = {
      timestamp: new Date(),
      level: LogLevel.INFO,
      service,
      context,
      message,
      metadata,
    };

    this.addLogEntry(entry);

    logger.info(`[${service}] ${context}: ${message}`, metadata);
  }

  /**
   * Log de warning
   */
  async logWarning(
    service: string,
    context: string,
    message: string,
    metadata?: Record<string, any>
  ) {
    const entry: LogEntry = {
      timestamp: new Date(),
      level: LogLevel.WARN,
      service,
      context,
      message,
      metadata,
    };

    this.addLogEntry(entry);

    logger.warn(`[${service}] ${context}: ${message}`, metadata);
  }
}
