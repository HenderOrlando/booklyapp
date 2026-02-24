import { WeekDay } from "@libs/common/enums";

/**
 * Availability Entity
 * Entidad de dominio para representar la disponibilidad de recursos
 */
export class AvailabilityEntity {
  constructor(
    public readonly id: string,
    public readonly resourceId: string,
    public readonly dayOfWeek: WeekDay,
    public readonly startTime: string, // Format: "HH:mm"
    public readonly endTime: string, // Format: "HH:mm"
    public readonly isAvailable: boolean = true,
    public readonly maxConcurrentReservations: number = 1,
    public readonly effectiveFrom?: Date,
    public readonly effectiveUntil?: Date,
    public readonly notes?: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
    public readonly audit?: {
      createdBy: string;
      updatedBy?: string;
    }
  ) {}

  /**
   * Verifica si está activa en una fecha específica
   */
  isActiveOn(date: Date): boolean {
    if (this.effectiveFrom && date < this.effectiveFrom) {
      return false;
    }
    if (this.effectiveUntil && date > this.effectiveUntil) {
      return false;
    }
    return this.isAvailable;
  }

  /**
   * Verifica si el horario es válido
   */
  isValid(): boolean {
    const [startHour, startMinute] = this.startTime.split(":").map(Number);
    const [endHour, endMinute] = this.endTime.split(":").map(Number);

    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    return endMinutes > startMinutes;
  }

  /**
   * Calcula la duración en minutos
   */
  getDurationInMinutes(): number {
    const [startHour, startMinute] = this.startTime.split(":").map(Number);
    const [endHour, endMinute] = this.endTime.split(":").map(Number);

    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    return endMinutes - startMinutes;
  }

  /**
   * Verifica si un horario cae dentro de la disponibilidad
   */
  includesTime(time: string): boolean {
    return time >= this.startTime && time <= this.endTime;
  }

  /**
   * Verifica si hay solapamiento con otra disponibilidad
   */
  overlapsWith(other: AvailabilityEntity): boolean {
    if (this.dayOfWeek !== other.dayOfWeek) {
      return false;
    }

    return (
      (this.startTime >= other.startTime && this.startTime < other.endTime) ||
      (this.endTime > other.startTime && this.endTime <= other.endTime) ||
      (this.startTime <= other.startTime && this.endTime >= other.endTime)
    );
  }

  /**
   * Convierte la entidad a objeto plano
   */
  toObject(): any {
    return {
      id: this.id,
      resourceId: this.resourceId,
      dayOfWeek: this.dayOfWeek,
      startTime: this.startTime,
      endTime: this.endTime,
      isAvailable: this.isAvailable,
      maxConcurrentReservations: this.maxConcurrentReservations,
      effectiveFrom: this.effectiveFrom,
      effectiveUntil: this.effectiveUntil,
      notes: this.notes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      audit: this.audit,
    };
  }

  /**
   * Crea una entidad desde un objeto plano
   */
  static fromObject(obj: any): AvailabilityEntity {
    return new AvailabilityEntity(
      obj.id || obj._id?.toString(),
      obj.resourceId,
      obj.dayOfWeek,
      obj.startTime,
      obj.endTime,
      obj.isAvailable !== undefined ? obj.isAvailable : true,
      obj.maxConcurrentReservations || 1,
      obj.effectiveFrom
        ? obj.effectiveFrom instanceof Date
          ? obj.effectiveFrom
          : new Date(obj.effectiveFrom)
        : undefined,
      obj.effectiveUntil
        ? obj.effectiveUntil instanceof Date
          ? obj.effectiveUntil
          : new Date(obj.effectiveUntil)
        : undefined,
      obj.notes,
      obj.createdAt,
      obj.updatedAt,
      obj.audit
    );
  }
}
