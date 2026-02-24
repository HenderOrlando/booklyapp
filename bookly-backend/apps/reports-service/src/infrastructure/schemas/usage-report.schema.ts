import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({ collection: "usage_reports", timestamps: true })
export class UsageReport extends Document {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  resourceId: Types.ObjectId;

  @Prop({ required: true })
  resourceName: string;

  @Prop({ required: true, index: true })
  resourceType: string;

  @Prop({ required: true, index: true })
  startDate: Date;

  @Prop({ required: true, index: true })
  endDate: Date;

  @Prop({ required: true, default: 0 })
  totalReservations: number;

  @Prop({ required: true, default: 0 })
  confirmedReservations: number;

  @Prop({ required: true, default: 0 })
  cancelledReservations: number;

  @Prop({ required: true, default: 0 })
  noShowReservations: number;

  @Prop({ required: true, default: 0 })
  totalHoursReserved: number;

  @Prop({ required: true, default: 0 })
  totalHoursUsed: number;

  @Prop({ required: true, default: 0 })
  occupancyRate: number;

  @Prop({ required: true, default: 0 })
  averageSessionDuration: number;

  @Prop({ type: [String], default: [] })
  peakUsageHours: string[];

  @Prop({ type: Object, default: {} })
  programsBreakdown: Record<string, number>;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const UsageReportSchema = SchemaFactory.createForClass(UsageReport);

UsageReportSchema.index({ resourceId: 1, startDate: -1 });
UsageReportSchema.index({ resourceType: 1, startDate: -1 });
UsageReportSchema.index({ createdAt: -1 });
