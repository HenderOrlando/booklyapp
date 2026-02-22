# Bookly Frontend — Component & Page Index

> Generated: 2026-02-16 | Run: mock-frontend-01

## Atoms (Design System Base)

| Component        | Path                                     | Tests | DS Tokens |
| ---------------- | ---------------------------------------- | ----- | --------- |
| Button           | `src/components/atoms/Button/`           | ✅ 8  | ✅        |
| Input            | `src/components/atoms/Input/`            | ✅ 8  | ✅        |
| Badge            | `src/components/atoms/Badge/`            | ✅ 9  | ✅        |
| Alert            | `src/components/atoms/Alert/`            | ✅ 8  | ✅        |
| Toast            | `src/components/atoms/Toast.tsx`         | —     | ✅ Fixed  |
| NotificationBell | `src/components/atoms/NotificationBell/` | ✅ 5  | ✅        |
| Card             | `src/components/atoms/Card/`             | —     | ✅        |
| Skeleton         | `src/components/atoms/Skeleton/`         | —     | ✅        |

## Organisms (Feature Components)

| Component               | RF    | Path                                                | Tests |
| ----------------------- | ----- | --------------------------------------------------- | ----- |
| FeedbackModal           | RF-34 | `src/components/organisms/FeedbackModal/`           | ✅ 8  |
| NotificationInbox       | RF-22 | `src/components/organisms/NotificationInbox/`       | ✅ 8  |
| DynamicAttributeEditor  | RF-03 | `src/components/organisms/DynamicAttributeEditor/`  | ✅ 7  |
| MultiResourceSelector   | RF-19 | `src/components/organisms/MultiResourceSelector/`   | ✅ 8  |
| AvailabilityRulesEditor | RF-05 | `src/components/organisms/AvailabilityRulesEditor/` | ✅ 7  |
| ReminderConfigModal     | RF-29 | `src/components/organisms/ReminderConfigModal/`     | ✅ 9  |
| ImportResourcesModal    | RF-04 | `src/components/organisms/ImportResourcesModal/`    | ✅ 8  |
| WebSocketToastBridge    | RF-30 | `src/components/organisms/WebSocketToastBridge/`    | —     |
| AppSidebar              | —     | `src/components/organisms/AppSidebar/`              | —     |
| ToastContainer          | —     | `src/components/organisms/ToastContainer.tsx`       | —     |

## Auth Components

| Component      | RF    | Path                                     | Tests |
| -------------- | ----- | ---------------------------------------- | ----- |
| PermissionGate | RF-42 | `src/components/auth/PermissionGate.tsx` | ✅ 8  |

## Pages (App Router)

| Page                       | RF    | Path                                              | Unit Test | E2E |
| -------------------------- | ----- | ------------------------------------------------- | --------- | --- |
| Dashboard                  | —     | `src/app/[locale]/dashboard/`                     | —         | —   |
| Login                      | —     | `src/app/[locale]/login/`                         | —         | ✅  |
| Recursos                   | RF-01 | `src/app/[locale]/recursos/`                      | —         | ✅  |
| Recursos Nuevo             | RF-01 | `src/app/[locale]/recursos/nuevo/`                | —         | ✅  |
| Recurso Historial          | RF-11 | `src/app/[locale]/recursos/[id]/historial/`       | ✅ 2      | —   |
| Reservas                   | RF-12 | `src/app/[locale]/reservas/`                      | —         | ✅  |
| Reservas Reasignación      | RF-15 | `src/app/[locale]/reservas/reasignacion/`         | ✅ 2      | —   |
| Calendario                 | RF-10 | `src/app/[locale]/calendario/`                    | —         | ✅  |
| Aprobaciones               | RF-20 | `src/app/[locale]/aprobaciones/`                  | —         | —   |
| Admin Auditoría            | RF-44 | `src/app/[locale]/admin/auditoria/`               | ✅ 2      | ✅  |
| Admin Roles                | RF-41 | `src/app/[locale]/admin/roles/`                   | —         | ✅  |
| Admin Flujos Aprobación    | RF-13 | `src/app/[locale]/admin/flujos-aprobacion/`       | ✅ 2      | ✅  |
| Admin Integraciones        | RF-08 | `src/app/[locale]/admin/integraciones/`           | ✅ 2      | ✅  |
| Admin Horarios             | RF-07 | `src/app/[locale]/admin/horarios/`                | ✅ 2      | —   |
| Admin Canales Notificación | RF-27 | `src/app/[locale]/admin/canales-notificacion/`    | ✅ 2      | —   |
| Admin Evaluaciones         | RF-35 | `src/app/[locale]/admin/evaluaciones/`            | ✅ 2      | ✅  |
| Reportes Dashboard         | RF-31 | `src/app/[locale]/reportes/`                      | —         | ✅  |
| Reportes Demanda           | RF-37 | `src/app/[locale]/reportes/demanda-insatisfecha/` | ✅ 2      | ✅  |
| Reportes Cumplimiento      | RF-39 | `src/app/[locale]/reportes/cumplimiento/`         | ✅ 2      | ✅  |
| Reportes Conflictos        | RF-38 | `src/app/[locale]/reportes/conflictos/`           | ✅ 2      | ✅  |
| Profile/Seguridad          | RF-45 | `src/app/[locale]/profile/`                       | ✅ 2      | —   |

