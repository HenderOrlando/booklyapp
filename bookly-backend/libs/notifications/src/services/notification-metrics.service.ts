import { AuditStatus, NotificationChannel } from "@libs/common/enums";
import { createLogger } from "@libs/common";
import { Injectable } from "@nestjs/common";

/**
 * Notification Metrics
 */
export interface NotificationMetrics {
  provider: string;
  channel: NotificationChannel;
  tenantId: string;
  totalSent: number;
  totalSuccess: number;
  totalFailed: number;
  successRate: number;
  averageLatency: number;
  minLatency: number;
  maxLatency: number;
  lastError?: string;
  lastErrorAt?: Date;
  lastSuccessAt?: Date;
  period: {
    from: Date;
    to: Date;
  };
}

/**
 * Metrics Event
 */
export interface MetricsEvent {
  provider: string;
  channel: NotificationChannel;
  tenantId: string;
  success: boolean;
  latency: number;
  timestamp: Date;
  error?: string;
}

/**
 * Notification Metrics Service
 * Servicio para recolectar y analizar métricas de notificaciones
 */
@Injectable()
export class NotificationMetricsService {
  private events: MetricsEvent[] = [];
  private readonly MAX_EVENTS = 10000;
  private readonly logger = createLogger("NotificationMetricsService");

  /**
   * Registrar evento de envío
   */
  recordSendEvent(
    provider: string,
    channel: NotificationChannel,
    tenantId: string,
    success: boolean,
    latency: number,
    error?: string
  ): void {
    const event: MetricsEvent = {
      provider,
      channel,
      tenantId,
      success,
      latency,
      timestamp: new Date(),
      error,
    };

    this.events.push(event);

    if (this.events.length > this.MAX_EVENTS) {
      this.events = this.events.slice(-this.MAX_EVENTS);
    }

    this.logger.debug(
      `Metrics recorded: ${provider} - ${channel} - ${success ? AuditStatus.SUCCESS : AuditStatus.FAILED}`
    );
  }

  /**
   * Obtener métricas por proveedor
   */
  getMetricsByProvider(
    provider: string,
    channel?: NotificationChannel,
    tenantId?: string,
    period?: { from: Date; to: Date }
  ): NotificationMetrics | null {
    const filtered = this.filterEvents(provider, channel, tenantId, period);

    if (filtered.length === 0) {
      return null;
    }

    const successful = filtered.filter((e) => e.success);
    const failed = filtered.filter((e) => !e.success);
    const latencies = filtered.map((e) => e.latency);

    const lastError = failed.length > 0 ? failed[failed.length - 1] : null;
    const lastSuccess =
      successful.length > 0 ? successful[successful.length - 1] : null;

    return {
      provider,
      channel: channel || filtered[0].channel,
      tenantId: tenantId || filtered[0].tenantId,
      totalSent: filtered.length,
      totalSuccess: successful.length,
      totalFailed: failed.length,
      successRate: (successful.length / filtered.length) * 100,
      averageLatency:
        latencies.reduce((sum, lat) => sum + lat, 0) / latencies.length,
      minLatency: Math.min(...latencies),
      maxLatency: Math.max(...latencies),
      lastError: lastError?.error,
      lastErrorAt: lastError?.timestamp,
      lastSuccessAt: lastSuccess?.timestamp,
      period: period || {
        from: filtered[0].timestamp,
        to: filtered[filtered.length - 1].timestamp,
      },
    };
  }

  /**
   * Obtener métricas globales
   */
  getGlobalMetrics(period?: { from: Date; to: Date }): {
    totalSent: number;
    totalSuccess: number;
    totalFailed: number;
    successRate: number;
    byChannel: Record<string, number>;
    byProvider: Record<string, number>;
  } {
    const filtered = this.filterEvents(undefined, undefined, undefined, period);
    const successful = filtered.filter((e) => e.success);
    const byChannel: Record<string, number> = {};
    const byProvider: Record<string, number> = {};

    filtered.forEach((event) => {
      byChannel[event.channel] = (byChannel[event.channel] || 0) + 1;
      byProvider[event.provider] = (byProvider[event.provider] || 0) + 1;
    });

    return {
      totalSent: filtered.length,
      totalSuccess: successful.length,
      totalFailed: filtered.length - successful.length,
      successRate:
        filtered.length > 0 ? (successful.length / filtered.length) * 100 : 0,
      byChannel,
      byProvider,
    };
  }

