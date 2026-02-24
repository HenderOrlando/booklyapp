import { createLogger, EventPayload } from "@libs/common";
import { Injectable, OnModuleInit } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import {
  DeadLetterQueue,
  DeadLetterQueueDocument,
  DLQStatus,
} from "./dead-letter-queue.schema";
import {
  ExponentialBackoffStrategy,
  IRetryStrategy,
} from "./retry-strategy.interface";

const logger = createLogger("DeadLetterQueueService");

export interface DLQStats {
  total: number;
  pending: number;
  retrying: number;
  failed: number;
  resolved: number;
  byTopic: Record<string, number>;
  byService: Record<string, number>;
  byEventType: Record<string, number>;
}

export interface DLQFilter {
  status?: DLQStatus;
  topic?: string;
  service?: string;
  eventType?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}

/**
 * Dead Letter Queue Service
 * Gestiona eventos fallidos con retry automático
 *
 * Características:
 * - Almacenamiento de eventos fallidos
 * - Retry automático con estrategias configurables
 * - Queries con filtros
 * - Estadísticas y monitoreo
 */
@Injectable()
export class DeadLetterQueueService implements OnModuleInit {
  private retryStrategy: IRetryStrategy;
  private retryIntervalMs = 30000; // Check cada 30 segundos
  private retryIntervalId?: NodeJS.Timeout;
  private isProcessing = false;

  constructor(
    @InjectModel(DeadLetterQueue.name)
    private dlqModel: Model<DeadLetterQueueDocument>,
  ) {
    // Default: Exponential backoff (1s, 2s, 4s, 8s, ...)
    this.retryStrategy = new ExponentialBackoffStrategy(1000, 60000, 2);
  }

  async onModuleInit() {
    // Iniciar con retraso el auto-retry para dar tiempo a MongoDB a conectarse
    setTimeout(() => {
      this.checkAndStartAutoRetry();
    }, 5000);
  }

