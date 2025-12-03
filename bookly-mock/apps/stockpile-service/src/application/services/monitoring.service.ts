import { Injectable, Logger, Inject } from "@nestjs/common";
import { CheckInOutService } from "@stockpile/application/services/check-in-out.service";
import { CheckInOutEntity, CheckInOutStatus } from "@stockpile/domain/entities/check-in-out.entity";
import { IncidentEntity, IncidentSeverity, IncidentStatus } from "@stockpile/domain/entities/incident.entity";
import { IIncidentRepository } from "@stockpile/domain/repositories/incident.repository.interface";

/**
 * Estadísticas del dashboard de monitoreo
 */
export interface MonitoringStats {
  activeCheckIns: number;
  overdueCheckOuts: number;
  todayCheckIns: number;
  todayCheckOuts: number;
  pendingIncidents: number;
  resolvedIncidents: number;
  averageUsageDuration: number; // en minutos
  resourcesInUse: number;
}

/**
 * Filtros para consultas de monitoreo
 */
export interface MonitoringFilters {
  resourceId?: string;
  userId?: string;
  status?: CheckInOutStatus;
  startDate?: Date;
  endDate?: Date;
  includeIncidents?: boolean;
}

/**
 * Datos enriquecidos de check-in para el dashboard
 */
export interface EnrichedCheckInOut {
  // Propiedades de CheckInOutEntity
  id: string;
  reservationId: string;
  resourceId: string;
  userId: string;
  status: CheckInOutStatus;
  checkInTime?: Date;
  checkInBy?: string;
  checkInType?: any;
  checkInNotes?: string;
  checkOutTime?: Date;
  checkOutBy?: string;
  checkOutType?: any;
  checkOutNotes?: string;
  expectedReturnTime?: Date;
  actualReturnTime?: Date;
  expectedCheckOutTime?: Date;
  resourceCondition?: {
    beforeCheckIn?: string;
    afterCheckOut?: string;
    damageReported?: boolean;
    damageDescription?: string;
  };
  metadata?: Record<string, any>;
  reservationStartTime?: Date;
  reservationEndTime?: Date;
  resourceType?: string;
  resourceName?: string;
  userName?: string;
  userEmail?: string;
  createdAt?: Date;
  updatedAt?: Date;
  
  // Propiedades adicionales para el dashboard
  isOverdue?: boolean;
  durationMinutes?: number;
  hasIncidents?: boolean;
  incidentCount?: number;
}

/**
 * Servicio de Monitoreo para Dashboard de Vigilancia
 * Implementa RF-23: Pantalla de Control - Vigilancia
 * 
 * Proporciona datos en tiempo real para el personal de vigilancia
 * sobre check-ins activos, recursos en uso, incidencias y estadísticas
 */
@Injectable()
export class MonitoringService {
  private readonly logger = new Logger(MonitoringService.name);

  constructor(
    private readonly checkInOutService: CheckInOutService,
    @Inject('IIncidentRepository')
    private readonly incidentRepository: IIncidentRepository,
  ) {
    this.logger.log('MonitoringService initialized');
  }

