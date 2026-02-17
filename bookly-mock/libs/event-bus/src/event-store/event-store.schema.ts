import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

/**
 * Event Store Schema
 * Almacenamiento inmutable de eventos para Event Sourcing
 */
@Schema({
  collection: "event_store",
  timestamps: true,
})
export class EventStore extends Document {
  @Prop({ required: true, unique: true, index: true })
  eventId: string;

  @Prop({ required: true, index: true })
  eventType: string;

  @Prop({ required: true, index: true })
  aggregateId: string;

  @Prop({ required: true, index: true })
  aggregateType: string;

  @Prop({ required: true })
  version: number;

  @Prop({ type: Object, required: true })
  data: any;

  @Prop({ index: true })
  correlationId?: string;

  @Prop({ index: true })
  causationId?: string;

  @Prop({ index: true, sparse: true })
  idempotencyKey?: string;

  @Prop({ type: Object })
  metadata?: {
    userId?: string;
    tenantId?: string;
    [key: string]: any;
  };

  @Prop({ required: true, index: true })
  timestamp: Date;

  @Prop({ required: true, index: true })
  service: string;
}

export const EventStoreSchema = SchemaFactory.createForClass(EventStore);

// Indexes for performance
EventStoreSchema.index({ aggregateId: 1, version: 1 }, { unique: true });
EventStoreSchema.index({ aggregateType: 1, aggregateId: 1 });
EventStoreSchema.index({ eventType: 1, timestamp: -1 });
EventStoreSchema.index({ correlationId: 1 });
EventStoreSchema.index({ causationId: 1 });
EventStoreSchema.index({ idempotencyKey: 1 }, { unique: true, sparse: true });

/**
 * Snapshot Schema
 * Snapshots de agregados para optimización
 */
@Schema({
  collection: "aggregate_snapshots",
  timestamps: true,
})
export class AggregateSnapshot extends Document {
  @Prop({ required: true, index: true })
  aggregateId: string;

  @Prop({ required: true, index: true })
  aggregateType: string;

  @Prop({ required: true })
  version: number;

  @Prop({ type: Object, required: true })
  state: any;

  @Prop({ required: true })
  timestamp: Date;
}

export const AggregateSnapshotSchema =
  SchemaFactory.createForClass(AggregateSnapshot);

// Only keep latest snapshot per aggregate
AggregateSnapshotSchema.index(
  { aggregateId: 1, aggregateType: 1, version: -1 },
  { unique: true },
);
