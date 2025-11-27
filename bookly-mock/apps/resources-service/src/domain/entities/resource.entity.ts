import { ResourceStatus, ResourceType } from "@libs/common/enums";
import { AuditInfo } from "@libs/common";

/**
 * Resource Entity
 * Entidad de dominio para recursos físicos (salas, equipos, etc.)
 */
export class ResourceEntity {
  constructor(
    public readonly id: string,
    public code: string,
    public name: string,
    public description: string,
    public type: ResourceType,
    public categoryId: string,
    public capacity: number,
    public location: string,
    public floor?: string,
    public building?: string,
    public attributes: Record<string, any> = {},
    public programIds: string[] = [],
    public status: ResourceStatus = ResourceStatus.AVAILABLE,
    public isActive: boolean = true,
    public maintenanceSchedule?: {
      nextMaintenanceDate?: Date;
      lastMaintenanceDate?: Date;
      maintenanceFrequencyDays?: number;
    },
    public availabilityRules?: {
      requiresApproval: boolean;
      maxAdvanceBookingDays: number;
      minBookingDurationMinutes: number;
      maxBookingDurationMinutes: number;
      allowRecurring: boolean;
    },
    public createdAt?: Date,
    public updatedAt?: Date,
    public audit?: AuditInfo
  ) {}

  /**
   * Verifica si el recurso está disponible para reserva
   */
  isAvailableForBooking(): boolean {
    return (
      this.isActive &&
      (this.status === ResourceStatus.AVAILABLE ||
        this.status === ResourceStatus.RESERVED)
    );
  }

  /**
   * Verifica si el recurso requiere aprobación para reserva
   */
  requiresApproval(): boolean {
    return this.availabilityRules?.requiresApproval ?? false;
  }

  /**
   * Valida la duración de una reserva contra las reglas del recurso
   */
  isValidBookingDuration(durationMinutes: number): boolean {
    if (!this.availabilityRules) return true;

    const { minBookingDurationMinutes, maxBookingDurationMinutes } =
      this.availabilityRules;

    if (
      minBookingDurationMinutes &&
      durationMinutes < minBookingDurationMinutes
    ) {
      return false;
    }

    if (
      maxBookingDurationMinutes &&
      durationMinutes > maxBookingDurationMinutes
    ) {
      return false;
    }

    return true;
  }

  /**
   * Verifica si el recurso permite reservas recurrentes
   */
  allowsRecurringBooking(): boolean {
    return this.availabilityRules?.allowRecurring ?? true;
  }

  /**
   * Verifica si el recurso necesita mantenimiento
   */
  needsMaintenance(): boolean {
    if (
      !this.maintenanceSchedule?.nextMaintenanceDate ||
      !this.maintenanceSchedule?.maintenanceFrequencyDays
    ) {
      return false;
    }

    const now = new Date();
    return now >= this.maintenanceSchedule.nextMaintenanceDate;
  }

  /**
   * Actualiza el estado del recurso
   */
  updateStatus(newStatus: ResourceStatus): void {
    this.status = newStatus;
  }

  /**
   * Marca el recurso como en mantenimiento
   */
  setMaintenance(): void {
    this.status = ResourceStatus.MAINTENANCE;
  }

  /**
   * Marca el recurso como disponible
   */
  setAvailable(): void {
    if (this.isActive) {
      this.status = ResourceStatus.AVAILABLE;
    }
  }

  /**
   * Activa el recurso
   */
  activate(): void {
    this.isActive = true;
    if (this.status === ResourceStatus.UNAVAILABLE) {
      this.status = ResourceStatus.AVAILABLE;
    }
  }

  /**
   * Desactiva el recurso
   */
  deactivate(): void {
    this.isActive = false;
    this.status = ResourceStatus.UNAVAILABLE;
  }

  /**
   * Convierte la entidad a objeto plano
   */
  toObject(): any {
    return {
      id: this.id,
      code: this.code,
      name: this.name,
      description: this.description,
      type: this.type,
      categoryId: this.categoryId,
      capacity: this.capacity,
      location: this.location,
      floor: this.floor,
      building: this.building,
      attributes: this.attributes,
      programIds: this.programIds,
      status: this.status,
      isActive: this.isActive,
      maintenanceSchedule: this.maintenanceSchedule,
      availabilityRules: this.availabilityRules,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      audit: this.audit,
    };
  }

  /**
   * Crea una entidad desde un objeto plano
   */
  static fromObject(obj: any): ResourceEntity {
    return new ResourceEntity(
      obj.id || obj._id?.toString(),
      obj.code,
      obj.name,
      obj.description,
      obj.type,
      obj.categoryId,
      obj.capacity,
      obj.location,
      obj.floor,
      obj.building,
      obj.attributes,
      obj.programIds,
      obj.status,
      obj.isActive,
      obj.maintenanceSchedule,
      obj.availabilityRules,
      obj.createdAt,
      obj.updatedAt,
      obj.audit
    );
  }
}