  /**
   * Obtiene todos los check-ins activos (sin check-out)
   * Para mostrar en el dashboard de vigilancia
   */
  async getActiveCheckIns(filters?: MonitoringFilters): Promise<EnrichedCheckInOut[]> {
    this.logger.debug('Getting active check-ins', { filters });

    try {
      // Obtener check-ins activos del servicio
      const activeCheckIns = await this.checkInOutService.getActiveCheckIns({
        resourceId: filters?.resourceId,
        userId: filters?.userId,
      });

      // Enriquecer datos
      const enrichedCheckIns = await Promise.all(
        activeCheckIns.map(checkIn => this.enrichCheckInData(checkIn, filters?.includeIncidents))
      );

      // Filtrar por fecha si se especifica
      let filtered = enrichedCheckIns;
      if (filters?.startDate) {
        filtered = filtered.filter(c => c.checkInTime && c.checkInTime >= filters.startDate!);
      }
      if (filters?.endDate) {
        filtered = filtered.filter(c => c.checkInTime && c.checkInTime <= filters.endDate!);
      }

      this.logger.log(`Found ${filtered.length} active check-ins`);
      return filtered;
    } catch (error) {
      this.logger.error(`Error getting active check-ins: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Obtiene check-ins vencidos (sin check-out después de la hora esperada)
   */
  async getOverdueCheckIns(): Promise<EnrichedCheckInOut[]> {
    this.logger.debug('Getting overdue check-ins');

    try {
      const activeCheckIns = await this.getActiveCheckIns();
      const now = new Date();

      // Filtrar check-ins vencidos
      const overdueCheckIns = activeCheckIns.filter(checkIn => {
        if (!checkIn.expectedCheckOutTime) return false;
        return now > checkIn.expectedCheckOutTime;
      });

      this.logger.warn(`Found ${overdueCheckIns.length} overdue check-ins`);
      return overdueCheckIns;
    } catch (error) {
      this.logger.error(`Error getting overdue check-ins: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Obtiene el historial de check-ins de un recurso específico
   */
  async getResourceHistory(
    resourceId: string,
    limit: number = 50,
  ): Promise<EnrichedCheckInOut[]> {
    this.logger.debug('Getting resource history', { resourceId, limit });

    try {
      // Obtener historial del servicio de check-in/out
      const history = await this.checkInOutService.getCheckInHistory({
        resourceId,
        limit,
      });

      // Enriquecer datos
      const enrichedHistory = await Promise.all(
        history.map(checkIn => this.enrichCheckInData(checkIn, true))
      );

      this.logger.log(`Found ${enrichedHistory.length} history records for resource ${resourceId}`);
      return enrichedHistory;
    } catch (error) {
      this.logger.error(`Error getting resource history: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas generales del dashboard
   */
  async getStatistics(startDate?: Date, endDate?: Date): Promise<MonitoringStats> {
    this.logger.debug('Getting monitoring statistics', { startDate, endDate });

    try {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const todayEnd = new Date(todayStart);
      todayEnd.setDate(todayEnd.getDate() + 1);

      // Obtener datos en paralelo
      const [
        activeCheckIns,
        overdueCheckOuts,
        todayCheckIns,
        todayCheckOuts,
        pendingIncidents,
        resolvedIncidents,
      ] = await Promise.all([
        this.getActiveCheckIns(),
        this.getOverdueCheckIns(),
        this.checkInOutService.getCheckInHistory({
          startDate: todayStart,
          endDate: todayEnd,
        }),
        this.checkInOutService.getCheckInHistory({
          startDate: todayStart,
          endDate: todayEnd,
          status: CheckInOutStatus.CHECKED_OUT,
        }),
        this.incidentRepository.findMany({
          status: IncidentStatus.PENDING,
        }),
        this.incidentRepository.findMany({
          status: IncidentStatus.RESOLVED,
          startDate: todayStart,
          endDate: todayEnd,
        }),
      ]);

      // Calcular duración promedio de uso
      const completedCheckOuts = todayCheckOuts.filter(c => c.checkOutTime);
      const totalDuration = completedCheckOuts.reduce((sum, checkOut) => {
        if (checkOut.checkOutTime && checkOut.checkInTime) {
          const duration = checkOut.checkOutTime.getTime() - checkOut.checkInTime.getTime();
          return sum + duration;
        }
        return sum;
      }, 0);

      const averageUsageDuration = completedCheckOuts.length > 0
        ? Math.floor(totalDuration / completedCheckOuts.length / (1000 * 60))
        : 0;

      // Contar recursos únicos en uso
      const resourcesInUse = new Set(activeCheckIns.map(c => c.resourceId)).size;

      const stats: MonitoringStats = {
        activeCheckIns: activeCheckIns.length,
        overdueCheckOuts: overdueCheckOuts.length,
        todayCheckIns: todayCheckIns.length,
        todayCheckOuts: todayCheckOuts.length,
        pendingIncidents: pendingIncidents.length,
        resolvedIncidents: resolvedIncidents.length,
        averageUsageDuration,
        resourcesInUse,
      };

      this.logger.log('Statistics calculated', stats);
      return stats;
    } catch (error) {
      this.logger.error(`Error getting statistics: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Reporta una incidencia
   */
  async reportIncident(params: {
    checkInOutId?: string;
    resourceId: string;
    reportedBy: string;
    severity: IncidentSeverity;
    description: string;
    location?: string;
    metadata?: Record<string, any>;
  }): Promise<IncidentEntity> {
    this.logger.log('Reporting incident', {
      resourceId: params.resourceId,
      severity: params.severity,
    });

    try {
      const incident = new IncidentEntity(
        '', // ID será generado por el repository
        params.checkInOutId,
        params.resourceId,
        params.reportedBy,
        params.severity,
        IncidentStatus.PENDING,
        params.description,
        new Date(),
        undefined, // resolvedAt
        undefined, // resolvedBy
        undefined, // resolution
        params.location,
        params.metadata,
      );

      const created = await this.incidentRepository.create(incident);

      this.logger.log(`Incident reported: ${created.id}`);

      // TODO: Enviar notificación de incidencia
      // await this.notificationService.sendIncidentAlert(created);

      return created;
    } catch (error) {
      this.logger.error(`Error reporting incident: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Obtiene incidencias pendientes
   */
  async getPendingIncidents(resourceId?: string): Promise<IncidentEntity[]> {
    this.logger.debug('Getting pending incidents', { resourceId });

    try {
      const incidents = await this.incidentRepository.findMany({
        status: IncidentStatus.PENDING,
        resourceId,
      });

      this.logger.log(`Found ${incidents.length} pending incidents`);
      return incidents;
    } catch (error) {
      this.logger.error(`Error getting pending incidents: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Resuelve una incidencia
   */
  async resolveIncident(params: {
    incidentId: string;
    resolvedBy: string;
    resolution: string;
  }): Promise<IncidentEntity> {
    this.logger.log('Resolving incident', { incidentId: params.incidentId });

    try {
      const incident = await this.incidentRepository.findById(params.incidentId);

      if (!incident) {
        throw new Error(`Incident ${params.incidentId} not found`);
      }

      const resolved = incident.resolve(params.resolvedBy, params.resolution);
      const updated = await this.incidentRepository.update(params.incidentId, resolved);

      this.logger.log(`Incident resolved: ${updated.id}`);
      return updated;
    } catch (error) {
      this.logger.error(`Error resolving incident: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Obtiene alertas activas para el dashboard
   */
  async getActiveAlerts(): Promise<Array<{
    type: 'OVERDUE' | 'INCIDENT' | 'WARNING';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    message: string;
    resourceId?: string;
    checkInOutId?: string;
    incidentId?: string;
    timestamp: Date;
  }>> {
    this.logger.debug('Getting active alerts');

    try {
      const alerts: Array<any> = [];

      // Alertas de check-outs vencidos
      const overdueCheckIns = await this.getOverdueCheckIns();
      for (const checkIn of overdueCheckIns) {
        const minutesOverdue = Math.floor(
          (new Date().getTime() - checkIn.expectedCheckOutTime!.getTime()) / (1000 * 60)
        );

        alerts.push({
          type: 'OVERDUE',
          severity: minutesOverdue > 60 ? 'HIGH' : 'MEDIUM',
          message: `Check-out vencido por ${minutesOverdue} minutos`,
          resourceId: checkIn.resourceId,
          checkInOutId: checkIn.id,
          timestamp: checkIn.expectedCheckOutTime!,
        });
      }

      // Alertas de incidencias críticas
      const criticalIncidents = await this.incidentRepository.findMany({
        status: IncidentStatus.PENDING,
        severity: IncidentSeverity.CRITICAL,
      });

      for (const incident of criticalIncidents) {
        alerts.push({
          type: 'INCIDENT',
          severity: 'CRITICAL',
          message: incident.description,
          resourceId: incident.resourceId,
          incidentId: incident.id,
          timestamp: incident.reportedAt,
        });
      }

      // Ordenar por severidad y timestamp
      alerts.sort((a, b) => {
        const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
        if (severityOrder[a.severity] !== severityOrder[b.severity]) {
          return severityOrder[a.severity] - severityOrder[b.severity];
        }
        return b.timestamp.getTime() - a.timestamp.getTime();
      });

      this.logger.log(`Found ${alerts.length} active alerts`);
      return alerts;
    } catch (error) {
      this.logger.error(`Error getting active alerts: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Enriquece los datos de un check-in con información adicional
   */
  private async enrichCheckInData(
    checkIn: CheckInOutEntity,
    includeIncidents: boolean = false,
  ): Promise<EnrichedCheckInOut> {
    // Convertir la entidad a objeto plano
    const enriched: EnrichedCheckInOut = {
      id: checkIn.id,
      reservationId: checkIn.reservationId,
      resourceId: checkIn.resourceId,
      userId: checkIn.userId,
      status: checkIn.status,
      checkInTime: checkIn.checkInTime,
      checkInBy: checkIn.checkInBy,
      checkInType: checkIn.checkInType,
      checkInNotes: checkIn.checkInNotes,
      checkOutTime: checkIn.checkOutTime,
      checkOutBy: checkIn.checkOutBy,
      checkOutType: checkIn.checkOutType,
      checkOutNotes: checkIn.checkOutNotes,
      expectedReturnTime: checkIn.expectedReturnTime,
      actualReturnTime: checkIn.actualReturnTime,
      expectedCheckOutTime: checkIn.expectedCheckOutTime,
      resourceCondition: checkIn.resourceCondition,
      metadata: checkIn.metadata,
      reservationStartTime: checkIn.reservationStartTime,
      reservationEndTime: checkIn.reservationEndTime,
      resourceType: checkIn.resourceType,
      resourceName: checkIn.resourceName,
      userName: checkIn.userName,
      userEmail: checkIn.userEmail,
      createdAt: checkIn.createdAt,
      updatedAt: checkIn.updatedAt,
    };

    // Calcular si está vencido
    if (checkIn.expectedCheckOutTime && !checkIn.checkOutTime) {
      enriched.isOverdue = new Date() > checkIn.expectedCheckOutTime;
    }

    // Calcular duración
    if (checkIn.checkOutTime && checkIn.checkInTime) {
      const duration = checkIn.checkOutTime.getTime() - checkIn.checkInTime.getTime();
      enriched.durationMinutes = Math.floor(duration / (1000 * 60));
    } else if (checkIn.checkInTime) {
      const duration = new Date().getTime() - checkIn.checkInTime.getTime();
      enriched.durationMinutes = Math.floor(duration / (1000 * 60));
    }

    // Obtener incidencias si se solicita
    if (includeIncidents && checkIn.id) {
      try {
        const incidents = await this.incidentRepository.findMany({
          checkInOutId: checkIn.id,
        });
        enriched.hasIncidents = incidents.length > 0;
        enriched.incidentCount = incidents.length;
      } catch (error) {
        this.logger.warn(`Error getting incidents for check-in ${checkIn.id}`);
        enriched.hasIncidents = false;
        enriched.incidentCount = 0;
      }
    }

    // TODO: Enriquecer con nombres de usuario y recurso
    // enriched.userName = await this.authService.getUserName(checkIn.userId);
    // enriched.resourceName = await this.resourceService.getResourceName(checkIn.resourceId);

    return enriched;
  }
}
