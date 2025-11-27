import { EventPayload } from "@libs/common";

/**
 * Event Store Interface
 * Almacenamiento persistente de eventos para Event Sourcing
 *
 * Proporciona:
 * - Almacenamiento inmutable de eventos
 * - Recuperación de eventos por agregado
 * - Reconstrucción de estado desde eventos
 * - Snapshots para optimización
 */
export interface IEventStore {
  /**
   * Guardar un evento en el store
   * @param event - Evento a guardar
   */
  saveEvent<T = any>(event: StoredEvent<T>): Promise<void>;

  /**
   * Guardar múltiples eventos (transaccional)
   * @param events - Array de eventos
   */
  saveEvents<T = any>(events: StoredEvent<T>[]): Promise<void>;

  /**
   * Obtener todos los eventos de un agregado
   * @param aggregateId - ID del agregado
   * @param aggregateType - Tipo de agregado
   */
  getEventsByAggregate(
    aggregateId: string,
    aggregateType: string
  ): Promise<StoredEvent[]>;

  /**
   * Obtener eventos desde una versión específica
   * @param aggregateId - ID del agregado
   * @param aggregateType - Tipo de agregado
   * @param fromVersion - Versión inicial
   */
  getEventsByAggregateFromVersion(
    aggregateId: string,
    aggregateType: string,
    fromVersion: number
  ): Promise<StoredEvent[]>;

  /**
   * Obtener eventos por tipo
   * @param eventType - Tipo de evento
   * @param limit - Límite de eventos
   */
  getEventsByType(eventType: string, limit?: number): Promise<StoredEvent[]>;

  /**
   * Obtener eventos en un rango de fechas
   * @param startDate - Fecha inicial
   * @param endDate - Fecha final
   */
  getEventsByDateRange(startDate: Date, endDate: Date): Promise<StoredEvent[]>;

  /**
   * Crear snapshot del estado de un agregado
   * @param snapshot - Datos del snapshot
   */
  saveSnapshot(snapshot: AggregateSnapshot): Promise<void>;

  /**
   * Obtener último snapshot de un agregado
   * @param aggregateId - ID del agregado
   * @param aggregateType - Tipo de agregado
   */
  getLatestSnapshot(
    aggregateId: string,
    aggregateType: string
  ): Promise<AggregateSnapshot | null>;

  /**
   * Reproducir eventos (event replay)
   * @param handler - Función que procesa cada evento
   * @param filter - Filtros opcionales
   */
  replayEvents(
    handler: (event: StoredEvent) => Promise<void>,
    filter?: EventReplayFilter
  ): Promise<void>;
}

/**
 * Evento almacenado con metadata
 */
export interface StoredEvent<T = any> {
  /**
   * ID único del evento almacenado
   */
  id?: string;

  /**
   * ID del evento original
   */
  eventId: string;

  /**
   * Tipo de evento
   */
  eventType: string;

  /**
   * ID del agregado al que pertenece
   */
  aggregateId: string;

  /**
   * Tipo de agregado (User, Resource, Reservation, etc.)
   */
  aggregateType: string;

  /**
   * Versión del agregado (para control de concurrencia)
   */
  version: number;

  /**
   * Payload del evento
   */
  data: EventPayload<T> | T;

  /**
   * Metadata adicional
   */
  metadata?: {
    userId?: string;
    correlationId?: string;
    causationId?: string;
    [key: string]: any;
  };

  /**
   * Timestamp de creación
   */
  timestamp: Date;

  /**
   * Servicio que generó el evento
   */
  service: string;
}

/**
 * Snapshot de agregado para optimización
 */
export interface AggregateSnapshot {
  /**
   * ID del agregado
   */
  aggregateId: string;

  /**
   * Tipo de agregado
   */
  aggregateType: string;

  /**
   * Versión del agregado en el snapshot
   */
  version: number;

  /**
   * Estado del agregado
   */
  state: any;

  /**
   * Timestamp del snapshot
   */
  timestamp: Date;
}

/**
 * Filtros para event replay
 */
export interface EventReplayFilter {
  /**
   * Fecha inicial
   */
  startDate?: Date;

  /**
   * Fecha final
   */
  endDate?: Date;

  /**
   * Tipos de eventos a incluir
   */
  eventTypes?: string[];

  /**
   * Tipos de agregados a incluir
   */
  aggregateTypes?: string[];

  /**
   * IDs de agregados específicos
   */
  aggregateIds?: string[];

  /**
   * Servicios que generaron los eventos
   */
  services?: string[];
}
