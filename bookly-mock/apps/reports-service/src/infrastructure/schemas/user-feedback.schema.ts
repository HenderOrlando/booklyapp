import { FeedbackCategory, FeedbackStatus } from "@libs/common/enums";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

/**
 * User Feedback Schema
 * Schema de MongoDB para feedback de usuarios sobre reservas (RF-34)
 */
@Schema({ collection: "user_feedbacks", timestamps: true })
export class UserFeedback extends Document {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  userName: string;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  reservationId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  resourceId: Types.ObjectId;

  @Prop({ required: true })
  resourceName: string;

  @Prop({ required: true, min: 1, max: 5, index: true })
  rating: number;

  @Prop({
    type: String,
    enum: Object.values(FeedbackStatus),
    default: FeedbackStatus.PENDING,
    index: true,
  })
  status: FeedbackStatus;

  @Prop()
  comments?: string;

  @Prop({ type: Date, default: Date.now, index: true })
  feedbackDate: Date;

  @Prop({
    type: String,
    enum: Object.values(FeedbackCategory),
    index: true,
  })
  category?: FeedbackCategory;

  @Prop({ default: false })
  isAnonymous: boolean;

  @Prop()
  response?: string;

  @Prop({ type: Types.ObjectId })
  respondedBy?: Types.ObjectId;

  @Prop({ type: Date })
  respondedAt?: Date;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const UserFeedbackSchema = SchemaFactory.createForClass(UserFeedback);

// Indexes
UserFeedbackSchema.index({ userId: 1, createdAt: -1 });
UserFeedbackSchema.index({ resourceId: 1, rating: -1 });
UserFeedbackSchema.index({ reservationId: 1 });
UserFeedbackSchema.index({ feedbackDate: -1 });
UserFeedbackSchema.index({ category: 1, rating: -1 });
UserFeedbackSchema.index({ status: 1, createdAt: -1 });
UserFeedbackSchema.index({ resourceId: 1, status: 1 });
