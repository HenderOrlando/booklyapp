import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({ collection: "compliance_reports", timestamps: true })
export class ComplianceReport extends Document {
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
  totalReservations: number;

  @Prop({ required: true })
  checkedInReservations: number;

  @Prop({ required: true })
  noShowReservations: number;

  @Prop({ required: true })
  lateCheckIns: number;

  @Prop({ required: true })
  earlyCheckOuts: number;

  @Prop({ required: true })
  onTimeCheckIns: number;

  @Prop({ required: true })
  complianceRate: number;

  @Prop({ required: true })
  noShowRate: number;

  @Prop({ required: true })
  averageCheckInDelayMinutes: number;

  @Prop({
    type: [
      {
        userId: { type: Types.ObjectId, required: true },
        noShowCount: { type: Number, required: true },
      },
    ],
    default: [],
  })
  usersWithNoShow: Array<{
    userId: Types.ObjectId;
    noShowCount: number;
  }>;

  @Prop({ type: Object, default: {} })
  complianceByDayOfWeek: Record<string, number>;

  @Prop({ type: Object, default: {} })
  complianceByHour: Record<string, number>;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;
}

export const ComplianceReportSchema = SchemaFactory.createForClass(ComplianceReport);

// Indexes for better performance
ComplianceReportSchema.index({ resourceId: 1, startDate: -1 });
ComplianceReportSchema.index({ resourceType: 1, startDate: -1 });
ComplianceReportSchema.index({ startDate: -1, endDate: -1 });
ComplianceReportSchema.index({ complianceRate: -1 });
ComplianceReportSchema.index({ createdAt: -1 });
