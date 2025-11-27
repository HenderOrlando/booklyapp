import { RecurrenceType, ReservationStatus } from "@libs/common/enums";

/**
 * Reservation Entity
 * Entidad de dominio para representar reservas de recursos
 */
export class ReservationEntity {
  constructor(
    public readonly id: string,
    public readonly resourceId: string,
    public readonly userId: string,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly purpose: string,
    public readonly status: ReservationStatus,
    public readonly isRecurring: boolean = false,
    public readonly recurringPattern?: {
      frequency: RecurrenceType;
      interval: number;
      endDate?: Date;
      occurrences?: number;
      daysOfWeek?: number[];
      monthDay?: number;
    },
    public readonly participants?: {
      userId: string;
      name: string;
      email: string;
    }[],
    public readonly notes?: string,
    public readonly checkInTime?: Date,
    public readonly checkOutTime?: Date,
    public readonly externalCalendarId?: string,
    public readonly externalCalendarEventId?: string,
    public readonly seriesId?: string,
    public readonly parentReservationId?: string,
    public readonly instanceNumber?: number,
    public readonly exceptions?: {
      date: Date;
      reason: string;
      modifiedTo?: Date;
    }[],
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
    public readonly audit?: {
      createdBy: string;
      updatedBy?: string;
      cancelledBy?: string;
      cancelledAt?: Date;
      cancellationReason?: string;
    }
  ) {}

  /**
   * Verifica si la reserva está activa
   */
  isActive(): boolean {
    return (
      this.status === ReservationStatus.CONFIRMED ||
      this.status === ReservationStatus.CHECKED_IN
    );
  }

  /**
   * Verifica si la reserva puede ser cancelada
   */
  canBeCancelled(): boolean {
    return (
      this.status === ReservationStatus.PENDING ||
      this.status === ReservationStatus.CONFIRMED
    );
  }

  /**
   * Verifica si la reserva puede ser modificada
   */
  canBeModified(): boolean {
    return (
      this.status === ReservationStatus.PENDING ||
      this.status === ReservationStatus.CONFIRMED
    );
  }

  /**
   * Verifica si la reserva está en progreso
   */
  isInProgress(): boolean {
    const now = new Date();
    return (
      this.status === ReservationStatus.CHECKED_IN &&
      this.startDate <= now &&
      this.endDate >= now
    );
  }

  /**
   * Verifica si la reserva ha expirado
   */
  hasExpired(): boolean {
    const now = new Date();
    return this.endDate < now && this.status !== ReservationStatus.COMPLETED;
  }

  /**
   * Calcula la duración de la reserva en minutos
   */
  getDurationInMinutes(): number {
    return Math.floor(
      (this.endDate.getTime() - this.startDate.getTime()) / (1000 * 60)
    );
  }

  /**
   * Verifica si hay conflicto con otra reserva
   */
  conflictsWith(other: ReservationEntity): boolean {
    if (this.resourceId !== other.resourceId) {
      return false;
    }

    return (
      (this.startDate >= other.startDate && this.startDate < other.endDate) ||
      (this.endDate > other.startDate && this.endDate <= other.endDate) ||
      (this.startDate <= other.startDate && this.endDate >= other.endDate)
    );
  }

  /**
   * Cancela la reserva
   */
  cancel(cancelledBy: string, reason?: string): ReservationEntity {
    if (!this.canBeCancelled()) {
      throw new Error(`Cannot cancel reservation with status: ${this.status}`);
    }

    return new ReservationEntity(
      this.id,
      this.resourceId,
      this.userId,
      this.startDate,
      this.endDate,
      this.purpose,
      ReservationStatus.CANCELLED,
      this.isRecurring,
      this.recurringPattern,
      this.participants,
      this.notes,
      this.checkInTime,
      this.checkOutTime,
      this.externalCalendarId,
      this.externalCalendarEventId,
      this.seriesId,
      this.parentReservationId,
      this.instanceNumber,
      this.exceptions,
      this.createdAt,
      new Date(),
      {
        createdBy: this.audit?.createdBy || cancelledBy,
        updatedBy: this.audit?.updatedBy,
        cancelledBy,
        cancelledAt: new Date(),
        cancellationReason: reason,
      }
    );
  }

