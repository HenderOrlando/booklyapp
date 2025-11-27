import {
  UnsatisfiedDemandPriority,
  UnsatisfiedDemandReason,
  UnsatisfiedDemandStatus,
} from "@libs/common/enums";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

/**
 * Alternative Resource
 */
export class AlternativeResourceSchema {
  @Prop({ type: Types.ObjectId, required: true })
  resourceId: Types.ObjectId;

  @Prop({ required: true })
  resourceName: string;

  @Prop({ required: true, type: Date })
  availableDate: Date;
}

/**
 * Unsatisfied Demand Schema
 * Schema de MongoDB para demanda insatisfecha de recursos (RF-37)
 */
@Schema({ collection: "unsatisfied_demands", timestamps: true })
export class UnsatisfiedDemand extends Document {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  resourceId: Types.ObjectId;

  @Prop({ required: true })
  resourceName: string;

  @Prop({ required: true, index: true })
  resourceType: string;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  requestedBy: Types.ObjectId;

  @Prop({ required: true })
  requesterName: string;

  @Prop({ required: true })
  requesterEmail: string;

  @Prop({ required: true, type: Date, index: true })
  requestedDate: Date;

  @Prop({ required: true, type: Date })
  requestedStartTime: Date;

  @Prop({ required: true, type: Date })
  requestedEndTime: Date;

  @Prop({ required: true })
  duration: number;

  @Prop({
    required: true,
    enum: Object.values(UnsatisfiedDemandReason),
    index: true,
  })
  reason: UnsatisfiedDemandReason;

  @Prop({
    required: true,
    enum: Object.values(UnsatisfiedDemandPriority),
    index: true,
  })
  priority: UnsatisfiedDemandPriority;

  @Prop({
    required: true,
    enum: Object.values(UnsatisfiedDemandStatus),
    index: true,
    default: UnsatisfiedDemandStatus.PENDING,
  })
  status: UnsatisfiedDemandStatus;

  @Prop()
  reasonDetails?: string;

  @Prop({ type: Types.ObjectId, index: true })
  programId?: Types.ObjectId;

  @Prop()
  program?: string; // Nombre del programa (cache para reportes)

  @Prop({ type: [AlternativeResourceSchema], default: [] })
  alternatives: AlternativeResourceSchema[];

  @Prop({ type: Date })
  resolvedAt?: Date;

  @Prop({ type: Types.ObjectId })
  resolvedBy?: Types.ObjectId;

  @Prop()
  resolutionNotes?: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const UnsatisfiedDemandSchema =
  SchemaFactory.createForClass(UnsatisfiedDemand);

// Indexes
UnsatisfiedDemandSchema.index({ resourceId: 1, requestedDate: -1 });
UnsatisfiedDemandSchema.index({ requestedBy: 1, createdAt: -1 });
UnsatisfiedDemandSchema.index({ status: 1, priority: -1 });
UnsatisfiedDemandSchema.index({ reason: 1, status: 1 });
UnsatisfiedDemandSchema.index({ requestedDate: -1 });
UnsatisfiedDemandSchema.index({ createdAt: -1 });
