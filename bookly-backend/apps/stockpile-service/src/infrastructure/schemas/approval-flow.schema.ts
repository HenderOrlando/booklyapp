import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

/**
 * Approval Step
 */
export class ApprovalStepSchema {
  @Prop({ required: true })
  name: string;

  @Prop({ type: [String], required: true })
  approverRoles: string[];

  @Prop({ required: true })
  order: number;

  @Prop({ required: true, default: true })
  isRequired: boolean;

  @Prop({ required: true, default: false })
  allowParallel: boolean;

  @Prop({ type: Number })
  timeoutHours?: number;
}

/**
 * Approval Flow Schema
 * Schema de MongoDB para flujos de aprobación
 */
@Schema({ collection: "approval_flows", timestamps: true })
export class ApprovalFlow extends Document {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: [String], required: true })
  resourceTypes: string[];

  @Prop({ type: [ApprovalStepSchema], required: true })
  steps: ApprovalStepSchema[];

  @Prop({ required: true, default: true })
  isActive: boolean;

  @Prop({ type: Object })
  autoApproveConditions?: Record<string, any>;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  // Audit fields
  @Prop({ type: Types.ObjectId, required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  updatedBy?: Types.ObjectId;
}

export const ApprovalFlowSchema = SchemaFactory.createForClass(ApprovalFlow);

// Indexes (name already has unique index from @Prop decorator)
ApprovalFlowSchema.index({ isActive: 1 });
ApprovalFlowSchema.index({ resourceTypes: 1 });
ApprovalFlowSchema.index({ createdAt: -1 });
