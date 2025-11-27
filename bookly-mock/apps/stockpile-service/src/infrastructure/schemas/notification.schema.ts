import {
  NotificationChannel,
  NotificationStatus,
  NotificationType,
} from "@libs/common/enums";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

/**
 * Notification Attachment
 */
export class NotificationAttachmentSchema {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  type: string;
}

/**
 * Audit Info
 */
export class NotificationAuditSchema {
  @Prop({ type: Types.ObjectId, required: true })
  createdBy: Types.ObjectId;
}

/**
 * Notification Schema
 * Schema de MongoDB para notificaciones (RF-22, RF-28)
 */
@Schema({ collection: "notifications", timestamps: true })
export class Notification extends Document {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  recipientId: Types.ObjectId;

  @Prop({ required: true })
  recipientName: string;

  @Prop({
    required: true,
    enum: Object.values(NotificationType),
    index: true,
  })
  type: NotificationType;

  @Prop({
    required: true,
    enum: Object.values(NotificationChannel),
    index: true,
  })
  channel: NotificationChannel;

  @Prop({ required: true })
  subject: string;

  @Prop({ required: true })
  message: string;

  @Prop({
    required: true,
    enum: Object.values(NotificationStatus),
    default: NotificationStatus.PENDING,
    index: true,
  })
  status: NotificationStatus;

  @Prop({ required: true, index: true })
  relatedEntity: string;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  relatedEntityId: Types.ObjectId;

  @Prop({ type: Date })
  sentAt?: Date;

  @Prop({ type: Date })
  readAt?: Date;

  @Prop()
  failedReason?: string;

  @Prop({ default: 0 })
  retryCount: number;

  @Prop({ type: [NotificationAttachmentSchema], default: [] })
  attachments: NotificationAttachmentSchema[];

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop({ type: NotificationAuditSchema })
  audit?: NotificationAuditSchema;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// Indexes
NotificationSchema.index({ recipientId: 1, createdAt: -1 });
NotificationSchema.index({ status: 1, createdAt: -1 });
NotificationSchema.index({ relatedEntity: 1, relatedEntityId: 1 });
NotificationSchema.index({ type: 1, status: 1 });
NotificationSchema.index({ channel: 1, status: 1 });
NotificationSchema.index({ sentAt: -1 });
NotificationSchema.index({ createdAt: -1 });