  /**
   * Realiza check-in de la reserva
   */
  checkIn(): ReservationEntity {
    if (this.status !== ReservationStatus.CONFIRMED) {
      throw new Error(
        `Cannot check-in reservation with status: ${this.status}`
      );
    }

    return new ReservationEntity(
      this.id,
      this.resourceId,
      this.userId,
      this.startDate,
      this.endDate,
      this.purpose,
      ReservationStatus.CHECKED_IN,
      this.isRecurring,
      this.recurringPattern,
      this.participants,
      this.notes,
      new Date(),
      this.checkOutTime,
      this.externalCalendarId,
      this.externalCalendarEventId,
      this.seriesId,
      this.parentReservationId,
      this.instanceNumber,
      this.exceptions,
      this.createdAt,
      new Date(),
      this.audit
    );
  }

  /**
   * Realiza check-out de la reserva
   */
  checkOut(): ReservationEntity {
    if (this.status !== ReservationStatus.CHECKED_IN) {
      throw new Error(
        `Cannot check-out reservation with status: ${this.status}`
      );
    }

    return new ReservationEntity(
      this.id,
      this.resourceId,
      this.userId,
      this.startDate,
      this.endDate,
      this.purpose,
      ReservationStatus.COMPLETED,
      this.isRecurring,
      this.recurringPattern,
      this.participants,
      this.notes,
      this.checkInTime,
      new Date(),
      this.externalCalendarId,
      this.externalCalendarEventId,
      this.seriesId,
      this.parentReservationId,
      this.instanceNumber,
      this.exceptions,
      this.createdAt,
      new Date(),
      this.audit
    );
  }

  /**
   * Convierte la entidad a objeto plano
   */
  toObject(): any {
    return {
      id: this.id,
      resourceId: this.resourceId,
      userId: this.userId,
      startDate: this.startDate,
      endDate: this.endDate,
      purpose: this.purpose,
      status: this.status,
      isRecurring: this.isRecurring,
      recurringPattern: this.recurringPattern,
      participants: this.participants,
      notes: this.notes,
      checkInTime: this.checkInTime,
      checkOutTime: this.checkOutTime,
      externalCalendarId: this.externalCalendarId,
      externalCalendarEventId: this.externalCalendarEventId,
      seriesId: this.seriesId,
      parentReservationId: this.parentReservationId,
      instanceNumber: this.instanceNumber,
      exceptions: this.exceptions,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      audit: this.audit,
    };
  }

  /**
   * Crea una entidad desde un objeto plano
   */
  static fromObject(obj: any): ReservationEntity {
    return new ReservationEntity(
      obj.id || obj._id?.toString(),
      obj.resourceId,
      obj.userId,
      obj.startDate instanceof Date ? obj.startDate : new Date(obj.startDate),
      obj.endDate instanceof Date ? obj.endDate : new Date(obj.endDate),
      obj.purpose,
      obj.status,
      obj.isRecurring,
      obj.recurringPattern,
      obj.participants,
      obj.notes,
      obj.checkInTime
        ? obj.checkInTime instanceof Date
          ? obj.checkInTime
          : new Date(obj.checkInTime)
        : undefined,
      obj.checkOutTime
        ? obj.checkOutTime instanceof Date
          ? obj.checkOutTime
          : new Date(obj.checkOutTime)
        : undefined,
      obj.externalCalendarId,
      obj.externalCalendarEventId,
      obj.seriesId,
      obj.parentReservationId,
      obj.instanceNumber,
      obj.exceptions,
      obj.createdAt,
      obj.updatedAt,
      obj.audit
    );
  }
}
