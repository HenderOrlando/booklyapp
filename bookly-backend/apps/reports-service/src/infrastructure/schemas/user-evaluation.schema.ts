import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

/**
 * Evaluation Period
 */
export class EvaluationPeriodSchema {
  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;
}

/**
 * User Evaluation Schema
 * Schema de MongoDB para evaluaciones administrativas de usuarios (RF-35)
 */
@Schema({ collection: "user_evaluations", timestamps: true })
export class UserEvaluation extends Document {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  userName: string;

  @Prop({ required: true })
  userEmail: string;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  evaluatedBy: Types.ObjectId;

  @Prop({ required: true })
  evaluatorName: string;

  @Prop({ required: true })
  evaluatorRole: string;

  @Prop({ required: true, type: Date, index: true })
  evaluationDate: Date;

  @Prop({ required: true, min: 0, max: 100 })
  complianceScore: number;

  @Prop({ required: true, min: 0, max: 100 })
  punctualityScore: number;

  @Prop({ required: true, min: 0, max: 100 })
  resourceCareScore: number;

  @Prop({ required: true, min: 0, max: 100, index: true })
  overallScore: number;

  @Prop()
  comments?: string;

  @Prop()
  recommendations?: string;

  @Prop({ type: EvaluationPeriodSchema })
  period?: EvaluationPeriodSchema;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const UserEvaluationSchema =
  SchemaFactory.createForClass(UserEvaluation);

// Indexes
UserEvaluationSchema.index({ userId: 1, evaluationDate: -1 });
UserEvaluationSchema.index({ evaluatedBy: 1, evaluationDate: -1 });
UserEvaluationSchema.index({ overallScore: -1 });
UserEvaluationSchema.index({ evaluationDate: -1 });
UserEvaluationSchema.index({ "period.startDate": 1, "period.endDate": 1 });
