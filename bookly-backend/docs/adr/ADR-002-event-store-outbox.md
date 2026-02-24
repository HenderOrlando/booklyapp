# ADR-002: Event Store with Persistence and Traceability

## Status

**Accepted** — February 17, 2026

## Context

Bookly uses Event-Driven Architecture (EDA) with RabbitMQ for inter-service communication. Previously:

1. **Event Store was disabled** — `ENABLE_EVENT_STORE` was not set in `.env`, so events were published to RabbitMQ but never persisted to MongoDB.
2. **No traceability** — Events lacked `correlationId`, `causationId`, and `idempotencyKey` fields, making it impossible to trace request flows across services.
3. **No deduplication** — No mechanism to prevent duplicate event processing by consumers.

## Decision

Enable the Event Store globally and enhance the schema for full traceability and deduplication.

### Implementation

1. **Enable Event Store**: Set `ENABLE_EVENT_STORE=true` in `.env`. All services using `EventBusModule.forRootAsync()` will now persist events to the `event_store` MongoDB collection.

2. **Enhanced EventStore Schema** (`libs/event-bus/src/event-store/event-store.schema.ts`):
   - `correlationId` (indexed) — Traces a request across services
   - `causationId` (indexed) — Links event to the event that caused it
   - `idempotencyKey` (unique sparse index) — Prevents duplicate event storage

3. **EventBusService Enhancement** (`libs/event-bus/src/event-bus.service.ts`):
   - `toStoredEvent()` now extracts `correlationId`, `causationId`, `idempotencyKey` from event metadata and stores them as top-level fields.

4. **Outbox Pattern** (deferred):
   - The current architecture uses "publish after write" which has a small window where the DB write succeeds but the publish fails. The Event Store + DLQ (ADR-003) provide sufficient guarantees for the current use case (educational reservation system, R1 risk tier). A full outbox pattern can be added later if needed.

## Consequences

### Positive

- All domain events are now persisted and queryable.
- Full request traceability via `correlationId` chains.
- Deduplication support via `idempotencyKey` unique index.
- Event replay capability for debugging and projections.

### Negative

- Additional MongoDB write per event (mitigated by async nature of event store saves).
- Storage growth over time (needs retention policy — not yet implemented).

## Files Changed

- `.env` — Added `ENABLE_EVENT_STORE=true`
- `libs/event-bus/src/event-store/event-store.schema.ts` — Added `correlationId`, `causationId`, `idempotencyKey` fields + indexes
- `libs/event-bus/src/event-bus.service.ts` — Enhanced `toStoredEvent()` to propagate tracing fields
