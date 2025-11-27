import { createLogger } from "@libs/common";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {
  AggregateSnapshot,
  EventReplayFilter,
  IEventStore,
  StoredEvent,
} from "../interfaces";
import {
  EventStore,
  AggregateSnapshot as SnapshotDocument,
} from "./event-store.schema";

const logger = createLogger("EventStoreService");

/**
 * Event Store Service
 * Implementación de almacenamiento de eventos con MongoDB
 *
 * Características:
 * - Almacenamiento inmutable de eventos
 * - Snapshots para optimización
 * - Event replay
 * - Queries optimizados
 */
@Injectable()
export class EventStoreService implements IEventStore {
  constructor(
    @InjectModel(EventStore.name) private eventModel: Model<EventStore>,
    @InjectModel(SnapshotDocument.name)
    private snapshotModel: Model<SnapshotDocument>
  ) {}

  async saveEvent<T = any>(event: StoredEvent<T>): Promise<void> {
    await this.eventModel.create(event);
    logger.debug("Event saved", {
      eventId: event.eventId,
      aggregateId: event.aggregateId,
    });
  }

  async saveEvents<T = any>(events: StoredEvent<T>[]): Promise<void> {
    await this.eventModel.insertMany(events);
    logger.debug(`${events.length} events saved`);
  }

  async getEventsByAggregate(
    aggregateId: string,
    aggregateType: string
  ): Promise<StoredEvent[]> {
    return this.eventModel
      .find({ aggregateId, aggregateType })
      .sort({ version: 1 })
      .lean()
      .exec();
  }

  async getEventsByAggregateFromVersion(
    aggregateId: string,
    aggregateType: string,
    fromVersion: number
  ): Promise<StoredEvent[]> {
    return this.eventModel
      .find({ aggregateId, aggregateType, version: { $gte: fromVersion } })
      .sort({ version: 1 })
      .lean()
      .exec();
  }

  async getEventsByType(
    eventType: string,
    limit?: number
  ): Promise<StoredEvent[]> {
    const query = this.eventModel.find({ eventType }).sort({ timestamp: -1 });
    if (limit) {
      query.limit(limit);
    }
    return query.lean().exec();
  }

  async getEventsByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<StoredEvent[]> {
    return this.eventModel
      .find({ timestamp: { $gte: startDate, $lte: endDate } })
      .sort({ timestamp: 1 })
      .lean()
      .exec();
  }

  async saveSnapshot(snapshot: AggregateSnapshot): Promise<void> {
    await this.snapshotModel.findOneAndUpdate(
      {
        aggregateId: snapshot.aggregateId,
        aggregateType: snapshot.aggregateType,
      },
      snapshot,
      { upsert: true, new: true }
    );
    logger.debug("Snapshot saved", {
      aggregateId: snapshot.aggregateId,
      version: snapshot.version,
    });
  }

  async getLatestSnapshot(
    aggregateId: string,
    aggregateType: string
  ): Promise<AggregateSnapshot | null> {
    return this.snapshotModel
      .findOne({ aggregateId, aggregateType })
      .sort({ version: -1 })
      .lean()
      .exec();
  }

  async replayEvents(
    handler: (event: StoredEvent) => Promise<void>,
    filter?: EventReplayFilter
  ): Promise<void> {
    const query: any = {};

    if (filter?.startDate || filter?.endDate) {
      query.timestamp = {};
      if (filter.startDate) query.timestamp.$gte = filter.startDate;
      if (filter.endDate) query.timestamp.$lte = filter.endDate;
    }

    if (filter?.eventTypes?.length) {
      query.eventType = { $in: filter.eventTypes };
    }

    if (filter?.aggregateTypes?.length) {
      query.aggregateType = { $in: filter.aggregateTypes };
    }

    if (filter?.aggregateIds?.length) {
      query.aggregateId = { $in: filter.aggregateIds };
    }

    if (filter?.services?.length) {
      query.service = { $in: filter.services };
    }

    const cursor = this.eventModel.find(query).sort({ timestamp: 1 }).cursor();

    for await (const event of cursor) {
      await handler(event.toObject());
    }

    logger.info("Event replay completed", { filter });
  }
}
