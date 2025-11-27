import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export class PeakDemandPeriod {
  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  hour: number;

  @Prop({ required: true })
  denialCount: number;
}

@Schema({ collection: "demand_reports", timestamps: true })
export class DemandReport extends Document {
  @Prop({ required: true, index: true })
  resourceType: string;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  programId: Types.ObjectId;

  @Prop({ required: true, index: true })
  startDate: Date;

  @Prop({ required: true, index: true })
  endDate: Date;

  @Prop({ required: true, default: 0 })
  totalDenials: number;

  @Prop({ type: Object, default: {} })
  reasonsBreakdown: Record<string, number>;

  @Prop({ type: [PeakDemandPeriod], default: [] })
  peakDemandPeriods: PeakDemandPeriod[];

  @Prop({ type: Object, default: {} })
  alternativeResourcesSuggested: Record<string, number>;

  @Prop({ required: true, default: 0 })
  waitingListEntries: number;

  @Prop({ required: true, default: 0 })
  averageWaitTime: number;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const DemandReportSchema = SchemaFactory.createForClass(DemandReport);

DemandReportSchema.index({ resourceType: 1, startDate: -1 });
DemandReportSchema.index({ programId: 1, startDate: -1 });
DemandReportSchema.index({ createdAt: -1 });
