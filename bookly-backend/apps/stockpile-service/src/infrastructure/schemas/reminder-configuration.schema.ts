import {
  NotificationChannel,
  ReminderFrequency,
  ReminderType,
} from "@libs/common/enums";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

/**
 * Reminder Configuration Schema
 * Schema de MongoDB para configuración de recordatorios
 */
@Schema({ collection: "reminder_configurations", timestamps: true })
export class ReminderConfiguration extends Document {
  @Prop({ required: true, enum: ReminderType, unique: true })
  type: ReminderType;

  @Prop({ required: true, default: true })
  enabled: boolean;

  @Prop({ required: true, type: [String], enum: NotificationChannel })
  channels: NotificationChannel[];

  @Prop({ required: true, enum: ReminderFrequency })
  frequency: ReminderFrequency;

  @Prop()
  cronExpression?: string;

  @Prop()
  triggerBeforeMinutes?: number;

  @Prop({ default: 3 })
  maxRetries: number;

  @Prop()
  messageTemplate?: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  // Timestamps automáticos
  createdAt?: Date;
  updatedAt?: Date;
}

export const ReminderConfigurationSchema = SchemaFactory.createForClass(
  ReminderConfiguration,
);

// Indexes (type already has unique index from @Prop decorator)
ReminderConfigurationSchema.index({ enabled: 1 });
ReminderConfigurationSchema.index({ frequency: 1 });
