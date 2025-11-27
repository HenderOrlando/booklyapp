import { CheckInOutStatus, CheckInOutType } from "@libs/common/enums";

/**
 * Check-in/Check-out Entity
 * Entidad de dominio para registro de entrada/salida
 */
export class CheckInOutEntity {
  constructor(
    public readonly id: string,
    public readonly reservationId: string,
    public readonly resourceId: string,
    public readonly userId: string,
    public readonly status: CheckInOutStatus,
    public readonly checkInTime?: Date,
    public readonly checkInBy?: string,
    public readonly checkInType?: CheckInOutType,
    public readonly checkInNotes?: string,
    public readonly checkOutTime?: Date,
    public readonly checkOutBy?: string,
    public readonly checkOutType?: CheckInOutType,
    public readonly checkOutNotes?: string,
    public readonly expectedReturnTime?: Date,
    public readonly actualReturnTime?: Date,
    public readonly resourceCondition?: {
      beforeCheckIn?: string;
      afterCheckOut?: string;
      damageReported?: boolean;
      damageDescription?: string;
    },
    public readonly metadata?: {
      qrCode?: string; // QR code almacenado en metadata
      rfidTag?: string;
      location?: string;
      ipAddress?: string;
      deviceInfo?: string;
      [key: string]: any;
    },
    // Campos poblados desde Reservation
    public readonly reservationStartTime?: Date,
    public readonly reservationEndTime?: Date,
    // Campos poblados desde Resource
    public readonly resourceType?: string,
    public readonly resourceName?: string,
    // Campos poblados desde User
    public readonly userName?: string,
    public readonly userEmail?: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {}

  /**
   * Verifica si el check-in está activo
   */
  isCheckedIn(): boolean {
    return this.status === CheckInOutStatus.CHECKED_IN;
  }

  /**
   * Verifica si el check-out está completo
   */
  isCheckedOut(): boolean {
    return this.status === CheckInOutStatus.CHECKED_OUT;
  }

  /**
   * Verifica si está vencido
   */
  isOverdue(): boolean {
    return this.status === CheckInOutStatus.OVERDUE;
  }

  /**
   * Verifica si está cancelado
   */
  isCancelled(): boolean {
    return this.status === CheckInOutStatus.CANCELLED;
  }

  /**
   * Verifica si se devolvió a tiempo
   */
  isReturnedOnTime(): boolean {
    if (!this.actualReturnTime || !this.expectedReturnTime) {
      return true;
    }
    return this.actualReturnTime <= this.expectedReturnTime;
  }

  /**
   * Calcula retraso en minutos
   */
  getDelayMinutes(): number {
    if (!this.actualReturnTime || !this.expectedReturnTime) {
      return 0;
    }
    const diff =
      this.actualReturnTime.getTime() - this.expectedReturnTime.getTime();
    return Math.max(0, Math.floor(diff / (1000 * 60)));
  }

  /**
   * Verifica si hay daños reportados
   */
  hasDamageReported(): boolean {
    return this.resourceCondition?.damageReported === true;
  }

  /**
   * Realiza check-in
   */
  checkIn(
    userId: string,
    type: CheckInOutType,
    notes?: string,
    metadata?: any
  ): CheckInOutEntity {
    if (this.isCheckedIn()) {
      throw new Error("Ya se ha realizado check-in");
    }

    return new CheckInOutEntity(
      this.id,
      this.reservationId,
      this.resourceId,
      this.userId,
      CheckInOutStatus.CHECKED_IN,
      new Date(),
      userId,
      type,
      notes,
      undefined,
      undefined,
      undefined,
      undefined,
      this.expectedReturnTime,
      undefined,
      this.resourceCondition,
      { ...this.metadata, ...metadata },
      this.reservationStartTime,
      this.reservationEndTime,
      this.resourceType,
      this.resourceName,
      this.userName,
      this.userEmail,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Realiza check-out
   */
  checkOut(
    userId: string,
    type: CheckInOutType,
    notes?: string,
    resourceCondition?: string,
    damageReported?: boolean,
    damageDescription?: string,
    metadata?: any
  ): CheckInOutEntity {
    if (!this.isCheckedIn()) {
      throw new Error("Debe realizar check-in primero");
    }

    if (this.isCheckedOut()) {
      throw new Error("Ya se ha realizado check-out");
    }

    const now = new Date();
    const isOverdue = this.expectedReturnTime && now > this.expectedReturnTime;

    return new CheckInOutEntity(
      this.id,
      this.reservationId,
      this.resourceId,
      this.userId,
      isOverdue ? CheckInOutStatus.OVERDUE : CheckInOutStatus.CHECKED_OUT,
      this.checkInTime,
      this.checkInBy,
      this.checkInType,
      this.checkInNotes,
      now,
      userId,
      type,
      notes,
      this.expectedReturnTime,
      now,
      {
        ...this.resourceCondition,
        afterCheckOut: resourceCondition,
        damageReported,
        damageDescription,
      },
      { ...this.metadata, ...metadata },
      this.reservationStartTime,
      this.reservationEndTime,
      this.resourceType,
      this.resourceName,
      this.userName,
      this.userEmail,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Cancela el check-in/out
   */
  cancel(): CheckInOutEntity {
    return new CheckInOutEntity(
      this.id,
      this.reservationId,
      this.resourceId,
      this.userId,
      CheckInOutStatus.CANCELLED,
      this.checkInTime,
      this.checkInBy,
      this.checkInType,
      this.checkInNotes,
      this.checkOutTime,
      this.checkOutBy,
      this.checkOutType,
      this.checkOutNotes,
      this.expectedReturnTime,
      this.actualReturnTime,
      this.resourceCondition,
      this.metadata,
      this.reservationStartTime,
      this.reservationEndTime,
      this.resourceType,
      this.resourceName,
      this.userName,
      this.userEmail,
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
      reservationId: this.reservationId,
      resourceId: this.resourceId,
      userId: this.userId,
      status: this.status,
      checkInTime: this.checkInTime,
      checkInBy: this.checkInBy,
      checkInType: this.checkInType,
      checkInNotes: this.checkInNotes,
      checkOutTime: this.checkOutTime,
      checkOutBy: this.checkOutBy,
      checkOutType: this.checkOutType,
      checkOutNotes: this.checkOutNotes,
      expectedReturnTime: this.expectedReturnTime,
      actualReturnTime: this.actualReturnTime,
      resourceCondition: this.resourceCondition,
      metadata: this.metadata,
      qrCode: this.metadata?.qrCode, // Extraído de metadata para fácil acceso
      reservationStartTime: this.reservationStartTime,
      reservationEndTime: this.reservationEndTime,
      resourceType: this.resourceType,
      resourceName: this.resourceName,
      userName: this.userName,
      userEmail: this.userEmail,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Crea una entidad desde un objeto plano
   */
  static fromObject(obj: any): CheckInOutEntity {
    return new CheckInOutEntity(
      obj.id || obj._id?.toString(),
      obj.reservationId?.toString
        ? obj.reservationId.toString()
        : obj.reservationId,
      obj.resourceId?.toString ? obj.resourceId.toString() : obj.resourceId,
      obj.userId?.toString ? obj.userId.toString() : obj.userId,
      obj.status,
      obj.checkInTime ? new Date(obj.checkInTime) : undefined,
      obj.checkInBy,
      obj.checkInType,
      obj.checkInNotes,
      obj.checkOutTime ? new Date(obj.checkOutTime) : undefined,
      obj.checkOutBy,
      obj.checkOutType,
      obj.checkOutNotes,
      obj.expectedReturnTime ? new Date(obj.expectedReturnTime) : undefined,
      obj.actualReturnTime ? new Date(obj.actualReturnTime) : undefined,
      obj.resourceCondition,
      obj.metadata,
      obj.reservationStartTime ? new Date(obj.reservationStartTime) : undefined,
      obj.reservationEndTime ? new Date(obj.reservationEndTime) : undefined,
      obj.resourceType,
      obj.resourceName,
      obj.userName,
      obj.userEmail,
      obj.createdAt,
      obj.updatedAt
    );
  }
}
