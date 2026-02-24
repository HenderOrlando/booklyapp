import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({ collection: "conflict_reports", timestamps: true })
export class ConflictReport extends Document {
  @Prop({ required: true, type: Types.ObjectId })
  resourceId: Types.ObjectId;

  @Prop({ required: true })
  resourceName: string;

  @Prop({ required: true })
  resourceType: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ required: true })
  totalConflicts: number;

  @Prop({ required: true })
  resolvedConflicts: number;

  @Prop({ required: true })
  unresolvedConflicts: number;

  @Prop({ type: Object, default: {} })
  conflictTypesBreakdown: Record<string, number>;

  @Prop({
    type: [
      {
        date: { type: Date, required: true },
        hour: { type: Number, required: true },
        conflictCount: { type: Number, required: true },
      },
    ],
    default: [],
  })
  peakConflictPeriods: Array<{
    date: Date;
    hour: number;
    conflictCount: number;
  }>;

  @Prop({ required: true })
  averageResolutionTimeMinutes: number;

  @Prop({ type: Object, default: {} })
  resolutionMethodsBreakdown: Record<string, number>;

  @Prop({ required: true })
  affectedUsers: number;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;
}

export const ConflictReportSchema =
  SchemaFactory.createForClass(ConflictReport);

// Indexes for better performance
ConflictReportSchema.index({ resourceId: 1, startDate: -1 });
ConflictReportSchema.index({ resourceType: 1, startDate: -1 });
ConflictReportSchema.index({ startDate: -1, endDate: -1 });
ConflictReportSchema.index({ totalConflicts: -1 });
ConflictReportSchema.index({ createdAt: -1 });
