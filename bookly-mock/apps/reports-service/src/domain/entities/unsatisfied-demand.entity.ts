import {
  UnsatisfiedDemandPriority,
  UnsatisfiedDemandReason,
  UnsatisfiedDemandStatus,
} from "@libs/common/enums";

/**
 * Unsatisfied Demand Entity
 * Entidad que representa demanda insatisfecha de recursos (RF-37)
 */
export class UnsatisfiedDemandEntity {
  constructor(
    public readonly id: string,
    public readonly resourceId: string,
    public readonly resourceName: string,
    public readonly resourceType: string,
    public readonly requestedBy: string,
    public readonly requesterName: string,
    public readonly requesterEmail: string,
    public readonly requestedDate: Date,
    public readonly requestedStartTime: Date,
    public readonly requestedEndTime: Date,
    public readonly duration: number, // minutos
    public readonly reason: UnsatisfiedDemandReason,
    public readonly priority: UnsatisfiedDemandPriority,
    public readonly status: UnsatisfiedDemandStatus,
    public readonly reasonDetails?: string,
    public readonly program?: string,
    public readonly alternatives?: Array<{
      resourceId: string;
      resourceName: string;
      availableDate: Date;
    }>,
    public readonly resolvedAt?: Date,
    public readonly resolvedBy?: string,
    public readonly resolutionNotes?: string,
    public readonly metadata?: Record<string, any>,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {}

  /**
   * Verifica si la demanda es urgente
   */
  isUrgent(): boolean {
    return (
      this.priority === UnsatisfiedDemandPriority.URGENT ||
      this.priority === UnsatisfiedDemandPriority.HIGH
    );
  }

  /**
   * Verifica si la demanda está pendiente
   */
  isPending(): boolean {
    return this.status === UnsatisfiedDemandStatus.PENDING;
  }

  /**
   * Verifica si la demanda fue resuelta
   */
  isResolved(): boolean {
    return this.status === UnsatisfiedDemandStatus.RESOLVED;
  }

  /**
   * Verifica si la demanda fue cancelada
   */
  isCancelled(): boolean {
    return this.status === UnsatisfiedDemandStatus.CANCELLED;
  }

  /**
   * Verifica si tiene alternativas disponibles
   */
  hasAlternatives(): boolean {
    return !!this.alternatives && this.alternatives.length > 0;
  }

  /**
   * Calcula la duración en horas
   */
  getDurationInHours(): number {
    return this.duration / 60;
  }

  /**
   * Calcula cuántos días han pasado desde la solicitud
   */
  getDaysSinceRequest(): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.requestedDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Verifica si la solicitud es antigua (más de 7 días)
   */
  isOldRequest(): boolean {
    return this.getDaysSinceRequest() > 7;
  }

  /**
   * Obtiene el tiempo de resolución en días
   */
  getResolutionTimeInDays(): number | null {
    if (!this.resolvedAt) return null;
    const diffTime = Math.abs(
      this.resolvedAt.getTime() - this.requestedDate.getTime()
    );
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Verifica si el conflicto es por capacidad
   */
  isCapacityIssue(): boolean {
    return this.reason === UnsatisfiedDemandReason.CAPACITY;
  }

  /**
   * Verifica si el conflicto es por no disponibilidad
   */
  isUnavailabilityIssue(): boolean {
    return this.reason === UnsatisfiedDemandReason.UNAVAILABLE;
  }

  /**
   * Verifica si el conflicto es por mantenimiento
   */
  isMaintenanceIssue(): boolean {
    return this.reason === UnsatisfiedDemandReason.MAINTENANCE;
  }

  /**
   * Marca como resuelto
   */
  resolve(
    resolvedBy: string,
    resolutionNotes?: string
  ): UnsatisfiedDemandEntity {
    return new UnsatisfiedDemandEntity(
      this.id,
      this.resourceId,
      this.resourceName,
      this.resourceType,
      this.requestedBy,
      this.requesterName,
      this.requesterEmail,
      this.requestedDate,
      this.requestedStartTime,
      this.requestedEndTime,
      this.duration,
      this.reason,
      this.priority,
      UnsatisfiedDemandStatus.RESOLVED,
      this.reasonDetails,
      this.program,
      this.alternatives,
      new Date(),
      resolvedBy,
      resolutionNotes,
      this.metadata,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Convierte la entidad a objeto plano
   */
  toObject(): any {
    return {
      id: this.id,
      resourceId: this.resourceId,
      resourceName: this.resourceName,
      resourceType: this.resourceType,
      requestedBy: this.requestedBy,
      requesterName: this.requesterName,
      requesterEmail: this.requesterEmail,
      requestedDate: this.requestedDate,
      requestedStartTime: this.requestedStartTime,
      requestedEndTime: this.requestedEndTime,
      duration: this.duration,
      reason: this.reason,
      reasonDetails: this.reasonDetails,
      priority: this.priority,
      program: this.program,
      alternatives: this.alternatives,
      status: this.status,
      resolvedAt: this.resolvedAt,
      resolvedBy: this.resolvedBy,
      resolutionNotes: this.resolutionNotes,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Crea una entidad desde un objeto plano
   */
  static fromObject(obj: any): UnsatisfiedDemandEntity {
    return new UnsatisfiedDemandEntity(
      obj.id || obj._id?.toString(),
      obj.resourceId,
      obj.resourceName,
      obj.resourceType,
      obj.requestedBy,
      obj.requesterName,
      obj.requesterEmail,
      obj.requestedDate,
      obj.requestedStartTime,
      obj.requestedEndTime,
      obj.duration,
      obj.reason,
      obj.priority,
      obj.status,
      obj.reasonDetails,
      obj.program,
      obj.alternatives,
      obj.resolvedAt,
      obj.resolvedBy,
      obj.resolutionNotes,
      obj.metadata,
      obj.createdAt,
      obj.updatedAt
    );
  }
}
