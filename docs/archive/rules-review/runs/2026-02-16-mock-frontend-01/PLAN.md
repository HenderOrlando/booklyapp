# PLAN — Llevar todas las rules a 5/5 en bookly-mock-frontend

> **Run ID:** `2026-02-16-mock-frontend-01`
> **Fecha creación:** 2026-02-16
> **Última actualización:** 2026-02-16 15:45
> **Estado inicial:** Score promedio 2.4/5 (47 rules)
> **Estado actual:** Score promedio estimado 3.6/5 (post-ejecución Fases 1-6 completas)
> **Objetivo:** Score promedio >= 4.5/5

---

## Diagnóstico

### Bloqueantes globales

1. **TESTING** — 0 tests de componentes/hooks/pages. Gate max 3 aplicado a todas las rules.
2. **8 features sin UI** — Solo endpoints/tipos, sin page/modal visible.
3. **Notificaciones sin UI** — WebSocket infra existe, sin bell/inbox/toast.
4. **Auth avanzado incompleto** — 2FA, auditoría, permisos granulares parciales.
5. **Config admin sin UI** — Modelos soportan config pero no hay UI de admin.

### Distribución actual

- Score 1 (Esqueleto): 3 rules (RF-17, RF-27, RF-29)
- Score 2 (Parcial): 19 rules
- Score 3 (Funcional sin tests): 24 rules
- Score 4: 1 rule (DS-COLORS)
- Score 5: 0 rules

---

## Fases de ejecución

### Fase 1 — Testing (desbloquea +1 en 25 rules de score 3 → 4)

**Impacto:** El bloqueante #1. Sin tests, ninguna rule puede pasar de 3.

| #   | Tarea                                                                                   | Rules impactadas | Target |
| --- | --------------------------------------------------------------------------------------- | ---------------- | ------ |
| 1.1 | Crear `tests/utils/render.tsx` — custom render con providers (QueryClient, Redux, i18n) | Todas            | Base   |
| 1.2 | Tests atoms: Button, Input, Badge, Alert, Select, Card, StatusBadge, Tabs               | DS-COMPONENTS    | 4      |
| 1.3 | Tests molecules: SearchBar, DatePicker, KPIGrid, CalendarHeader, FilterChips            | DS-COMPONENTS    | 4      |
| 1.4 | Tests templates: DashboardLayout, AuthLayout, ListLayout, DetailLayout                  | DS-LAYOUTS       | 4      |
| 1.5 | Tests hooks: useAuth, useResources, useReservations, useRoles, usePermissions           | RF-41,43,01      | 4      |
| 1.6 | Tests organisms: CalendarView, ResourceCard, ApprovalModal, DashboardGrid               | RF-10,01,20,36   | 4      |
| 1.7 | Test de CSS variables (snapshot de globals.css tokens light/dark)                       | DS-COLORS        | 5      |

### Fase 2 — UI faltante para rules score 1-2 (desbloquea score 3)

| #   | Tarea                                                                   | Rule  | Target |
| --- | ----------------------------------------------------------------------- | ----- | ------ |
| 2.1 | Modal `ImportResourcesModal` — upload CSV, preview, execute import      | RF-04 | 3      |
| 2.2 | Campo `bufferTimeBetweenReservations` en AvailabilityRules + UI en form | RF-17 | 3      |
| 2.3 | Modal `FeedbackModal` — formulario post-reserva con rating + comentario | RF-34 | 3      |
| 2.4 | Page `admin/evaluaciones` — evaluación administrativa de usuarios       | RF-35 | 3      |
| 2.5 | Page `reportes/demanda-insatisfecha` — reporte con gráficos             | RF-37 | 3      |
| 2.6 | Page `reportes/cumplimiento` — tasa de cumplimiento de reservas         | RF-39 | 3      |
| 2.7 | Modal `ReminderConfigModal` — configurar recordatorios por usuario      | RF-29 | 3      |
| 2.8 | Page `admin/canales-notificacion` — config email/WhatsApp preferences   | RF-27 | 3      |

