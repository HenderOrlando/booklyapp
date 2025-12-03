/**
 * Severidad de la incidencia
 */
export enum IncidentSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

/**
 * Estado de la incidencia
 */
export enum IncidentStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CANCELLED = 'CANCELLED',
}

/**
 * Entidad de Incidencia
 * Representa un reporte de problema o anomalía en un recurso
 * 
 * @implements RF-23: Pantalla de Control - Vigilancia
 */
export class IncidentEntity {
  constructor(
    public readonly id: string,
    public readonly checkInOutId: string | undefined,
    public readonly resourceId: string,
    public readonly reportedBy: string,
    public readonly severity: IncidentSeverity,
    public readonly status: IncidentStatus,
    public readonly description: string,
    public readonly reportedAt: Date,
    public readonly resolvedAt: Date | undefined,
    public readonly resolvedBy: string | undefined,
    public readonly resolution: string | undefined,
    public readonly location: string | undefined,
    public readonly metadata: Record<string, any> | undefined,
  ) {}

  /**
   * Crea una nueva incidencia
   */
  static create(params: {
    checkInOutId?: string;
    resourceId: string;
    reportedBy: string;
    severity: IncidentSeverity;
    description: string;
    location?: string;
    metadata?: Record<string, any>;
  }): IncidentEntity {
    return new IncidentEntity(
      '', // ID será generado por el repository
      params.checkInOutId,
      params.resourceId,
      params.reportedBy,
      params.severity,
      IncidentStatus.PENDING,
      params.description,
      new Date(),
      undefined,
      undefined,
      undefined,
      params.location,
      params.metadata,
    );
  }

  /**
   * Marca la incidencia como en progreso
   */
  markInProgress(): IncidentEntity {
    if (this.status !== IncidentStatus.PENDING) {
      throw new Error('Only pending incidents can be marked as in progress');
    }

    return new IncidentEntity(
      this.id,
      this.checkInOutId,
      this.resourceId,
      this.reportedBy,
      this.severity,
      IncidentStatus.IN_PROGRESS,
      this.description,
      this.reportedAt,
      this.resolvedAt,
      this.resolvedBy,
      this.resolution,
      this.location,
      this.metadata,
    );
  }

  /**
   * Resuelve la incidencia
   */
  resolve(resolvedBy: string, resolution: string): IncidentEntity {
    if (this.status === IncidentStatus.RESOLVED) {
      throw new Error('Incident is already resolved');
    }

    if (this.status === IncidentStatus.CANCELLED) {
      throw new Error('Cannot resolve a cancelled incident');
    }

    return new IncidentEntity(
      this.id,
      this.checkInOutId,
      this.resourceId,
      this.reportedBy,
      this.severity,
      IncidentStatus.RESOLVED,
      this.description,
      this.reportedAt,
      new Date(),
      resolvedBy,
      resolution,
      this.location,
      this.metadata,
    );
  }

  /**
   * Cancela la incidencia
   */
  cancel(): IncidentEntity {
    if (this.status === IncidentStatus.RESOLVED) {
      throw new Error('Cannot cancel a resolved incident');
    }

    return new IncidentEntity(
      this.id,
      this.checkInOutId,
      this.resourceId,
      this.reportedBy,
      this.severity,
      IncidentStatus.CANCELLED,
      this.description,
      this.reportedAt,
      this.resolvedAt,
      this.resolvedBy,
      this.resolution,
      this.location,
      this.metadata,
    );
  }

  /**
   * Verifica si la incidencia está pendiente
   */
  isPending(): boolean {
    return this.status === IncidentStatus.PENDING;
  }

  /**
   * Verifica si la incidencia está resuelta
   */
  isResolved(): boolean {
    return this.status === IncidentStatus.RESOLVED;
  }

  /**
   * Verifica si la incidencia es crítica
   */
  isCritical(): boolean {
    return this.severity === IncidentSeverity.CRITICAL;
  }

  /**
   * Obtiene el tiempo transcurrido desde el reporte (en minutos)
   */
  getElapsedTime(): number {
    const now = this.resolvedAt || new Date();
    const elapsed = now.getTime() - this.reportedAt.getTime();
    return Math.floor(elapsed / (1000 * 60));
  }

  /**
   * Convierte la entidad a objeto plano
   */
  toObject(): Record<string, any> {
    return {
      id: this.id,
      checkInOutId: this.checkInOutId,
      resourceId: this.resourceId,
      reportedBy: this.reportedBy,
      severity: this.severity,
      status: this.status,
      description: this.description,
      reportedAt: this.reportedAt,
      resolvedAt: this.resolvedAt,
      resolvedBy: this.resolvedBy,
      resolution: this.resolution,
      location: this.location,
      metadata: this.metadata,
    };
  }

  /**
   * Crea una entidad desde un objeto plano
   */
  static fromObject(obj: any): IncidentEntity {
    return new IncidentEntity(
      obj.id || obj._id?.toString(),
      obj.checkInOutId,
      obj.resourceId,
      obj.reportedBy,
      obj.severity,
      obj.status,
      obj.description,
      new Date(obj.reportedAt),
      obj.resolvedAt ? new Date(obj.resolvedAt) : undefined,
      obj.resolvedBy,
      obj.resolution,
      obj.location,
      obj.metadata,
    );
  }
}