  private async checkAndStartAutoRetry() {
    try {
      if (this.dlqModel?.db?.readyState === 1) { // 1 = connected
        // Hacer un query real para verificar autenticación
        await this.dlqModel.countDocuments().limit(1).exec();
        this.startAutoRetry();
        logger.info("DLQ Service initialized with auto-retry enabled");
      } else {
        logger.warn(
          `DLQ Service initialized without auto-retry (MongoDB connection state: ${this.dlqModel?.db?.readyState})`,
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (errorMessage.includes("authentication")) {
        logger.warn(
          "DLQ Service initialized without auto-retry (MongoDB authentication required)",
          {
            error: errorMessage,
          },
        );
      } else {
        logger.warn(
          "DLQ Service initialized without auto-retry (MongoDB not available)",
          {
            error: errorMessage,
          },
        );
      }
    }
  }

  /**
   * Agregar evento a DLQ
   */
  async addToDLQ(
    event: EventPayload,
    topic: string,
    error: Error,
    maxAttempts: number = 3,
  ): Promise<DeadLetterQueue> {
    const dlqEvent = await this.dlqModel.create({
      id: uuidv4(),
      originalEvent: event,
      error: error.message,
      errorStack: error.stack,
      attemptCount: 0,
      maxAttempts,
      nextRetryAt: this.retryStrategy.calculateNextRetry(0),
      status: DLQStatus.PENDING,
      topic,
      service: event.service,
      eventType: event.eventType,
      metadata: {
        eventId: event.eventId,
        timestamp: event.timestamp,
        correlationId: (event as any).correlationId,
      },
    });

    logger.warn("Event added to DLQ", {
      dlqId: dlqEvent.id,
      topic,
      eventType: event.eventType,
      error: error.message,
    });

    return dlqEvent.toObject();
  }

  /**
   * Obtener eventos listos para retry
   */
  async getEventsForRetry(): Promise<DeadLetterQueue[]> {
    const now = new Date();

    return this.dlqModel
      .find({
        status: { $in: [DLQStatus.PENDING, DLQStatus.RETRYING] },
        nextRetryAt: { $lte: now },
      })
      .sort({ nextRetryAt: 1 })
      .limit(100)
      .lean()
      .exec();
  }

  /**
   * Marcar evento como en retry
   */
  async markAsRetrying(dlqId: string): Promise<void> {
    await this.dlqModel.updateOne(
      { id: dlqId },
      {
        $set: { status: DLQStatus.RETRYING },
        $inc: { attemptCount: 1 },
      },
    );
  }

  /**
   * Marcar retry como exitoso
   */
  async markRetrySuccess(dlqId: string, resolution?: string): Promise<void> {
    await this.dlqModel.updateOne(
      { id: dlqId },
      {
        $set: {
          status: DLQStatus.RESOLVED,
          resolvedAt: new Date(),
          resolution: resolution || "Retry successful",
        },
      },
    );

    logger.info("Event resolved from DLQ", { dlqId });
  }

  /**
   * Marcar retry como fallido
   */
  async markRetryFailure(dlqId: string, error: Error): Promise<void> {
    const dlqEvent = await this.dlqModel.findOne({ id: dlqId }).exec();

    if (!dlqEvent) return;

    const shouldRetry = this.retryStrategy.shouldRetry(dlqEvent);

    if (shouldRetry) {
      // Programar siguiente retry
      const nextRetryAt = this.retryStrategy.calculateNextRetry(
        dlqEvent.attemptCount,
      );

      await this.dlqModel.updateOne(
        { id: dlqId },
        {
          $set: {
            status: DLQStatus.PENDING,
            nextRetryAt,
            error: error.message,
            errorStack: error.stack,
          },
        },
      );

      logger.warn("Event retry failed, will retry again", {
        dlqId,
        attemptCount: dlqEvent.attemptCount,
        nextRetryAt,
      });
    } else {
      // Máximo de intentos alcanzado
      await this.dlqModel.updateOne(
        { id: dlqId },
        {
          $set: {
            status: DLQStatus.FAILED,
            error: error.message,
            errorStack: error.stack,
          },
        },
      );

      logger.error(
        `Event permanently failed after max retries: ${dlqId} (${dlqEvent.attemptCount}/${dlqEvent.maxAttempts})`,
        error,
      );
    }
  }

  /**
   * Reintentar manualmente un evento
   */
  async retryManually(dlqId: string): Promise<DeadLetterQueue> {
    const dlqEvent = await this.dlqModel.findOne({ id: dlqId }).exec();

    if (!dlqEvent) {
      throw new Error(`DLQ event not found: ${dlqId}`);
    }

    // Reset retry state
    dlqEvent.status = DLQStatus.PENDING;
    dlqEvent.nextRetryAt = new Date();
    dlqEvent.attemptCount = 0;

    await dlqEvent.save();

    logger.info("Manual retry triggered", { dlqId });

    return dlqEvent.toObject();
  }

  /**
   * Resolver manualmente un evento (sin retry)
   */
  async resolveManually(
    dlqId: string,
    resolvedBy: string,
    resolution: string,
  ): Promise<DeadLetterQueue> {
    const dlqEvent = await this.dlqModel
      .findOneAndUpdate(
        { id: dlqId },
        {
          $set: {
            status: DLQStatus.RESOLVED,
            resolvedAt: new Date(),
            resolvedBy,
            resolution,
          },
        },
        { new: true },
      )
      .exec();

    if (!dlqEvent) {
      throw new Error(`DLQ event not found: ${dlqId}`);
    }

    logger.info("Event resolved manually", { dlqId, resolvedBy });

    return dlqEvent.toObject();
  }

  /**
   * Eliminar evento de DLQ
   */
  async remove(dlqId: string): Promise<void> {
    await this.dlqModel.deleteOne({ id: dlqId }).exec();
    logger.info("Event removed from DLQ", { dlqId });
  }

  /**
   * Obtener estadísticas de DLQ
   */
  async getStats(): Promise<DLQStats> {
    const [statusCounts, topicCounts, serviceCounts, eventTypeCounts] =
      await Promise.all([
        this.dlqModel
          .aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }])
          .exec(),
        this.dlqModel
          .aggregate([{ $group: { _id: "$topic", count: { $sum: 1 } } }])
          .exec(),
        this.dlqModel
          .aggregate([{ $group: { _id: "$service", count: { $sum: 1 } } }])
          .exec(),
        this.dlqModel
          .aggregate([{ $group: { _id: "$eventType", count: { $sum: 1 } } }])
          .exec(),
      ]);

