import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

/**
 * Dashboard Metric Schema
 * Schema de Mongoose para métricas del dashboard
 */
@Schema({ collection: "dashboard_metrics", timestamps: true })
export class DashboardMetric extends Document {
  @Prop({
    required: true,
    enum: ["OVERVIEW", "OCCUPANCY", "TRENDS", "COMPARISON"],
    index: true,
  })
  metricType: string;

  @Prop({
    required: true,
    enum: ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"],
    index: true,
  })
  period: string;

  @Prop({ required: true, type: Date, index: true })
  date: Date;

  @Prop({ required: true, type: Object })
  data: Record<string, any>;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const DashboardMetricSchema =
  SchemaFactory.createForClass(DashboardMetric);

// Índice compuesto para búsquedas eficientes
DashboardMetricSchema.index({ metricType: 1, period: 1, date: -1 });
