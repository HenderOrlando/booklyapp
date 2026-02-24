import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type WebhookLogDocument = WebhookLog & Document;

/**
 * WebhookLog MongoDB Schema
 * Stores webhook event processing logs for auditing
 */
@Schema({ timestamps: true, collection: "webhook_logs" })
export class WebhookLog {
  @Prop({ required: true, type: String })
  webhookId: string;

  @Prop({ required: true, type: String })
  channel: string;

  @Prop({ required: true, type: String })
  provider: string;

  @Prop({ type: String })
  eventType?: string;

  @Prop({ type: String })
  messageId?: string;

  @Prop({ default: true })
  success: boolean;

  @Prop({ type: String })
  error?: string;

  @Prop({ type: Object })
  requestBody?: Record<string, any>;

  @Prop({ type: Number, default: 200 })
  responseStatus: number;

  @Prop({ type: Number, default: 0 })
  processingTime: number;
}

export const WebhookLogSchema = SchemaFactory.createForClass(WebhookLog);

WebhookLogSchema.index({ webhookId: 1, createdAt: -1 });
WebhookLogSchema.index({ channel: 1 });
WebhookLogSchema.index({ success: 1 });
WebhookLogSchema.index({ createdAt: -1 });
