# ADR-003: Dead Letter Queue Policy for RabbitMQ Events

## Status

**Accepted** — February 17, 2026

## Context

Bookly uses RabbitMQ as its event broker (topic exchange). Previously, when a consumer failed to process a message, the adapter called `nack(msg, false, true)` which requeued the message infinitely. This created:

1. **Poison message loops** — A malformed or unprocessable event would be retried forever.
2. **No visibility** — Failed events were invisible; no way to inspect or manually resolve them.
3. **No backoff** — Retries happened immediately without delay, potentially overwhelming the consumer.

The `DeadLetterQueueService` and `DeadLetterQueue` schema already existed in `@libs/event-bus` but were never wired into the RabbitMQ adapter.

## Decision

Wire Dead Letter Exchanges (DLX) into every RabbitMQ queue subscription with a bounded retry policy.

### Implementation

1. **DLX per queue** (`libs/event-bus/src/adapters/rabbitmq.adapter.ts`):
   - Each queue gets a companion DLQ: `{queueName}.dlq`
   - DLX exchange: `{exchange}.dlx` (topic type, durable)
   - Main queue configured with `x-dead-letter-exchange` and `x-dead-letter-routing-key`

2. **Retry policy**:
   - **Max retries**: 3 (configurable)
   - Retry count tracked via RabbitMQ `x-death` headers
   - Retries 1-3: `nack(msg, false, true)` — requeue
   - After 3 retries: `nack(msg, false, false)` — reject to DLQ via DLX

3. **DLQ operations** (existing `DeadLetterQueueService`):
   - `getStats()` — DLQ statistics by status/topic/service
   - `retryManually(dlqId)` — Reset and reprocess
   - `resolveManually(dlqId, resolvedBy, resolution)` — Mark as resolved
   - Auto-retry processor (30s interval) for pending events

4. **DLQ admin endpoint** (existing `DLQController` in api-gateway):
   - `GET /dlq` — List DLQ entries
   - `GET /dlq/stats` — DLQ statistics
   - `POST /dlq/:id/retry` — Manual retry
   - `POST /dlq/:id/resolve` — Manual resolution
   - `DELETE /dlq/:id` — Remove entry

### Runbook

```
# Inspect DLQ
curl http://localhost:3000/dlq/stats -H "Authorization: Bearer $TOKEN"

# List failed events
curl http://localhost:3000/dlq?status=FAILED -H "Authorization: Bearer $TOKEN"

# Retry a specific event
curl -X POST http://localhost:3000/dlq/{dlqId}/retry -H "Authorization: Bearer $TOKEN"

# Manually resolve (e.g., data was fixed externally)
curl -X POST http://localhost:3000/dlq/{dlqId}/resolve \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"resolvedBy":"admin","resolution":"Data corrected manually"}'
```

## Consequences

### Positive

- Poison messages stop after 3 retries instead of looping forever.
- Failed events are visible and queryable in the DLQ collection.
- Manual retry/resolve operations available via admin API.
- Each queue gets its own DLQ for isolated debugging.

### Negative

- Existing queues in RabbitMQ may need to be recreated if `x-dead-letter-exchange` argument conflicts with existing queue configuration (CloudAMQP may reject `assertQueue` with different arguments).
- Retry count relies on `x-death` headers which are only populated after the first DLX routing.

### Mitigation

- For CloudAMQP: If queue recreation fails, the adapter gracefully falls back to the old behavior (requeue without DLX). Queue recreation can be done manually via RabbitMQ management UI.

## Files Changed

- `libs/event-bus/src/adapters/rabbitmq.adapter.ts` — DLX setup + retry counting + bounded retries