    const statusMap = statusCounts.reduce(
      (acc, item) => {
        acc[item._id] = item.count;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      total: (Object.values(statusMap) as number[]).reduce(
        (sum, count) => sum + count,
        0,
      ),
      pending: statusMap[DLQStatus.PENDING] || 0,
      retrying: statusMap[DLQStatus.RETRYING] || 0,
      failed: statusMap[DLQStatus.FAILED] || 0,
      resolved: statusMap[DLQStatus.RESOLVED] || 0,
      byTopic: topicCounts.reduce(
        (acc, item) => {
          acc[item._id] = item.count;
          return acc;
        },
        {} as Record<string, number>,
      ),
      byService: serviceCounts.reduce(
        (acc, item) => {
          acc[item._id || "unknown"] = item.count;
          return acc;
        },
        {} as Record<string, number>,
      ),
      byEventType: eventTypeCounts.reduce(
        (acc, item) => {
          acc[item._id || "unknown"] = item.count;
          return acc;
        },
        {} as Record<string, number>,
      ),
    };
  }

  /**
   * Buscar eventos en DLQ con filtros
   */
  async find(filter: DLQFilter): Promise<DeadLetterQueue[]> {
    const query: any = {};

    if (filter.status) {
      query.status = filter.status;
    }

    if (filter.topic) {
      query.topic = filter.topic;
    }

    if (filter.service) {
      query.service = filter.service;
    }

    if (filter.eventType) {
      query.eventType = filter.eventType;
    }

    if (filter.startDate || filter.endDate) {
      query.createdAt = {};
      if (filter.startDate) query.createdAt.$gte = filter.startDate;
      if (filter.endDate) query.createdAt.$lte = filter.endDate;
    }

    return this.dlqModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(filter.limit || 100)
      .lean()
      .exec();
  }

  /**
   * Obtener evento por ID
   */
  async findById(dlqId: string): Promise<DeadLetterQueue | null> {
    return this.dlqModel.findOne({ id: dlqId }).lean().exec();
  }

  /**
   * Iniciar procesamiento automático de retry
   */
  private startAutoRetry(): void {
    if (this.retryIntervalId) {
      return;
    }

    this.retryIntervalId = setInterval(() => {
      this.processRetries().catch((error) => {
        logger.error("Error in auto-retry processing", error);
      });
    }, this.retryIntervalMs);
  }

  /**
   * Detener procesamiento automático de retry
   */
  stopAutoRetry(): void {
    if (this.retryIntervalId) {
      clearInterval(this.retryIntervalId);
      this.retryIntervalId = undefined;
      logger.info("Auto-retry stopped");
    }
  }

  /**
   * Procesar eventos listos para retry
   * Este método es llamado por el event bus adapter
   */
  async processRetries(): Promise<void> {
    if (this.isProcessing) {
      return; // Evitar procesamiento concurrente
    }

    this.isProcessing = true;

    try {
      const events = await this.getEventsForRetry();

      if (events.length > 0) {
        logger.info(`Processing ${events.length} events for retry`);
      }

      // Los eventos serán procesados por el adapter que llame a este servicio
      // El adapter debe:
      // 1. Llamar markAsRetrying(dlqId)
      // 2. Intentar republish del evento
      // 3. Llamar markRetrySuccess o markRetryFailure según el resultado
    } catch (error) {
      // Si es un error de autenticación de MongoDB, detener auto-retry
      if (error instanceof Error && error.message.includes("authentication")) {
        logger.warn(
          "MongoDB authentication error detected, stopping auto-retry",
          {
            error: error.message,
          },
        );
        this.stopAutoRetry();
      }
      throw error;
    } finally {
      this.isProcessing = false;
    }
  }
}
