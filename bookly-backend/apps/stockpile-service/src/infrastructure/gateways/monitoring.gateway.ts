import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  ConnectedSocket,
  MessageBody,
} from "@nestjs/websockets";
import { Logger, UseGuards } from "@nestjs/common";
import { Server, Socket } from "socket.io";
import { MonitoringService } from "@stockpile/application/services/monitoring.service";
import { WsJwtGuard } from "@libs/guards";

/**
 * Tipos de eventos de monitoreo
 */
export enum MonitoringEventType {
  CHECK_IN = 'monitoring:checkin',
  CHECK_OUT = 'monitoring:checkout',
  INCIDENT_REPORTED = 'monitoring:incident:reported',
  INCIDENT_RESOLVED = 'monitoring:incident:resolved',
  ALERT = 'monitoring:alert',
  STATS_UPDATE = 'monitoring:stats:update',
  OVERDUE_UPDATE = 'monitoring:overdue:update',
}

/**
 * Payload de evento de monitoreo
 */
export interface MonitoringEventPayload {
  type: MonitoringEventType;
  timestamp: Date;
  data: any;
}

/**
 * Gateway de WebSocket para Monitoreo en Tiempo Real
 * Implementa RF-23: Pantalla de Control - Vigilancia
 * 
 * Proporciona actualizaciones en tiempo real para el dashboard de vigilancia:
 * - Check-ins y check-outs
 * - Incidencias reportadas y resueltas
 * - Alertas de check-outs vencidos
 * - Estadísticas actualizadas
 */
