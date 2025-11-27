/**
 * Eventos de Kafka para Series Recurrentes
 * Eventos para sincronización y notificaciones
 */

/**
 * Evento: Serie Recurrente Creada
 */
export class RecurringSeriesCreatedEvent {
  constructor(
    public readonly seriesId: string,
    public readonly userId: string,
    public readonly resourceId: string,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly purpose: string,
    public readonly pattern: {
      frequency: string;
      interval: number;
      occurrences?: number;
      endDate?: Date;
      daysOfWeek?: number[];
      monthDay?: number;
    },
    public readonly totalInstances: number,
    public readonly instanceIds: string[],
    public readonly createdAt: Date
  ) {}
}

/**
 * Evento: Serie Recurrente Cancelada
 */
export class RecurringSeriesCancelledEvent {
  constructor(
    public readonly seriesId: string,
    public readonly userId: string,
    public readonly resourceId: string,
    public readonly cancelledBy: string,
    public readonly reason: string,
    public readonly cancelledInstances: number,
    public readonly totalInstances: number,
    public readonly cancelledAt: Date
  ) {}
}

/**
 * Evento: Instancia Recurrente Modificada
 */
export class RecurringInstanceModifiedEvent {
  constructor(
    public readonly instanceId: string,
    public readonly seriesId: string,
    public readonly userId: string,
    public readonly resourceId: string,
    public readonly modifiedBy: string,
    public readonly changes: {
      oldStartDate?: Date;
      newStartDate?: Date;
      oldEndDate?: Date;
      newEndDate?: Date;
      oldPurpose?: string;
      newPurpose?: string;
    },
    public readonly reason: string,
    public readonly modifiedAt: Date
  ) {}
}

/**
 * Evento: Serie Recurrente Actualizada
 */
export class RecurringSeriesUpdatedEvent {
  constructor(
    public readonly seriesId: string,
    public readonly userId: string,
    public readonly resourceId: string,
    public readonly updatedBy: string,
    public readonly changes: Record<string, any>,
    public readonly affectedInstances: number,
    public readonly updatedAt: Date
  ) {}
}

/**
 * Evento: Instancia Recurrente Cancelada
 */
export class RecurringInstanceCancelledEvent {
  constructor(
    public readonly instanceId: string,
    public readonly seriesId: string,
    public readonly userId: string,
    public readonly resourceId: string,
    public readonly cancelledBy: string,
    public readonly reason: string,
    public readonly scheduledDate: Date,
    public readonly cancelledAt: Date
  ) {}
}