  /**
   * Filtrar eventos
   */
  private filterEvents(
    provider?: string,
    channel?: NotificationChannel,
    tenantId?: string,
    period?: { from: Date; to: Date }
  ): MetricsEvent[] {
    let filtered = [...this.events];

    if (provider) {
      filtered = filtered.filter((e) => e.provider === provider);
    }

    if (channel) {
      filtered = filtered.filter((e) => e.channel === channel);
    }

    if (tenantId) {
      filtered = filtered.filter((e) => e.tenantId === tenantId);
    }

    if (period) {
      filtered = filtered.filter(
        (e) => e.timestamp >= period.from && e.timestamp <= period.to
      );
    }

    return filtered;
  }

  /**
   * Obtener métricas por canal
   */
  getMetricsByChannel(
    channel: NotificationChannel,
    period?: { from: Date; to: Date }
  ): Map<string, number> {
    const filtered = this.filterEvents(undefined, channel, undefined, period);
    const byProvider = new Map<string, number>();

    filtered.forEach((event) => {
      const count = byProvider.get(event.provider) || 0;
      byProvider.set(event.provider, count + 1);
    });

    return byProvider;
  }

  /**
   * Obtener métricas por tenant
   */
  getMetricsByTenant(
    tenantId: string,
    period?: { from: Date; to: Date }
  ): Map<string, { sent: number; success: number; failed: number }> {
    const filtered = this.filterEvents(undefined, undefined, tenantId, period);
    const byProvider = new Map<
      string,
      { sent: number; success: number; failed: number }
    >();

    filtered.forEach((event) => {
      const stats = byProvider.get(event.provider) || {
        sent: 0,
        success: 0,
        failed: 0,
      };
      stats.sent++;
      if (event.success) {
        stats.success++;
      } else {
        stats.failed++;
      }
      byProvider.set(event.provider, stats);
    });

    return byProvider;
  }

  /**
   * Obtener eventos recientes
   */
  getRecentEvents(
    limit: number = 100,
    provider?: string,
    channel?: NotificationChannel,
    tenantId?: string
  ): MetricsEvent[] {
    const filtered = this.filterEvents(provider, channel, tenantId);
    return filtered.slice(-limit).reverse();
  }

  /**
   * Obtener estadísticas de latencia
   */
  getLatencyStats(
    provider?: string,
    channel?: NotificationChannel
  ): {
    p50: number;
    p75: number;
    p95: number;
    p99: number;
    avg: number;
    min: number;
    max: number;
  } {
    const filtered = this.filterEvents(provider, channel);

    if (filtered.length === 0) {
      return {
        p50: 0,
        p75: 0,
        p95: 0,
        p99: 0,
        avg: 0,
        min: 0,
        max: 0,
      };
    }

    const latencies = filtered.map((e) => e.latency).sort((a, b) => a - b);

    const percentile = (p: number) => {
      const index = Math.ceil((p / 100) * latencies.length) - 1;
      return latencies[Math.max(0, index)];
    };

    const sum = latencies.reduce((a, b) => a + b, 0);

    return {
      p50: percentile(50),
      p75: percentile(75),
      p95: percentile(95),
      p99: percentile(99),
      avg: sum / latencies.length,
      min: latencies[0],
      max: latencies[latencies.length - 1],
    };
  }

  /**
   * Limpiar todas las métricas
   */
  clearAllMetrics(): void {
    this.events = [];
    this.logger.info("All metrics cleared");
  }
}
