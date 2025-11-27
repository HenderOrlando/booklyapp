import {
  ApprovalHistoryDecision,
  ApprovalRequestStatus,
} from "@libs/common/enums";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

/**
 * Approval History Item
 */
export class ApprovalHistoryItem {
  @Prop({ required: true })
  stepName: string;

  @Prop({ type: Types.ObjectId, required: true })
  approverId: Types.ObjectId;

  @Prop({ required: true, enum: ApprovalHistoryDecision })
  decision: ApprovalHistoryDecision;

  @Prop()
  comment?: string;

  @Prop({ required: true })
  approvedAt: Date;
}

/**
 * Approval Request Schema
 * Schema de MongoDB para solicitudes de aprobación
 */
@Schema({ collection: "approval_requests", timestamps: true })
export class ApprovalRequest extends Document {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  reservationId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  requesterId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, index: true })
  programId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  approvalFlowId: Types.ObjectId;

  @Prop({
    required: true,
    enum: ApprovalRequestStatus,
    default: ApprovalRequestStatus.PENDING,
    index: true,
  })
  status: ApprovalRequestStatus;

  @Prop({ required: true, default: 0 })
  currentStepIndex: number;

  @Prop({ required: true })
  submittedAt: Date;

  @Prop()
  completedAt?: Date;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop({ type: [ApprovalHistoryItem], default: [] })
  approvalHistory: ApprovalHistoryItem[];

  // Audit fields
  @Prop({ type: Types.ObjectId, required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  updatedBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  cancelledBy?: Types.ObjectId;

  @Prop()
  cancelledAt?: Date;
}

export const ApprovalRequestSchema =
  SchemaFactory.createForClass(ApprovalRequest);

// Indexes
ApprovalRequestSchema.index({ reservationId: 1 }, { unique: true });
ApprovalRequestSchema.index({ requesterId: 1, status: 1 });
ApprovalRequestSchema.index({ approvalFlowId: 1, status: 1 });
ApprovalRequestSchema.index({ status: 1, submittedAt: -1 });
ApprovalRequestSchema.index({ createdAt: -1 });