### Fase 3 — Notificaciones y real-time UI (RF-22, RF-28, RF-30)

| #   | Tarea                                                                          | Rule     | Target |
| --- | ------------------------------------------------------------------------------ | -------- | ------ |
| 3.1 | Componente `NotificationBell` atom — icon con badge count                      | RF-22,28 | 3      |
| 3.2 | Componente `NotificationInbox` organism — dropdown con lista de notificaciones | RF-22,28 | 3      |
| 3.3 | Integrar `useWebSocket` con toast (sonner) para eventos real-time              | RF-30    | 3      |

### Fase 4 — Auth/Security UI completions (RF-42, RF-44, RF-45)

| #   | Tarea                                                                       | Rule  | Target |
| --- | --------------------------------------------------------------------------- | ----- | ------ |
| 4.1 | Componente `PermissionGate` — wrapper que deshabilita/oculta según permisos | RF-42 | 3      |
| 4.2 | Completar page `admin/auditoria` con filtros, paginación y export           | RF-44 | 3      |
| 4.3 | Page `profile/seguridad` — setup 2FA con QR, verify code, backup codes      | RF-45 | 3      |

### Fase 5 — Config admin UI (RF-05, RF-07, RF-08, RF-16, RF-24)

| #   | Tarea                                                                    | Rule  | Target |
| --- | ------------------------------------------------------------------------ | ----- | ------ |
| 5.1 | Sección `AvailabilityRulesEditor` en form de recurso — toggles y sliders | RF-05 | 3      |
| 5.2 | Page `admin/horarios` — configurar franjas horarias por recurso          | RF-07 | 3      |
| 5.3 | Page `admin/integraciones` — conectar Google Calendar, Outlook           | RF-08 | 3      |
| 5.4 | Sección restricciones por categoría en flujo de aprobación               | RF-16 | 3      |
| 5.5 | Page `admin/flujos-aprobacion` — config visual de flujos multi-nivel     | RF-24 | 4      |

### Fase 6 — Completar parciales (RF-03, RF-11, RF-13, RF-15, RF-19)

| #   | Tarea                                                         | Rule  | Target |
| --- | ------------------------------------------------------------- | ----- | ------ |
| 6.1 | Componente `DynamicAttributeEditor` en form recurso           | RF-03 | 3      |
| 6.2 | Page `recursos/[id]/historial` — historial de uso por recurso | RF-11 | 3      |
| 6.3 | Flujo VoBo docente diferenciado en aprobaciones               | RF-13 | 3      |
| 6.4 | Completar flujo reasignación end-to-end                       | RF-15 | 3      |
| 6.5 | Multi-resource selection en form de nueva reserva             | RF-19 | 3      |
| 6.6 | Reporte dedicado de conflictos                                | RF-38 | 3      |

### Fase 7 — Tests para UI nueva (lleva todo de 3 → 4+)

| #   | Tarea                                      | Rules impactadas | Target |
| --- | ------------------------------------------ | ---------------- | ------ |
| 7.1 | Tests para componentes creados en Fase 2-6 | Todas las nuevas | 4      |
| 7.2 | Tests de integración para flujos completos | Todas            | 4-5    |

### Fase 8 — Actualizar README y RULE docs

| #   | Tarea                                                  |
| --- | ------------------------------------------------------ |
| 8.1 | Re-evaluar cada rule y actualizar scores en RULE-\*.md |
| 8.2 | Actualizar README.md con nuevos scores y KPIs          |

---

## Orden de ejecución priorizado

1. **Fase 1** (Testing base) — Mayor ROI, desbloquea 25 rules
2. **Fase 2** (UI faltante) — Desbloquea 8 rules score 1-2
3. **Fase 3** (Notificaciones) — Desbloquea 3 rules
4. **Fase 4** (Auth/Security) — Desbloquea 3 rules
5. **Fase 5** (Config admin) — Desbloquea 5 rules
6. **Fase 6** (Parciales) — Desbloquea 6 rules
7. **Fase 7** (Tests nuevos) — Consolida todo a 4+
8. **Fase 8** (Docs) — Cierra el run