## Hooks

| Hook               | RF    | Path                              |
| ------------------ | ----- | --------------------------------- |
| useToast           | RF-30 | `src/hooks/useToast.ts`           |
| useWebSocketToasts | RF-30 | `src/hooks/useWebSocketToasts.ts` |
| useWebSocket       | RF-30 | `src/hooks/useWebSocket.ts`       |
| useCurrentUser     | —     | `src/hooks/useCurrentUser.ts`     |

## Infrastructure

| Module            | Path                                                 | Purpose                          |
| ----------------- | ---------------------------------------------------- | -------------------------------- |
| httpClient        | `src/infrastructure/http/httpClient.ts`              | HTTP client with service routing |
| WebSocketClient   | `src/infrastructure/websocket/ws-client.ts`          | WS client with reconnection      |
| WebSocketProvider | `src/infrastructure/websocket/WebSocketProvider.tsx` | React context for WS             |
| ws-events         | `src/infrastructure/websocket/ws-events.ts`          | Typed WS event definitions       |
| MockService       | `src/infrastructure/mock/mockService.ts`             | Mock data service for dev mode   |

## Backend Endpoint Map (httpClient routing)

| Frontend path pattern  | Backend service             | Controller                       |
| ---------------------- | --------------------------- | -------------------------------- |
| `/auth/*`              | auth-service (3001)         | Various auth controllers         |
| `/users/*`, `/roles/*` | auth-service (3001)         | Users, Roles controllers         |
| `/resources/*`         | resources-service (3002)    | Resources controller             |
| `/categories/*`        | resources-service (3002)    | Categories controller            |
| `/programs/*`          | resources-service (3002)    | Programs controller              |
| `/reservations/*`      | availability-service (3003) | Reservations controller          |
| `/history/*`           | availability-service (3003) | History controller               |
| `/reassignments/*`     | availability-service (3003) | Reassignment controller          |
| `/waitlist/*`          | availability-service (3003) | WaitingLists controller          |
| `/approvals/*`         | stockpile-service (3004)    | ApprovalRequests controller      |
| `/approval-flows/*`    | stockpile-service (3004)    | ApprovalFlows controller         |
| `/documents/*`         | stockpile-service (3004)    | Document controller              |
| `/check-in-out/*`      | stockpile-service (3004)    | CheckInOut controller            |
| `/reports/*`           | reports-service (3005)      | Various report controllers       |
| `/audit/*`             | reports-service (3005)      | AuditRecords controller          |
| `/feedback/*`          | reports-service (3005)      | Feedback controller              |
| `/evaluations/*`       | reports-service (3005)      | Evaluation controller            |
| `/notifications/*`     | reports-service (3005)      | Various notification controllers |
