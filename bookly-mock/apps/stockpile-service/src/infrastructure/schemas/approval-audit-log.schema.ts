import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { ApprovalAuditLogActionType } from "../../domain/entities/approval-audit-log.entity";

/**
 * Change Item Schema
 */
export class ChangeItem {
  @Prop({ required: true })
  field: string;

  @Prop({ type: Object })
  oldValue: any;

  @Prop({ type: Object })
  newValue: any;
}

/**
 * Approval Audit Log Schema
 * Schema de MongoDB para logs de auditoría de aprobaciones
 */
@Schema({ collection: "approval_audit_logs", timestamps: true })
export class ApprovalAuditLog extends Document {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  approvalRequestId: Types.ObjectId;

  @Prop({ required: true, enum: ApprovalAuditLogActionType, index: true })
  action: ApprovalAuditLogActionType;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  actorId: Types.ObjectId;

  @Prop({ required: true })
  actorRole: string;

  @Prop({ required: true, index: true })
  timestamp: Date;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop({ type: [ChangeItem] })
  changes?: ChangeItem[];

  // Timestamps automáticos
  createdAt?: Date;
}

export const ApprovalAuditLogSchema =
  SchemaFactory.createForClass(ApprovalAuditLog);

// Indexes para optimización de consultas
ApprovalAuditLogSchema.index({ approvalRequestId: 1, timestamp: -1 });
ApprovalAuditLogSchema.index({ actorId: 1, timestamp: -1 });
ApprovalAuditLogSchema.index({ action: 1, timestamp: -1 });
ApprovalAuditLogSchema.index({ timestamp: -1 });
ApprovalAuditLogSchema.index({ "metadata.stepName": 1 });

// TTL index para auto-eliminar logs antiguos (opcional, 2 años)
ApprovalAuditLogSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 63072000 }
);
