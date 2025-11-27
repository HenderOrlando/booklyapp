import { EventPayload, createLogger } from "@libs/common";
import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { Admin, Consumer, EachMessagePayload, Kafka, Producer } from "kafkajs";
import { IEventBus, KafkaConfig } from "../interfaces";

const logger = createLogger("KafkaAdapter");

/**
 * Kafka Adapter
 * Implementación de IEventBus para Apache Kafka
 *
 * Características:
 * - Alta throughput
 * - Persistencia de eventos
 * - Particionamiento para escalabilidad
 * - Compaction de logs
 */
@Injectable()
export class KafkaAdapter implements IEventBus, OnModuleDestroy {
  private kafka: Kafka;
  private producer: Producer;
  private admin: Admin;
  private consumers: Map<string, Consumer> = new Map();
  private isConnected = false;

  constructor(private readonly config: KafkaConfig) {
    this.kafka = new Kafka({
      clientId: config.clientId,
      brokers: config.brokers,
      retry: {
        initialRetryTime: config.retryDelay || 300,
        retries: config.retryAttempts || 10,
      },
    });

    this.producer = this.kafka.producer({
      allowAutoTopicCreation: true,
      transactionalId: `${config.clientId}-tx`,
    });

    this.admin = this.kafka.admin();
  }

  async connect(): Promise<void> {
    if (this.isConnected) {
      logger.warn("Kafka already connected");
      return;
    }

    try {
      await this.producer.connect();
      await this.admin.connect();

      this.isConnected = true;

      logger.info("Kafka connected successfully", {
        clientId: this.config.clientId,
        brokers: this.config.brokers.join(","),
      });
    } catch (error) {
      logger.error("Failed to connect to Kafka", error as Error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await this.producer.disconnect();
      await this.admin.disconnect();

      for (const [topic, consumer] of this.consumers.entries()) {
        await consumer.disconnect();
        logger.info(`Disconnected consumer for topic: ${topic}`);
      }

      this.consumers.clear();
      this.isConnected = false;

      logger.info("Kafka disconnected successfully");
    } catch (error) {
      logger.error("Error disconnecting Kafka", error as Error);
      throw error;
    }
  }

  async publish<T = any>(topic: string, event: EventPayload<T>): Promise<void> {
    try {
      await this.producer.send({
        topic,
        messages: [
          {
            key: event.eventId || `${Date.now()}-${Math.random()}`,
            value: JSON.stringify(event),
            headers: {
              eventType: event.eventType,
              service: event.service || "unknown",
              timestamp: (event.timestamp || new Date()).toISOString(),
            },
          },
        ],
      });

      logger.debug(`Event published to Kafka topic: ${topic}`, {
        eventId: event.eventId,
        eventType: event.eventType,
      });
    } catch (error) {
      logger.error(
        `Failed to publish event to Kafka topic: ${topic}`,
        error as Error,
        {
          eventId: event.eventId,
          eventType: event.eventType,
        }
      );
      throw error;
    }
  }

  async publishBatch<T = any>(
    events: Array<{ topic: string; event: EventPayload<T> }>
  ): Promise<void> {
    try {
      // Group events by topic
      const topicMessages = events.reduce(
        (acc, { topic, event }) => {
          if (!acc[topic]) {
            acc[topic] = [];
          }
          acc[topic].push({
            key: event.eventId || `${Date.now()}-${Math.random()}`,
            value: JSON.stringify(event),
            headers: {
              eventType: event.eventType,
              service: event.service || "unknown",
              timestamp: (event.timestamp || new Date()).toISOString(),
            },
          });
          return acc;
        },
        {} as Record<string, any[]>
      );

      // Send batches
      const promises = Object.entries(topicMessages).map(([topic, messages]) =>
        this.producer.send({ topic, messages })
      );

      await Promise.all(promises);

      logger.debug(`Batch of ${events.length} events published to Kafka`);
    } catch (error) {
      logger.error("Failed to publish batch to Kafka", error as Error);
      throw error;
    }
  }

  async subscribe<T = any>(
    topic: string,
    groupId: string,
    handler: (event: EventPayload<T>) => Promise<void>
  ): Promise<void> {
    try {
      const consumer = this.kafka.consumer({
        groupId:
          groupId || this.config.groupId || `${this.config.clientId}-group`,
        sessionTimeout: 30000,
        heartbeatInterval: 3000,
      });

      await consumer.connect();
      await consumer.subscribe({ topic, fromBeginning: false });

      await consumer.run({
        eachMessage: async (payload: EachMessagePayload) => {
          try {
            const event = JSON.parse(
              payload.message.value?.toString() || "{}"
            ) as EventPayload<T>;

            logger.debug(`Event received from Kafka topic: ${topic}`, {
              eventId: event.eventId,
              eventType: event.eventType,
            });

            await handler(event);
          } catch (error) {
            logger.error(
              `Error processing message from Kafka topic: ${topic}`,
              error as Error
            );
            // Don't throw - let Kafka retry
          }
        },
      });

      this.consumers.set(topic, consumer);

      logger.info(`Subscribed to Kafka topic: ${topic}`, { groupId });
    } catch (error) {
      logger.error(
        `Failed to subscribe to Kafka topic: ${topic}`,
        error as Error
      );
      throw error;
    }
  }

  async unsubscribe(topic: string): Promise<void> {
    const consumer = this.consumers.get(topic);
    if (consumer) {
      await consumer.disconnect();
      this.consumers.delete(topic);
      logger.info(`Unsubscribed from Kafka topic: ${topic}`);
    }
  }

  async isHealthy(): Promise<boolean> {
    try {
      if (!this.isConnected) {
        return false;
      }
      await this.admin.listTopics();
      return true;
    } catch (error) {
      logger.error("Kafka health check failed", error as Error);
      return false;
    }
  }

  getBrokerType(): string {
    return "kafka";
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  /**
   * Create topic if it doesn't exist (Kafka specific)
   */
  async createTopic(
    topic: string,
    numPartitions = 3,
    replicationFactor = 1
  ): Promise<void> {
    try {
      const topics = await this.admin.listTopics();

      if (!topics.includes(topic)) {
        await this.admin.createTopics({
          topics: [
            {
              topic,
              numPartitions,
              replicationFactor,
            },
          ],
        });

        logger.info(`Kafka topic created: ${topic}`, {
          numPartitions,
          replicationFactor,
        });
      }
    } catch (error) {
      logger.error(`Failed to create Kafka topic: ${topic}`, error as Error);
      throw error;
    }
  }
}
