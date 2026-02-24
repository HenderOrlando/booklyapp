import { AuditAction, AuditStatus } from "@libs/common/enums";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type AuditLogDocument = AuditLog & Document;

/**
 * AuditLog MongoDB Schema
 * Registra todas las acciones de auditoría del sistema
 */
@Schema({ timestamps: true, collection: "audit_logs" })
export class AuditLog {
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

  @Prop({ required: true })
  method: string;

  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  ip: string;

  @Prop()
  userAgent: string;

  @Prop({
    required: true,
    enum: AuditStatus,
    default: AuditStatus.SUCCESS,
    index: true,
  })
  status: string;

  @Prop({ type: Number })
  executionTime?: number;

  @Prop({ type: Object })
  changes?: Record<string, any>;

  @Prop()
  error?: string;

  @Prop({ type: Date, default: Date.now, index: true })
  timestamp: Date;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

// Indexes compuestos para queries comunes
AuditLogSchema.index({ userId: 1, timestamp: -1 });
AuditLogSchema.index({ resource: 1, action: 1, timestamp: -1 });
AuditLogSchema.index({ status: 1, timestamp: -1 });
AuditLogSchema.index({ action: 1, status: 1 });
