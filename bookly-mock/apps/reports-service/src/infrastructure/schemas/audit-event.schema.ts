import { AuditAction, AuditStatus } from "@libs/common/enums";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type AuditEventDocument = AuditEvent & Document;

/**
 * AuditEvent Schema para Reports Service
 * Almacena eventos de auditoría procesados desde Kafka
 */
@Schema({ timestamps: true, collection: "audit_events" })
export class AuditEvent {
  @Prop({ required: true, unique: true, index: true })
  eventId: string;

  @Prop({ required: true, index: true })
  auditLogId: string;

  @Prop({ required: true, index: true })
  userId: string;

  @Prop({
    required: true,
    enum: AuditAction,
    index: true,
  })
  action: string;

  @Prop({ required: true, index: true })
  resource: string;

  @Prop({
    required: true,
    enum: AuditStatus,
    index: true,
  })
  status: string;

  @Prop({ type: Date, required: true, index: true })
  eventTimestamp: Date;

  @Prop()
  ip?: string;

  @Prop()
  error?: string;

  @Prop({ default: false, index: true })
  alerted: boolean;

  @Prop({ type: Date })
  alertedAt?: Date;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop({ type: Date, default: Date.now })
  processedAt: Date;
}

export const AuditEventSchema = SchemaFactory.createForClass(AuditEvent);

// Índices compuestos para análisis
AuditEventSchema.index({ userId: 1, eventTimestamp: -1 });
AuditEventSchema.index({ resource: 1, action: 1, eventTimestamp: -1 });
AuditEventSchema.index({ status: 1, eventTimestamp: -1 });
AuditEventSchema.index({ alerted: 1, status: 1 });
