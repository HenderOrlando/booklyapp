import { UsageStatisticType } from "@libs/common/enums";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

/**
 * Most Used Resource
 */
export class MostUsedResourceSchema {
  @Prop({ type: Types.ObjectId, required: true })
  resourceId: Types.ObjectId;

  @Prop({ required: true })
  resourceName: string;

  @Prop({ required: true })
  count: number;
}

/**
 * Usage Statistic Schema
 * Schema de MongoDB para estadísticas de uso de recursos (RF-31, RF-32)
 */
@Schema({ collection: "usage_statistics", timestamps: true })
export class UsageStatistic extends Document {
  @Prop({
    required: true,
    enum: Object.values(UsageStatisticType),
    index: true,
  })
  statisticType: UsageStatisticType;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  referenceId: Types.ObjectId;

  @Prop({ required: true })
  referenceName: string;

  @Prop({ required: true, type: Date, index: true })
  periodStart: Date;

  @Prop({ required: true, type: Date, index: true })
  periodEnd: Date;

  @Prop({ required: true, default: 0 })
  totalReservations: number;

  @Prop({ required: true, default: 0 })
  confirmedReservations: number;

  @Prop({ required: true, default: 0 })
  cancelledReservations: number;

  @Prop({ required: true, default: 0 })
  completedReservations: number;

  @Prop({ required: true, default: 0 })
  totalHoursReserved: number;

  @Prop({ required: true, default: 0 })
  totalHoursUsed: number;

  @Prop({ min: 0, max: 5 })
  averageRating?: number;

  @Prop()
  uniqueUsers?: number;

  @Prop({ type: [String], default: [] })
  peakUsageTimes: string[];

  @Prop({ type: [MostUsedResourceSchema], default: [] })
  mostUsedResources: MostUsedResourceSchema[];

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const UsageStatisticSchema =
  SchemaFactory.createForClass(UsageStatistic);

// Indexes
UsageStatisticSchema.index({
  statisticType: 1,
  referenceId: 1,
  periodStart: -1,
});
UsageStatisticSchema.index({ statisticType: 1, periodStart: -1 });
UsageStatisticSchema.index({ referenceId: 1, periodEnd: -1 });
UsageStatisticSchema.index({ createdAt: -1 });
