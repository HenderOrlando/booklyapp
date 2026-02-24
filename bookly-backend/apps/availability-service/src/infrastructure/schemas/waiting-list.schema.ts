import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type WaitingListDocument = WaitingList & Document;

/**
 * Waiting List Schema
 * Schema de MongoDB para lista de espera
 */
@Schema({
  collection: "waiting_lists",
  timestamps: true,
  versionKey: false,
})
export class WaitingList {
  @Prop({ type: Types.ObjectId, required: true })
  resourceId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  userId: Types.ObjectId;

  @Prop({ type: Date, required: true })
  requestedStartDate: Date;

  @Prop({ type: Date, required: true })
  requestedEndDate: Date;

  @Prop({ type: Number, default: 0 })
  priority: number;

  @Prop()
  purpose?: string;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: Date })
  notifiedAt?: Date;

  @Prop({ type: Date })
  expiresAt?: Date;

  @Prop({ type: Types.ObjectId })
  convertedToReservationId?: Types.ObjectId;

  @Prop({
    type: {
      createdBy: String,
      updatedBy: String,
      cancelledBy: String,
      cancelledAt: Date,
    },
    required: true,
  })
  audit: {
    createdBy: string;
    updatedBy?: string;
    cancelledBy?: string;
    cancelledAt?: Date;
  };

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const WaitingListSchema = SchemaFactory.createForClass(WaitingList);

// Índices para mejorar performance
WaitingListSchema.index({ resourceId: 1, isActive: 1, priority: -1 });
WaitingListSchema.index({ userId: 1, isActive: 1 });
WaitingListSchema.index({ expiresAt: 1, isActive: 1 });
WaitingListSchema.index({
  resourceId: 1,
  requestedStartDate: 1,
  requestedEndDate: 1,
});