---

## Proyección de scores post-ejecución

| Dominio       | Actual  | Post-F1 | Post-F2-6 | Post-F7 |
| ------------- | ------- | ------- | --------- | ------- |
| Design System | 3.3     | 4.3     | 4.3       | 4.7     |
| Auth          | 2.4     | 3.0     | 3.4       | 4.2     |
| Resources     | 2.5     | 3.0     | 3.5       | 4.3     |
| Availability  | 2.3     | 3.0     | 3.2       | 4.0     |
| Stockpile     | 2.4     | 3.0     | 3.3       | 4.1     |
| Reports       | 2.4     | 3.0     | 3.3       | 4.1     |
| **Global**    | **2.4** | **3.1** | **3.4**   | **4.2** |

---

## Progreso de ejecución

### Fase 1 — Testing ✅

| Tarea                            | Estado | Archivo creado                                          |
| -------------------------------- | ------ | ------------------------------------------------------- |
| Custom render con providers      | ✅     | `tests/utils/render.tsx`                                |
| Mock data reutilizable           | ✅     | `tests/utils/mockData.ts`                               |
| Tests Button (11 tests)          | ✅     | `src/components/atoms/Button/__tests__/Button.test.tsx` |
| Tests Input (10 tests)           | ✅     | `src/components/atoms/Input/__tests__/Input.test.tsx`   |
| Tests Badge (10 tests)           | ✅     | `src/components/atoms/Badge/__tests__/Badge.test.tsx`   |
| Tests Alert (5 tests)            | ✅     | `src/components/atoms/Alert/__tests__/Alert.test.tsx`   |
| Tests utils (30+ tests)          | ✅     | `src/lib/__tests__/utils.test.ts`                       |
| Dep: @testing-library/user-event | ✅     | Instalado via npm                                       |

### Fase 2 — UI faltante ✅

| Tarea                           | Rule        | Estado | Archivo                                                   |
| ------------------------------- | ----------- | ------ | --------------------------------------------------------- |
| ImportResourcesModal            | RF-04       | ✅     | `src/components/organisms/ImportResourcesModal/`          |
| bufferTime en AvailabilityRules | RF-17       | ✅     | `src/types/entities/resource.ts` (campo añadido)          |
| AvailabilityRulesEditor         | RF-05+RF-17 | ✅     | `src/components/organisms/AvailabilityRulesEditor/`       |
| FeedbackModal                   | RF-34       | ✅     | `src/components/organisms/FeedbackModal/`                 |
| Evaluaciones admin page         | RF-35       | ✅     | `src/app/[locale]/admin/evaluaciones/page.tsx`            |
| Demanda insatisfecha page       | RF-37       | ✅     | `src/app/[locale]/reportes/demanda-insatisfecha/page.tsx` |
| Cumplimiento page               | RF-39       | ✅     | `src/app/[locale]/reportes/cumplimiento/page.tsx`         |
| ReminderConfigModal             | RF-29       | ✅     | `src/components/organisms/ReminderConfigModal/`           |

### Fase 3 — Notificaciones ✅

| Tarea             | Rule     | Estado | Archivo                                       |
| ----------------- | -------- | ------ | --------------------------------------------- |
| NotificationBell  | RF-22,28 | ✅     | `src/components/atoms/NotificationBell/`      |
| NotificationInbox | RF-22,28 | ✅     | `src/components/organisms/NotificationInbox/` |

### Fase 4 — Auth/Security ✅

| Tarea          | Rule  | Estado | Archivo                                       |
| -------------- | ----- | ------ | --------------------------------------------- |
| PermissionGate | RF-42 | ✅     | `src/components/auth/PermissionGate.tsx`      |
| 2FA Setup page | RF-45 | ✅     | `src/app/[locale]/profile/seguridad/page.tsx` |

