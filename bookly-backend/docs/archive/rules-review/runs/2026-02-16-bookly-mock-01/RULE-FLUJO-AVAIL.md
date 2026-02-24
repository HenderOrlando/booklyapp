# RULE-FLUJO-AVAIL — Flujos de Disponibilidad y Reservas

> **Rule file:** `.windsurf/rules/bookly-flujos-availability.md`
> **Domain:** availability · **Trigger:** manual
> **Score: 3 / 5** · **Gate:** ⚠️ No tests

## Evidence

### Process Coverage

| Process                   | Commands Found                                    |
| ------------------------- | ------------------------------------------------- |
| Availability inquiry      | Query handlers for availability                   |
| Reservation request       | create-reservation                                |
| Conflict validation       | Availability checks in handler                    |
| Modification/cancellation | update-reservation, cancel-reservation            |
| Recurring reservations    | create-recurring-reservation, cancel-recurring-\* |
| Waiting list              | add-to-waiting-list                               |
| Reassignment              | request-reassignment, respond-reassignment        |
| Check-in/out              | check-in-reservation, check-out-reservation       |
| Maintenance blocks        | create/cancel/complete-maintenance-block          |

## Gaps & Tasks

| Priority | Task                                 | Skill        |
| -------- | ------------------------------------ | ------------ |
| P0       | BDD specs for core reservation flows | `qa-calidad` |
