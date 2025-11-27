import { EventPayload } from "@libs/common";
import { createLogger } from "@libs/common";
import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Admin, Consumer, EachMessagePayload, Kafka, Producer } from "kafkajs";
import { KafkaModuleOptions } from "./kafka.module";

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private producer: Producer;
  private admin: Admin;
  private consumers: Map<string, Consumer> = new Map();
  private readonly logger = createLogger("KafkaService");

  constructor(
    @Inject("KAFKA_OPTIONS") private options: KafkaModuleOptions,
    private configService: ConfigService
  ) {}

  async onModuleInit() {
    try {
      const brokers =
        this.options.brokers ||
        this.configService
          .get<string>("KAFKA_BROKER", "localhost:9092")
          .split(",");

      const clientId =
        this.options.clientId ||
        this.configService.get<string>("KAFKA_CLIENT_ID", "bookly-mock");

      this.kafka = new Kafka({
        clientId,
        brokers,
        retry: {
          initialRetryTime: 300,
          retries: 10,
        },
      });

      this.producer = this.kafka.producer({
        allowAutoTopicCreation: true,
        transactionalId: `${clientId}-transactional`,
      });

      this.admin = this.kafka.admin();

      await this.producer.connect();
      await this.admin.connect();

      this.logger.info("Kafka connected successfully", {
        clientId,
        brokers: brokers.join(","),
      });
    } catch (error) {
      this.logger.error("Failed to connect to Kafka", error as Error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.producer.disconnect();
      await this.admin.disconnect();

      for (const [topic, consumer] of this.consumers.entries()) {
        await consumer.disconnect();
        this.logger.info(`Disconnected consumer for topic: ${topic}`);
      }

      this.logger.info("Kafka disconnected successfully");
    } catch (error) {
      this.logger.error("Error disconnecting Kafka", error as Error);
    }
  }

  /**
   * Publish event to Kafka topic
   */
  async publish<T = any>(topic: string, event: EventPayload<T>): Promise<void> {
    try {
      await this.producer.send({
        topic,
        messages: [
          {
            key: event.eventId,
            value: JSON.stringify(event),
            headers: {
              eventType: event.eventType,
              service: event.service,
              timestamp: event.timestamp.toISOString(),
            },
          },
        ],
      });

      this.logger.debug(`Event published to topic: ${topic}`, {
        eventId: event.eventId,
        eventType: event.eventType,
      });
    } catch (error) {
      this.logger.error(
        `Failed to publish event to topic: ${topic}`,
        error as Error,
        {
          eventId: event.eventId,
          eventType: event.eventType,
        }
      );
      throw error;
    }
  }

  /**
   * Subscribe to Kafka topic
   */
  async subscribe<T = any>(
    topic: string,
    groupId: string,
    handler: (event: EventPayload<T>) => Promise<void>
  ): Promise<void> {
    try {
      const consumer = this.kafka.consumer({
        groupId,
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

            this.logger.debug(`Event received from topic: ${topic}`, {
              eventId: event.eventId,
              eventType: event.eventType,
            });

            await handler(event);
          } catch (error) {
            this.logger.error(
              `Error processing message from topic: ${topic}`,
              error as Error
            );
          }
        },
      });

      this.consumers.set(topic, consumer);

      this.logger.info(`Subscribed to topic: ${topic}`, { groupId });
    } catch (error) {
      this.logger.error(
        `Failed to subscribe to topic: ${topic}`,
        error as Error
      );
      throw error;
    }
  }

  /**
   * Create topic if it doesn't exist
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

        this.logger.info(`Topic created: ${topic}`, {
          numPartitions,
          replicationFactor,
        });
      } else {
        this.logger.debug(`Topic already exists: ${topic}`);
      }
    } catch (error) {
      this.logger.error(`Failed to create topic: ${topic}`, error as Error);
      throw error;
    }
  }

  /**
   * Delete topic
   */
  async deleteTopic(topic: string): Promise<void> {
    try {
      await this.admin.deleteTopics({
        topics: [topic],
      });

      this.logger.info(`Topic deleted: ${topic}`);
    } catch (error) {
      this.logger.error(`Failed to delete topic: ${topic}`, error as Error);
      throw error;
    }
  }

  /**
   * Get topic metadata
   */
  async getTopicMetadata(topics?: string[]): Promise<any> {
    try {
      const metadata = await this.admin.fetchTopicMetadata(
        topics ? { topics } : undefined
      );
      return metadata;
    } catch (error) {
      this.logger.error("Failed to fetch topic metadata", error as Error);
      throw error;
    }
  }

  /**
   * Check if Kafka is healthy
   */
  async isHealthy(): Promise<boolean> {
    try {
      await this.admin.listTopics();
      return true;
    } catch (error) {
      this.logger.error("Kafka health check failed", error as Error);
      return false;
    }
  }
}
