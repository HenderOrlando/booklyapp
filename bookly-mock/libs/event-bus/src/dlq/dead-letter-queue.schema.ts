import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type DeadLetterQueueDocument = DeadLetterQueue & Document;

export enum DLQStatus {
  PENDING = "pending",
  RETRYING = "retrying",
  FAILED = "failed",
  RESOLVED = "resolved",
}

/**
 * Dead Letter Queue Schema
 * Almacena eventos que fallaron durante el procesamiento
 * para su posterior retry o análisis
 */
@Schema({ collection: "dead_letter_queue", timestamps: true })
export class DeadLetterQueue {
  @Prop({ required: true, unique: true })
  id: string;

  @Prop({ type: Object, required: true })
  originalEvent: any;

  @Prop({ required: true })
  error: string;

  @Prop()
  errorStack?: string;

  @Prop({ default: 0 })
  attemptCount: number;

  @Prop({ default: 3 })
  maxAttempts: number;

  @Prop()
  nextRetryAt?: Date;

  @Prop({ type: String, enum: DLQStatus, default: DLQStatus.PENDING })
  status: DLQStatus;

  @Prop({ required: true })
  topic: string;

  @Prop()
  service?: string;

  @Prop()
  eventType?: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop()
  resolvedAt?: Date;

  @Prop()
  resolvedBy?: string;

  @Prop()
  resolution?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const DeadLetterQueueSchema =
  SchemaFactory.createForClass(DeadLetterQueue);

// Índices para optimizar queries
DeadLetterQueueSchema.index({ status: 1, nextRetryAt: 1 });
DeadLetterQueueSchema.index({ topic: 1, status: 1 });
DeadLetterQueueSchema.index({ eventType: 1, status: 1 });
DeadLetterQueueSchema.index({ service: 1, status: 1 });
DeadLetterQueueSchema.index({ createdAt: -1 });
