import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type WebhookDocument = Webhook & Document;

/**
 * Webhook MongoDB Schema
 * Stores registered webhook configurations for notification providers
 */
@Schema({ timestamps: true, collection: "webhooks" })
export class Webhook {
  @Prop({ required: true, type: String })
  channel: string;

  @Prop({ required: true, type: String })
  provider: string;

  @Prop({ required: true, type: String })
  url: string;

  @Prop({ type: String })
  secret?: string;

  @Prop({ type: Object, default: {} })
  config?: Record<string, any>;

  @Prop({ default: true })
  active: boolean;

  @Prop({ default: 0 })
  totalEvents: number;

  @Prop({ default: 0 })
  successfulEvents: number;

  @Prop({ default: 0 })
  failedEvents: number;

  @Prop({ type: Date })
  lastEventAt?: Date;

  @Prop({ type: String })
  createdBy?: string;

  @Prop({ type: String })
  updatedBy?: string;
}

export const WebhookSchema = SchemaFactory.createForClass(Webhook);

WebhookSchema.index({ channel: 1, provider: 1 });
WebhookSchema.index({ active: 1 });
