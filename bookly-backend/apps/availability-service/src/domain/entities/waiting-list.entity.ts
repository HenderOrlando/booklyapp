/**
 * Waiting List Entity
 * Entidad de dominio para representar lista de espera
 */
export class WaitingListEntity {
  constructor(
    public readonly id: string,
    public readonly resourceId: string,
    public readonly userId: string,
    public readonly requestedStartDate: Date,
    public readonly requestedEndDate: Date,
    public readonly priority: number = 0,
    public readonly purpose?: string,
    public readonly isActive: boolean = true,
    public readonly notifiedAt?: Date,
    public readonly expiresAt?: Date,
    public readonly convertedToReservationId?: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
    public readonly audit?: {
      createdBy: string;
      updatedBy?: string;
      cancelledBy?: string;
      cancelledAt?: Date;
    }
  ) {}

  /**
   * Verifica si la solicitud está activa
   */
  isActiveRequest(): boolean {
    if (!this.isActive) {
      return false;
    }

    if (this.expiresAt && new Date() > this.expiresAt) {
      return false;
    }

    if (this.convertedToReservationId) {
      return false;
    }

    return true;
  }

  /**
   * Verifica si ha expirado
   */
  hasExpired(): boolean {
    return this.expiresAt ? new Date() > this.expiresAt : false;
  }

  /**
   * Verifica si ya fue convertida a reserva
   */
  isConverted(): boolean {
    return !!this.convertedToReservationId;
  }

  /**
   * Marca como notificada
   */
  markAsNotified(): WaitingListEntity {
    return new WaitingListEntity(
      this.id,
      this.resourceId,
      this.userId,
      this.requestedStartDate,
      this.requestedEndDate,
      this.priority,
      this.purpose,
      this.isActive,
      new Date(),
      this.expiresAt,
      this.convertedToReservationId,
      this.createdAt,
      new Date(),
      this.audit
    );
  }

  /**
   * Convierte a reserva
   */
  convertToReservation(reservationId: string): WaitingListEntity {
    return new WaitingListEntity(
      this.id,
      this.resourceId,
      this.userId,
      this.requestedStartDate,
      this.requestedEndDate,
      this.priority,
      this.purpose,
      false,
      this.notifiedAt,
      this.expiresAt,
      reservationId,
      this.createdAt,
      new Date(),
      this.audit
    );
  }

  /**
   * Cancela la solicitud
   */
  cancel(cancelledBy: string): WaitingListEntity {
    return new WaitingListEntity(
      this.id,
      this.resourceId,
      this.userId,
      this.requestedStartDate,
      this.requestedEndDate,
      this.priority,
      this.purpose,
      false,
      this.notifiedAt,
      this.expiresAt,
      this.convertedToReservationId,
      this.createdAt,
      new Date(),
      {
        createdBy: this.audit?.createdBy || cancelledBy,
        updatedBy: this.audit?.updatedBy,
        cancelledBy,
        cancelledAt: new Date(),
      }
    );
  }

  /**
   * Compara prioridades con otra solicitud
   */
  hasHigherPriorityThan(other: WaitingListEntity): boolean {
    if (this.priority !== other.priority) {
      return this.priority > other.priority;
    }
    // Si tienen la misma prioridad, el más antiguo tiene preferencia
    if (!this.createdAt || !other.createdAt) {
      return false;
    }
    return this.createdAt < other.createdAt;
  }

  /**
   * Convierte la entidad a objeto plano
   */
  toObject(): any {
    return {
      id: this.id,
      resourceId: this.resourceId,
      userId: this.userId,
      requestedStartDate: this.requestedStartDate,
      requestedEndDate: this.requestedEndDate,
      priority: this.priority,
      purpose: this.purpose,
      isActive: this.isActive,
      notifiedAt: this.notifiedAt,
      expiresAt: this.expiresAt,
      convertedToReservationId: this.convertedToReservationId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      audit: this.audit,
    };
  }

  /**
   * Crea una entidad desde un objeto plano
   */
  static fromObject(obj: any): WaitingListEntity {
    return new WaitingListEntity(
      obj.id || obj._id?.toString(),
      obj.resourceId,
      obj.userId,
      obj.requestedStartDate instanceof Date
        ? obj.requestedStartDate
        : new Date(obj.requestedStartDate),
      obj.requestedEndDate instanceof Date
        ? obj.requestedEndDate
        : new Date(obj.requestedEndDate),
      obj.priority,
      obj.purpose,
      obj.isActive !== undefined ? obj.isActive : true,
      obj.notifiedAt
        ? obj.notifiedAt instanceof Date
          ? obj.notifiedAt
          : new Date(obj.notifiedAt)
        : undefined,
      obj.expiresAt
        ? obj.expiresAt instanceof Date
          ? obj.expiresAt
          : new Date(obj.expiresAt)
        : undefined,
      obj.convertedToReservationId,
      obj.createdAt,
      obj.updatedAt,
      obj.audit
    );
  }
}
