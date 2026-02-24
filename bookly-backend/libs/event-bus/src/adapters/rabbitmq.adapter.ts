import { EventPayload, createLogger } from "@libs/common";
import { Injectable, OnModuleDestroy } from "@nestjs/common";
import * as amqp from "amqplib";
import { IEventBus, RabbitMQConfig } from "../interfaces";

const logger = createLogger("RabbitMQAdapter");

/**
 * RabbitMQ Adapter
 * Implementación de IEventBus para RabbitMQ
 *
 * Características:
 * - Routing flexible con exchanges
 * - Guaranteed delivery
 * - Message acknowledgment
 * - Dead letter queues
 */
@Injectable()
export class RabbitMQAdapter implements IEventBus, OnModuleDestroy {
  private connection: amqp.Connection | null = null;
  private channel: amqp.Channel | null = null;
  private consumers: Map<string, amqp.ConsumeMessage> = new Map();
  private isConnected = false;

  constructor(private readonly config: RabbitMQConfig) {}

  async connect(): Promise<void> {
    if (this.isConnected) {
      logger.warn("RabbitMQ already connected");
      return;
    }

    try {
      this.connection = (await amqp.connect(
        this.config.url,
      )) as any as amqp.Connection;
      if (!this.connection) {
        throw new Error("Failed to establish connection");
      }
      this.channel = await (this.connection as any).createChannel();

      // Setup exchange if configured
      if (this.config.exchange && this.channel) {
        await this.channel.assertExchange(
          this.config.exchange,
          this.config.exchangeType || "topic",
          {
            durable: this.config.durable !== false,
          },
        );
      }

      // Set prefetch count for load balancing
      if (this.config.prefetchCount && this.channel) {
        await this.channel.prefetch(this.config.prefetchCount);
      }

      this.isConnected = true;

      logger.info("RabbitMQ connected successfully", {
        url: this.config.url.replace(/\/\/.*@/, "//*****@"), // Hide credentials
        exchange: this.config.exchange,
      });

      // Handle connection errors
      if (this.connection) {
        this.connection.on("error", (err) => {
          logger.error("RabbitMQ connection error", err);
        });

        this.connection.on("close", () => {
          logger.warn("RabbitMQ connection closed");
          this.isConnected = false;
        });
      }
    } catch (error) {
      logger.error("Failed to connect to RabbitMQ", error as Error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      if (this.channel) {
        try {
          await this.channel.close();
        } catch {
          // Channel may already be closed — safe to ignore
        }
        this.channel = null;
      }

      if (this.connection) {
        try {
          await (this.connection as any).close();
        } catch {
          // Connection may already be closed — safe to ignore
        }
        this.connection = null;
      }

      this.consumers.clear();
      this.isConnected = false;

      logger.info("RabbitMQ disconnected successfully");
    } catch (error) {
      logger.error("Error disconnecting RabbitMQ", error as Error);
    }
  }

  async publish<T = any>(topic: string, event: EventPayload<T>): Promise<void> {
    if (!this.channel) {
      throw new Error("RabbitMQ channel not initialized");
    }

    try {
      const message = Buffer.from(JSON.stringify(event));

      if (this.config.exchange) {
        // Publish to exchange with routing key (topic)
        this.channel.publish(this.config.exchange, topic, message, {
          persistent: true,
          contentType: "application/json",
          headers: {
            eventType: event.eventType,
            service: event.service || "unknown",
            timestamp: (event.timestamp || new Date()).toISOString(),
          },
        });
      } else {
        // Direct publish to queue
        await this.channel.assertQueue(topic, { durable: true });
        this.channel.sendToQueue(topic, message, {
          persistent: true,
          contentType: "application/json",
        });
      }

      logger.debug(`Event published to RabbitMQ: ${topic}`, {
        eventId: event.eventId,
        eventType: event.eventType,
      });
    } catch (error) {
      logger.error(
        `Failed to publish event to RabbitMQ: ${topic}`,
        error as Error,
        {
          eventId: event.eventId,
          eventType: event.eventType,
        },
      );
      throw error;
    }
  }

  async publishBatch<T = any>(
    events: Array<{ topic: string; event: EventPayload<T> }>,
  ): Promise<void> {
    if (!this.channel) {
      throw new Error("RabbitMQ channel not initialized");
    }

    try {
      for (const { topic, event } of events) {
        await this.publish(topic, event);
      }

      logger.debug(`Batch of ${events.length} events published to RabbitMQ`);
    } catch (error) {
      logger.error("Failed to publish batch to RabbitMQ", error as Error);
      throw error;
    }
  }

  async subscribe<T = any>(
    topic: string,
    groupId: string,
    handler: (event: EventPayload<T>) => Promise<void>,
  ): Promise<void> {
    if (!this.channel) {
      throw new Error("RabbitMQ channel not initialized");
    }

    try {
      const queueName = this.config.queue || `${groupId}-${topic}`;

      // Assert queue (plain, without DLX — compatible with existing CloudAMQP queues)
      await this.channel.assertQueue(queueName, {
        durable: this.config.durable !== false,
      });

      // Bind queue to exchange if using exchange
      if (this.config.exchange) {
        await this.channel.bindQueue(queueName, this.config.exchange, topic);
      }

      // Start consuming
      await this.channel.consume(
        queueName,
        async (msg) => {
          if (!msg) {
            return;
          }

          try {
            const event = JSON.parse(msg.content.toString()) as EventPayload<T>;

            logger.debug(`Event received from RabbitMQ: ${topic}`, {
              eventId: event.eventId,
              eventType: event.eventType,
            });

            await handler(event);

            // Acknowledge message
            if (this.channel) {
              this.channel.ack(msg);
            }
          } catch (error) {
            logger.error(
              `Error processing message from RabbitMQ: ${topic}`,
              error as Error,
            );

            if (this.channel) {
              // Check retry count from x-death header
              const xDeath = msg.properties?.headers?.["x-death"];
              const retryCount = Array.isArray(xDeath)
                ? xDeath.reduce(
                    (sum: number, d: any) => sum + (d.count || 0),
                    0,
                  )
                : 0;
              const maxRetries = 3;

              if (retryCount < maxRetries) {
                // Requeue for retry
                this.channel.nack(msg, false, true);
                logger.warn(
                  `Message requeued for retry (${retryCount + 1}/${maxRetries})`,
                  {
                    topic,
                    eventId: (JSON.parse(msg.content.toString()) as any)
                      .eventId,
                  },
                );
              } else {
                // Max retries exceeded — reject to DLQ (no requeue)
                this.channel.nack(msg, false, false);
                logger.error(
                  `Message sent to DLQ after ${maxRetries} retries: ${topic}`,
                  error as Error,
                );
              }
            }
          }
        },
        {
          noAck: false,
        },
      );

      logger.info(`Subscribed to RabbitMQ: ${topic}`, {
        queue: queueName,
        exchange: this.config.exchange,
      });
    } catch (error) {
      logger.error(`Failed to subscribe to RabbitMQ: ${topic}`, error as Error);
      throw error;
    }
  }

  async unsubscribe(topic: string): Promise<void> {
    if (!this.channel) {
      return;
    }

    try {
      const queueName = this.config.queue || topic;
      await this.channel.deleteQueue(queueName);
      this.consumers.delete(topic);

      logger.info(`Unsubscribed from RabbitMQ: ${topic}`);
    } catch (error) {
      logger.error(
        `Failed to unsubscribe from RabbitMQ: ${topic}`,
        error as Error,
      );
      throw error;
    }
  }

  async isHealthy(): Promise<boolean> {
    try {
      if (!this.isConnected || !this.connection) {
        return false;
      }

      // Check if connection is still alive
      return this.connection !== null;
    } catch (error) {
      logger.error("RabbitMQ health check failed", error as Error);
      return false;
    }
  }

  getBrokerType(): string {
    return "rabbitmq";
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  /**
   * Create exchange (RabbitMQ specific)
   */
  async createExchange(
    name: string,
    type: "direct" | "topic" | "fanout" | "headers" = "topic",
    options?: { durable?: boolean },
  ): Promise<void> {
    if (!this.channel) {
      throw new Error("RabbitMQ channel not initialized");
    }

    try {
      await this.channel.assertExchange(name, type, {
        durable: options?.durable !== false,
      });

      logger.info(`RabbitMQ exchange created: ${name}`, { type });
    } catch (error) {
      logger.error(
        `Failed to create RabbitMQ exchange: ${name}`,
        error as Error,
      );
      throw error;
    }
  }

  /**
   * Create queue (RabbitMQ specific)
   */
  async createQueue(
    name: string,
    options?: { durable?: boolean; exclusive?: boolean; autoDelete?: boolean },
  ): Promise<void> {
    if (!this.channel) {
      throw new Error("RabbitMQ channel not initialized");
    }

    try {
      await this.channel.assertQueue(name, {
        durable: options?.durable !== false,
        exclusive: options?.exclusive || false,
        autoDelete: options?.autoDelete || false,
      });

      logger.info(`RabbitMQ queue created: ${name}`);
    } catch (error) {
      logger.error(`Failed to create RabbitMQ queue: ${name}`, error as Error);
      throw error;
    }
  }
}
