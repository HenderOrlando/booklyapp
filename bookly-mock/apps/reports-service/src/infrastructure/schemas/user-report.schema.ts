import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export class FavoriteResource {
  @Prop({ type: Types.ObjectId, required: true })
  resourceId: Types.ObjectId;

  @Prop({ required: true })
  resourceName: string;

  @Prop({ required: true })
  usageCount: number;
}

@Schema({ collection: "user_reports", timestamps: true })
export class UserReport extends Document {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  userName: string;

  @Prop({ required: true, index: true })
  userType: string;

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
  noShowCount: number;

  @Prop({ required: true, default: 0 })
  totalHoursReserved: number;

  @Prop({ type: Object, default: {} })
  resourceTypesUsed: Record<string, number>;

  @Prop({ type: [FavoriteResource], default: [] })
  favoriteResources: FavoriteResource[];

  @Prop({ type: [String], default: [] })
  peakUsageDays: string[];

  @Prop({ required: true, default: 0 })
  averageAdvanceBooking: number;

  @Prop({ required: true, default: 0 })
  penaltiesCount: number;

  @Prop({ required: true, default: 0 })
  feedbackSubmitted: number;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const UserReportSchema = SchemaFactory.createForClass(UserReport);

UserReportSchema.index({ userId: 1, startDate: -1 });
UserReportSchema.index({ userType: 1, startDate: -1 });
UserReportSchema.index({ createdAt: -1 });