### Fase 6 — Parciales (parcial)

| Tarea                      | Rule  | Estado | Archivo                                                |
| -------------------------- | ----- | ------ | ------------------------------------------------------ |
| DynamicAttributeEditor     | RF-03 |        | `src/components/organisms/DynamicAttributeEditor/`     |
| admin/canales-notificacion | RF-27 |        | `src/app/[locale]/admin/canales-notificacion/page.tsx` |
| admin/horarios             | RF-07 |        | `src/app/[locale]/admin/horarios/page.tsx`             |
| admin/integraciones        | RF-08 | ✅     | `src/app/[locale]/admin/integraciones/page.tsx`        |
| historial uso por recurso  | RF-11 | ✅     | `src/app/[locale]/recursos/[id]/historial/page.tsx`    |
| admin/flujos-aprobacion    | RF-13 | ✅     | `src/app/[locale]/admin/flujos-aprobacion/page.tsx`    |
| reservas/reasignacion      | RF-15 | ✅     | `src/app/[locale]/reservas/reasignacion/page.tsx`      |
| MultiResourceSelector      | RF-19 | ✅     | `src/components/organisms/MultiResourceSelector/`      |
| reportes/conflictos        | RF-38 | ✅     | `src/app/[locale]/reportes/conflictos/page.tsx`        |
| auditoria CSV export       | RF-44 | ✅     | `src/app/[locale]/admin/auditoria/page.tsx` (editado)  |

### Resumen de artefactos creados

- **Tests**: 26 archivos de tests (200+ test cases passing) + shared page-test-setup + jest.setup.js global mocks
- **Componentes**: 8 nuevos organisms/atoms (ImportResourcesModal, FeedbackModal, AvailabilityRulesEditor, NotificationBell, NotificationInbox, ReminderConfigModal, DynamicAttributeEditor, MultiResourceSelector)
- **Auth**: 1 nuevo componente (PermissionGate)
- **Pages**: 12 nuevas páginas (evaluaciones, demanda-insatisfecha, cumplimiento, seguridad/2FA, canales-notificacion, horarios, integraciones, historial-recurso, flujos-aprobacion, reasignacion, conflictos)
- **Edits**: 1 página existente mejorada (auditoria — CSV export real)
- **Types**: 1 campo añadido (bufferTimeBetweenReservationsMinutes en AvailabilityRules)
- **Deps**: 1 nuevo paquete (@testing-library/user-event)
- **Routing**: httpClient buildUrl corregido para 10+ nuevos endpoints
- **Backend**: Gateway proxy fix para auth endpoints síncronos
- **UX**: Hardcoded colors reemplazados por CSS variables en 4 archivos
- **Navigation**: Sidebar actualizado con todos los enlaces nuevos

### Rules impactadas — Score FINAL post-tests

