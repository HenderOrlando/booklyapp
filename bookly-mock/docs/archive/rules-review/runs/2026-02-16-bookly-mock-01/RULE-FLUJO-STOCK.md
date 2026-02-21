# RULE-FLUJO-STOCK — Flujos de Aprobaciones y Solicitudes

> **Rule file:** `.windsurf/rules/bookly-flujos-stockpile.md`
> **Domain:** stockpile · **Trigger:** manual
> **Score: 3 / 5** · **Gate:** ⚠️ No tests

## Evidence

### Process Coverage

| Process                    | Commands/Handlers Found                                                                           |
| -------------------------- | ------------------------------------------------------------------------------------------------- |
| Create approval request    | create-approval-request                                                                           |
| Approval flow management   | create-approval-flow, update-approval-flow, deactivate-approval-flow                              |
| Step approval/rejection    | approve-step, reject-step                                                                         |
| Cancel request             | cancel-approval-request                                                                           |
| Document generation        | generate-document                                                                                 |
| Check-in/out               | check-in, check-out                                                                               |
| Notifications              | notification-event.handler                                                                        |
| Statistics                 | get-approval-statistics                                                                           |
| Queries                    | get-approval-requests, get-approval-request-by-id, get-active-today-approvals, get-approval-flows |
| Tenant notification config | tenant-notification-config.dto                                                                    |

## Gaps & Tasks

| Priority | Task                                         | Skill                   |
| -------- | -------------------------------------------- | ----------------------- |
| P0       | BDD specs for approval flow lifecycle        | `qa-calidad`            |
| P2       | Create dedicated RF rule files (RF-20→RF-28) | `gestion-datos-calidad` |
