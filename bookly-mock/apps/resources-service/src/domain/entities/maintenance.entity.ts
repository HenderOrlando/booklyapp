import { MaintenanceStatus, MaintenanceType } from "@libs/common/enums";
import { AuditInfo } from "@libs/common";

// Re-export enums for convenience
export { MaintenanceStatus, MaintenanceType };

/**
 * Maintenance Entity
 * Entidad de dominio para mantenimientos de recursos
 */
export class MaintenanceEntity {
  constructor(
    public readonly id: string,
    public resourceId: string,
    public type: MaintenanceType,
    public title: string,
    public description: string,
    public scheduledStartDate: Date,
    public scheduledEndDate: Date,
    public actualStartDate?: Date,
    public actualEndDate?: Date,
    public status: MaintenanceStatus = MaintenanceStatus.SCHEDULED,
    public performedBy?: string,
    public cost?: number,
    public notes?: string,
    public affectsAvailability: boolean = true,
    public createdAt?: Date,
    public updatedAt?: Date,
    public audit?: AuditInfo
  ) {}

  /**
   * Verifica si el mantenimiento está en progreso
   */
  isInProgress(): boolean {
    return this.status === MaintenanceStatus.IN_PROGRESS;
  }

  /**
   * Verifica si el mantenimiento está completado
   */
  isCompleted(): boolean {
    return this.status === MaintenanceStatus.COMPLETED;
  }

  /**
   * Verifica si el mantenimiento está programado
   */
  isScheduled(): boolean {
    return this.status === MaintenanceStatus.SCHEDULED;
  }

  /**
   * Verifica si el mantenimiento está cancelado
   */
  isCancelled(): boolean {
    return this.status === MaintenanceStatus.CANCELLED;
  }

  /**
   * Inicia el mantenimiento
   */
  start(): void {
    if (this.status !== MaintenanceStatus.SCHEDULED) {
      throw new Error("Solo se puede iniciar un mantenimiento programado");
    }
    this.status = MaintenanceStatus.IN_PROGRESS;
    this.actualStartDate = new Date();
  }

  /**
   * Completa el mantenimiento
   */
  complete(): void {
    if (this.status !== MaintenanceStatus.IN_PROGRESS) {
      throw new Error("Solo se puede completar un mantenimiento en progreso");
    }
    this.status = MaintenanceStatus.COMPLETED;
    this.actualEndDate = new Date();
  }

  /**
   * Cancela el mantenimiento
   */
  cancel(): void {
    if (
      this.status === MaintenanceStatus.COMPLETED ||
      this.status === MaintenanceStatus.CANCELLED
    ) {
      throw new Error(
        "No se puede cancelar un mantenimiento completado o ya cancelado"
      );
    }
    this.status = MaintenanceStatus.CANCELLED;
  }

  /**
   * Verifica si el mantenimiento está activo en una fecha dada
   */
  isActiveOnDate(date: Date): boolean {
    return (
      date >= this.scheduledStartDate &&
      date <= this.scheduledEndDate &&
      this.status !== MaintenanceStatus.CANCELLED
    );
  }

  /**
   * Calcula la duración real del mantenimiento en horas
   */
  getActualDurationHours(): number | null {
    if (!this.actualStartDate || !this.actualEndDate) {
      return null;
    }
    const diff = this.actualEndDate.getTime() - this.actualStartDate.getTime();
    return diff / (1000 * 60 * 60); // Convertir a horas
  }

  /**
   * Calcula la duración programada del mantenimiento en horas
   */
  getScheduledDurationHours(): number {
    const diff =
      this.scheduledEndDate.getTime() - this.scheduledStartDate.getTime();
    return diff / (1000 * 60 * 60); // Convertir a horas
  }

  /**
   * Convierte la entidad a objeto plano
   */
  toObject(): any {
    return {
      id: this.id,
      resourceId: this.resourceId,
      type: this.type,
      title: this.title,
      description: this.description,
      scheduledStartDate: this.scheduledStartDate,
      scheduledEndDate: this.scheduledEndDate,
      actualStartDate: this.actualStartDate,
      actualEndDate: this.actualEndDate,
      status: this.status,
      performedBy: this.performedBy,
      cost: this.cost,
      notes: this.notes,
      affectsAvailability: this.affectsAvailability,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      audit: this.audit,
    };
  }

  /**
   * Crea una entidad desde un objeto plano
   */
  static fromObject(obj: any): MaintenanceEntity {
    return new MaintenanceEntity(
      obj.id || obj._id?.toString(),
      obj.resourceId,
      obj.type,
      obj.title,
      obj.description,
      new Date(obj.scheduledStartDate),
      new Date(obj.scheduledEndDate),
      obj.actualStartDate ? new Date(obj.actualStartDate) : undefined,
      obj.actualEndDate ? new Date(obj.actualEndDate) : undefined,
      obj.status,
      obj.performedBy,
      obj.cost,
      obj.notes,
      obj.affectsAvailability,
      obj.createdAt,
      obj.updatedAt,
      obj.audit
    );
  }
}
