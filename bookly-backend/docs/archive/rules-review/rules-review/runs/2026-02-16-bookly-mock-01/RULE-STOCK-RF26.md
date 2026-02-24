# RULE-STOCK-RF26 — Check-in/Check-out digital

> **Rule file:** `bookly-stockpile-rf26-checkin-checkout-digital.md`
> **Domain:** stockpile-service
> **Score:** 3 / 5

---

## Evidence

| Artifact               | Path                                                                               |
| ---------------------- | ---------------------------------------------------------------------------------- |
| Command — check-in     | `apps/stockpile-service/src/application/commands/check-in.command.ts`              |
| Command — check-out    | `apps/stockpile-service/src/application/commands/check-out.command.ts`             |
| Handler — check-in     | `apps/stockpile-service/src/application/handlers/check-in.handler.ts`              |
| Handler — check-out    | `apps/stockpile-service/src/application/handlers/check-out.handler.ts`             |
| Service — check-in/out | `apps/stockpile-service/src/application/services/check-in-out.service.ts`          |
| Service — QR code      | `apps/stockpile-service/src/application/services/qr-code.service.ts`               |
| Service — geolocation  | `apps/stockpile-service/src/application/services/geolocation.service.ts`           |
| Entity                 | `apps/stockpile-service/src/domain/entities/check-in-out.entity.ts`                |
| Client — availability  | `apps/stockpile-service/src/infrastructure/clients/availability-service.client.ts` |
| Client — auth          | `apps/stockpile-service/src/infrastructure/clients/auth-service.client.ts`         |

### Key implementation details

- `CheckInHandler` implements full check-in flow:
  - Duplicate check-in prevention.
  - QR token validation and invalidation after use.
  - Cross-service reservation lookup via `AvailabilityServiceClient`.
  - Geolocation proximity validation via `GeolocationService`.
  - User data enrichment from `AuthServiceClient`.
  - Status tracking: `CHECKED_IN` → `CHECKED_OUT`.
  - Event published: `CHECK_IN_COMPLETED`.
- `CheckInOutEntity` tracks: `reservationId`, `resourceId`, `userId`, `checkInTime`, `checkOutTime`, `checkInType`, `expectedReturnTime`, `resourceCondition`, `metadata` (QR, location).

---

## AC Coverage

| #   | Acceptance Criteria             | Status | Notes                                               |
| --- | ------------------------------- | ------ | --------------------------------------------------- |
| 1   | Digital check-in                | ✅     | `CheckInCommand` + handler                          |
| 2   | Digital check-out               | ✅     | `CheckOutCommand` + handler                         |
| 3   | QR code validation              | ✅     | `QRCodeService.validateQRToken()` with invalidation |
| 4   | Geolocation validation          | ✅     | `GeolocationService.validateProximity()`            |
| 5   | Duplicate prevention            | ✅     | Existing check-in lookup before creation            |
| 6   | Cross-service reservation check | ✅     | `AvailabilityServiceClient.getReservationById()`    |
| 7   | Event-driven status tracking    | ✅     | `CHECK_IN_COMPLETED` event published                |

---

## Gaps

1. **No BDD tests** — 0 spec files.

---

## Improvement Tasks

| #   | Task                                                     | Priority |
| --- | -------------------------------------------------------- | -------- |
| 1   | Write BDD specs: `check-in.spec.ts`, `check-out.spec.ts` | P0       |