@WebSocketGateway({
  namespace: '/monitoring',
  cors: {
    origin: '*', // TODO: Configurar orígenes permitidos en producción
    credentials: true,
  },
})
export class MonitoringGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MonitoringGateway.name);
  private connectedClients: Map<string, Socket> = new Map();
  private statsUpdateInterval: NodeJS.Timeout;

  constructor(private readonly monitoringService: MonitoringService) {}

  /**
   * Inicialización del gateway
   */
  afterInit(server: Server) {
    this.logger.log('MonitoringGateway initialized');

    // Programar actualización periódica de estadísticas cada 30 segundos
    this.statsUpdateInterval = setInterval(async () => {
      await this.broadcastStatsUpdate();
    }, 30000);
  }

  /**
   * Maneja la conexión de un cliente
   */
  async handleConnection(@ConnectedSocket() client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    this.connectedClients.set(client.id, client);

    // Enviar datos iniciales al cliente
    try {
      const [activeCheckIns, stats, alerts] = await Promise.all([
        this.monitoringService.getActiveCheckIns(),
        this.monitoringService.getStatistics(),
        this.monitoringService.getActiveAlerts(),
      ]);

      client.emit('monitoring:initial', {
        activeCheckIns,
        stats,
        alerts,
        timestamp: new Date(),
      });

      this.logger.log(`Initial data sent to client: ${client.id}`);
    } catch (error) {
      this.logger.error(`Error sending initial data: ${error.message}`, error.stack);
    }
  }

  /**
   * Maneja la desconexión de un cliente
   */
  handleDisconnect(@ConnectedSocket() client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.connectedClients.delete(client.id);
  }

  /**
   * Suscripción a actualizaciones de un recurso específico
   */
  @SubscribeMessage('monitoring:subscribe:resource')
  @UseGuards(WsJwtGuard)
  async handleSubscribeResource(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { resourceId: string },
  ) {
    this.logger.debug(`Client ${client.id} subscribed to resource ${data.resourceId}`);

    // Unirse a una sala específica del recurso
    client.join(`resource:${data.resourceId}`);

    // Enviar datos actuales del recurso
    try {
      const history = await this.monitoringService.getResourceHistory(data.resourceId, 10);
      client.emit('monitoring:resource:data', {
        resourceId: data.resourceId,
        history,
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error(`Error sending resource data: ${error.message}`, error.stack);
    }
  }

  /**
   * Desuscripción de actualizaciones de un recurso
   */
  @SubscribeMessage('monitoring:unsubscribe:resource')
  handleUnsubscribeResource(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { resourceId: string },
  ) {
    this.logger.debug(`Client ${client.id} unsubscribed from resource ${data.resourceId}`);
    client.leave(`resource:${data.resourceId}`);
  }

  /**
   * Solicitar actualización manual de estadísticas
   */
  @SubscribeMessage('monitoring:request:stats')
  @UseGuards(WsJwtGuard)
  async handleRequestStats(@ConnectedSocket() client: Socket) {
    this.logger.debug(`Client ${client.id} requested stats update`);

    try {
      const stats = await this.monitoringService.getStatistics();
      client.emit('monitoring:stats:update', {
        stats,
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error(`Error sending stats: ${error.message}`, error.stack);
    }
  }

  /**
   * Solicitar actualización manual de alertas
   */
  @SubscribeMessage('monitoring:request:alerts')
  @UseGuards(WsJwtGuard)
  async handleRequestAlerts(@ConnectedSocket() client: Socket) {
    this.logger.debug(`Client ${client.id} requested alerts update`);

    try {
      const alerts = await this.monitoringService.getActiveAlerts();
      client.emit('monitoring:alerts:update', {
        alerts,
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error(`Error sending alerts: ${error.message}`, error.stack);
    }
  }

  /**
   * Emite un evento de check-in a todos los clientes conectados
   */
  emitCheckIn(data: any) {
    this.logger.debug('Broadcasting check-in event', { checkInId: data.id });

    const payload: MonitoringEventPayload = {
      type: MonitoringEventType.CHECK_IN,
      timestamp: new Date(),
      data,
    };

    this.server.emit(MonitoringEventType.CHECK_IN, payload);

    // Emitir también a la sala del recurso específico
    if (data.resourceId) {
      this.server.to(`resource:${data.resourceId}`).emit('monitoring:resource:checkin', payload);
    }
  }

  /**
   * Emite un evento de check-out a todos los clientes conectados
   */
  emitCheckOut(data: any) {
    this.logger.debug('Broadcasting check-out event', { checkInId: data.id });

    const payload: MonitoringEventPayload = {
      type: MonitoringEventType.CHECK_OUT,
      timestamp: new Date(),
      data,
    };

    this.server.emit(MonitoringEventType.CHECK_OUT, payload);

    // Emitir también a la sala del recurso específico
    if (data.resourceId) {
      this.server.to(`resource:${data.resourceId}`).emit('monitoring:resource:checkout', payload);
    }
  }

  /**
   * Emite un evento de incidencia reportada
   */
  emitIncidentReported(data: any) {
    this.logger.debug('Broadcasting incident reported event', { incidentId: data.id });

    const payload: MonitoringEventPayload = {
      type: MonitoringEventType.INCIDENT_REPORTED,
      timestamp: new Date(),
      data,
    };

    this.server.emit(MonitoringEventType.INCIDENT_REPORTED, payload);

    // Emitir también a la sala del recurso específico
    if (data.resourceId) {
      this.server.to(`resource:${data.resourceId}`).emit('monitoring:resource:incident', payload);
    }
  }

  /**
   * Emite un evento de incidencia resuelta
   */
  emitIncidentResolved(data: any) {
    this.logger.debug('Broadcasting incident resolved event', { incidentId: data.id });

    const payload: MonitoringEventPayload = {
      type: MonitoringEventType.INCIDENT_RESOLVED,
      timestamp: new Date(),
      data,
    };

    this.server.emit(MonitoringEventType.INCIDENT_RESOLVED, payload);

    // Emitir también a la sala del recurso específico
    if (data.resourceId) {
      this.server
        .to(`resource:${data.resourceId}`)
        .emit('monitoring:resource:incident:resolved', payload);
    }
  }

  /**
   * Emite una alerta a todos los clientes conectados
   */
  emitAlert(data: any) {
    this.logger.debug('Broadcasting alert', { type: data.type });

    const payload: MonitoringEventPayload = {
      type: MonitoringEventType.ALERT,
      timestamp: new Date(),
      data,
    };

    this.server.emit(MonitoringEventType.ALERT, payload);
  }

  /**
   * Difunde actualización de estadísticas a todos los clientes
   */
  private async broadcastStatsUpdate() {
    try {
      const stats = await this.monitoringService.getStatistics();

      const payload: MonitoringEventPayload = {
        type: MonitoringEventType.STATS_UPDATE,
        timestamp: new Date(),
        data: stats,
      };

      this.server.emit(MonitoringEventType.STATS_UPDATE, payload);
      this.logger.debug('Stats update broadcasted');
    } catch (error) {
      this.logger.error(`Error broadcasting stats update: ${error.message}`, error.stack);
    }
  }

  /**
   * Difunde actualización de check-outs vencidos
   */
  async broadcastOverdueUpdate() {
    try {
      const overdueCheckIns = await this.monitoringService.getOverdueCheckIns();

      const payload: MonitoringEventPayload = {
        type: MonitoringEventType.OVERDUE_UPDATE,
        timestamp: new Date(),
        data: overdueCheckIns,
      };

      this.server.emit(MonitoringEventType.OVERDUE_UPDATE, payload);
      this.logger.debug('Overdue update broadcasted');
    } catch (error) {
      this.logger.error(`Error broadcasting overdue update: ${error.message}`, error.stack);
    }
  }

  /**
   * Limpieza al destruir el gateway
   */
  onModuleDestroy() {
    if (this.statsUpdateInterval) {
      clearInterval(this.statsUpdateInterval);
    }
    this.logger.log('MonitoringGateway destroyed');
  }
}
