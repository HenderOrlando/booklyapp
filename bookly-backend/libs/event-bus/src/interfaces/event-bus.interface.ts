import { EventPayload } from "@libs/common";

/**
 * Event Bus Interface
 * Abstracción para diferentes brokers de mensajería (Kafka, RabbitMQ, etc.)
 *
 * Proporciona una interfaz unificada para:
 * - Publicar eventos
 * - Suscribirse a eventos
 * - Gestión de conexiones
 * - Health checks
 */
export interface IEventBus {
  /**
   * Conectar al broker de mensajería
   */
  connect(): Promise<void>;

  /**
   * Desconectar del broker
   */
  disconnect(): Promise<void>;

  /**
   * Publicar un evento
   * @param topic - Tópico o routing key
   * @param event - Payload del evento
   */
  publish<T = any>(topic: string, event: EventPayload<T>): Promise<void>;

  /**
   * Publicar múltiples eventos en batch
   * @param events - Array de eventos con sus tópicos
   */
  publishBatch<T = any>(
    events: Array<{ topic: string; event: EventPayload<T> }>
  ): Promise<void>;

  /**
   * Suscribirse a un tópico o patrón
   * @param topic - Tópico o patrón a suscribirse
   * @param groupId - ID del grupo de consumidores
   * @param handler - Función que maneja los eventos recibidos
   */
  subscribe<T = any>(
    topic: string,
    groupId: string,
    handler: (event: EventPayload<T>) => Promise<void>
  ): Promise<void>;

  /**
   * Desuscribirse de un tópico
   * @param topic - Tópico del cual desuscribirse
   */
  unsubscribe(topic: string): Promise<void>;

  /**
   * Verificar si el broker está saludable
   */
  isHealthy(): Promise<boolean>;

  /**
   * Obtener nombre del broker (kafka, rabbitmq, etc.)
   */
  getBrokerType(): string;
}

/**
 * Opciones de configuración del Event Bus
 */
export interface EventBusOptions {
  /**
   * Tipo de broker: 'kafka' | 'rabbitmq'
   */
  brokerType: "kafka" | "rabbitmq";

  /**
   * Configuración específica del broker
   */
  config: KafkaConfig | RabbitMQConfig;

  /**
   * Habilitar Event Store para Event Sourcing
   */
  enableEventStore?: boolean;

  /**
   * Prefijo para tópicos/queues
   */
  topicPrefix?: string;
}

/**
 * Configuración de Kafka
 */
export interface KafkaConfig {
  clientId: string;
  brokers: string[];
  groupId?: string;
  retryAttempts?: number;
  retryDelay?: number;
}

/**
 * Configuración de RabbitMQ
 */
export interface RabbitMQConfig {
  url: string;
  queue?: string;
  exchange?: string;
  exchangeType?: "direct" | "topic" | "fanout" | "headers";
  durable?: boolean;
  prefetchCount?: number;
}