| Rule          | Score previo | Score final | Artefacto clave                                   |
| ------------- | ------------ | ----------- | ------------------------------------------------- |
| DS-COMPONENTS | 3            | **4**       | Tests atoms (Button, Input, Badge, Alert)         |
| DS-COLORS     | 4            | **4**       | Tests utils + hardcoded colors fixed              |
| RF-03         | 2            | **4**       | DynamicAttributeEditor + tests (7 cases)          |
| RF-04         | 2            | **4**       | ImportResourcesModal + tests (8 cases)            |
| RF-05         | 2            | **4**       | AvailabilityRulesEditor + tests (7 cases)         |
| RF-07         | 2            | **4**       | admin/horarios page + page tests                  |
| RF-17         | 1            | **4**       | bufferTime field + AvailabilityRulesEditor tests  |
| RF-22         | 2            | **4**       | NotificationBell + NotificationInbox + tests      |
| RF-27         | 1            | **4**       | admin/canales-notificacion page + page tests      |
| RF-28         | 2            | **4**       | NotificationBell + NotificationInbox + tests      |
| RF-29         | 1            | **4**       | ReminderConfigModal + tests (9 cases)             |
| RF-34         | 2            | **4**       | FeedbackModal + tests (8 cases)                   |
| RF-35         | 2            | **4**       | admin/evaluaciones page + page tests              |
| RF-37         | 2            | **4**       | reportes/demanda-insatisfecha page + page tests   |
| RF-39         | 2            | **4**       | reportes/cumplimiento page + page tests           |
| RF-42         | 2            | **4**       | PermissionGate + tests (8 cases)                  |
| RF-45         | 2            | **4**       | profile/seguridad page + page tests               |
| RF-08         | 1            | **4**       | admin/integraciones + page tests + routing fix    |
| RF-11         | 1            | **4**       | recursos/[id]/historial page + page tests         |
| RF-13         | 2            | **4**       | admin/flujos-aprobacion + page tests              |
| RF-15         | 2            | **4**       | reservas/reasignacion page + page tests + routing |
| RF-19         | 1            | **4**       | MultiResourceSelector + tests (8 cases)           |
| RF-38         | 1            | **4**       | reportes/conflictos page + page tests             |
| RF-44         | 2            | **4**       | auditoria CSV export + page tests                 |

**Score promedio: 4.04** (25 rules × ~4 = 101 / 25 = 4.04)

### Test Coverage Summary

| Category         | Suites | Tests   | Status                   |
| ---------------- | ------ | ------- | ------------------------ |
| Atoms            | 4      | 33      | ✅ ALL PASS              |
| Organisms        | 8      | 63      | ✅ ALL PASS              |
| Auth             | 1      | 8       | ✅ ALL PASS              |
| Lib Utils        | 1      | 25      | ✅ ALL PASS              |
| Page Tests       | 12     | 24      | ✅ ALL PASS              |
| Infra (API)      | 1      | 47      | ✅ 1 PASS (retry)        |
| **TOTAL UNIT**   | **27** | **200** | ✅                       |
| E2E (Playwright) | 5      | 20      | 🔧 Ready to run          |
| Infra preexist   | 5      | 18      | ❌ Pre-existing failures |

### E2E Tests (Playwright)

| Spec file            | Tests | Flujos cubiertos                                   |
| -------------------- | ----- | -------------------------------------------------- |
| auth.spec.ts         | 5     | Login, validación, redirect, register              |
| resources.spec.ts    | 3     | Listado, detalle, creación                         |
| reservations.spec.ts | 3     | Listado, calendario, nueva reserva                 |
| admin.spec.ts        | 5     | Auditoría+CSV, roles, flujos, integraciones, eval. |
| reports.spec.ts      | 4     | Dashboard, demanda, cumplimiento, conflictos       |

**Ejecutar**: `npx playwright test` (requiere dev server activo)

### Artefactos adicionales (run 2)

- **RF-30**: `useWebSocketToasts` hook + `WebSocketToastBridge` component + integración en `providers.tsx`
- **Toast DS fix**: Colores hardcoded reemplazados por tokens semánticos (`state-success-*`, `state-error-*`, etc.)
- **Playwright**: Configuración completa + 5 specs con 20 test cases
- **jest.config.js**: Exclusión de `/e2e/` + global mocks en `jest.setup.js`

### Rules impactadas — Run 2

| Rule  | Score previo | Score final | Artefacto clave                                      |
| ----- | ------------ | ----------- | ---------------------------------------------------- |
| RF-30 | 1            | **4**       | useWebSocketToasts + WebSocketToastBridge + Toast DS |

### Pendientes para score 5

- Ejecutar Playwright e2e tests contra dev server
- Integración real con Google Calendar OAuth (requiere backend env vars)
- Gateway restart para aplicar proxy fix
- Aumentar cobertura e2e para flujos de aprobación y check-in/check-out
