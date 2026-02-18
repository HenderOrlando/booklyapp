# Definiciones Pendientes E2E — Bookly Mock Frontend

> Registro de información faltante o ambigua que bloquea o limita la implementación de casos E2E. Cada ítem incluye impacto, evidencia, pregunta concreta y propuesta inicial.

---

## Resumen

- **Total pendientes:** 16 (9 resueltos, 7 abiertos)
- **Bloqueantes P0:** 0 (4 resueltos)
- **Importantes P1:** 3 (3 resueltos)
- **Deseables P2:** 4
- **Última actualización:** 2026-02-17

---

## Pendientes por definir

### ✅ MD-001 — Datos/Seeds — No existe usuario mock para rol vigilancia — RESUELTO

- **Resolución:** Se creó el usuario mock `user_5` con email `vigilante@ufps.edu.co`, password `vig123`, rol `vigilancia` (role_5) en ambos archivos: `mockData.ts` y `auth-service.mock.ts`. También se agregó el rol `vigilancia`/`VIGILANCIA` con permisos de lectura en `resources` y `reservations`.
- **Archivos modificados:** `src/infrastructure/mock/mockData.ts`, `src/infrastructure/mock/data/auth-service.mock.ts`
- **Fecha resolución:** 2026-02-17
- **Prioridad:** ~~P0~~ Resuelto

---

### MD-002 — Ruta/UI — RF-29 (recordatorios de reserva) sin ruta ni UI visible

- **Descripción:** RF-29 define recordatorios personalizables de reserva, pero no existe ninguna ruta en `src/app/[locale]/` ni componente visible para esta funcionalidad.
- **Impacto:** No se puede crear caso E2E para RF-29. Baja prioridad ya que es COULD en planificación.
- **Evidencia:** `bookly-stockpile-rf29-recordatorios-reserva-personalizables.md` describe la funcionalidad. No hay ruta en el frontend.
- **Pregunta concreta:** ¿RF-29 se implementará como sección dentro de `/reservas/[id]` o como pantalla independiente? ¿O se difiere a una iteración posterior?
- **Propuesta inicial (opcional):** Diferir E2E de RF-29 hasta que exista UI. Documentar como exclusión en COVERAGE_MATRIX.
- **Prioridad:** P2
- **Owner sugerido:** Producto

---

### MD-003 — Ruta/UI — RF-30 (alerta tiempo real recurso disponible) sin ruta ni UI visible

- **Descripción:** RF-30 define alertas en tiempo real cuando un recurso queda disponible tras cancelación (espera activa). No hay ruta dedicada ni componente WebSocket/toast identificable para esto.
- **Impacto:** No se puede crear caso E2E para RF-30. Baja prioridad (COULD).
- **Evidencia:** `bookly-stockpile-rf30-notificacion-tiempo-real-recurso-disponible-por-cancelacion.md`. Sin ruta ni componente visible.
- **Pregunta concreta:** ¿Esta funcionalidad se implementará como toast/notificación push o como sección de UI? ¿Se necesita WebSocket mock para E2E?
- **Propuesta inicial (opcional):** Diferir hasta que exista implementación. Si es toast, agregar `data-testid="realtime-alert-toast"` cuando se implemente.
- **Prioridad:** P2
- **Owner sugerido:** Producto

---

### MD-004 — Ruta/UI — RF-40 (cancelaciones y ausencias) sin ruta dedicada

- **Descripción:** RF-40 define un reporte de cancelaciones y ausencias, pero no existe ruta `/reportes/cancelaciones` ni sección visible dedicada.
- **Impacto:** E2E-RPT-018 queda parcialmente bloqueado. Podría estar embebido en otro reporte pero no es claro.
- **Evidencia:** `bookly-reports-rf40-cancelaciones-ausencias.md` define el requerimiento. No hay ruta en `src/app/[locale]/reportes/`.
- **Pregunta concreta:** ¿El reporte de cancelaciones/ausencias será una ruta independiente (`/reportes/cancelaciones`) o una sección dentro de `/reportes/cumplimiento`?
- **Propuesta inicial (opcional):** Asumir que está embebido en `/reportes/cumplimiento` y testear allí. Si se crea ruta independiente, agregar caso E2E.
- **Prioridad:** P2
- **Owner sugerido:** Producto

---

### ✅ MD-005 — Datos/Seeds — Discrepancia de password entre mock data y E2E specs existentes — RESUELTO

- **Resolución:** MockService valida password exactamente. La password correcta es `admin123` (del mock data). Se corrigieron los 5 archivos E2E spec existentes (`auth.spec.ts`, `resources.spec.ts`, `reports.spec.ts`, `admin.spec.ts`, `reservations.spec.ts`) reemplazando `Admin123!` por `admin123`.
- **Archivos modificados:** `e2e/auth.spec.ts`, `e2e/resources.spec.ts`, `e2e/reports.spec.ts`, `e2e/admin.spec.ts`, `e2e/reservations.spec.ts`
- **Fecha resolución:** 2026-02-17
- **Prioridad:** ~~P0~~ Resuelto

---

### MD-006 — Flujo — RF-04 (importación CSV) sin UI visible de importación

- **Descripción:** RF-04 requiere importación masiva de recursos vía CSV, pero no se identifica un botón o modal de importación en la página `/recursos` actual.
- **Impacto:** E2E-RES-017 (importación CSV) queda bloqueado hasta que la UI exista. Prioridad SHOULD en planificación.
- **Evidencia:** `bookly-resource-rf04-importar-recursos-csv.md` define el flujo. Revisión de `src/app/[locale]/recursos/page.tsx` no muestra botón de import.
- **Pregunta concreta:** ¿Existe ya la UI de importación CSV (quizás oculta detrás de feature flag o en un menú)? ¿O está pendiente de implementación?
- **Propuesta inicial (opcional):** Marcar E2E-RES-017 como skip/pending hasta que la UI esté disponible. Crear placeholder spec con `test.skip`.
- **Prioridad:** P1
- **Owner sugerido:** FE

---

### MD-007 — Flujo — RF-13 (VoBo docente para estudiantes) flujo de UI no documentado

- **Descripción:** RF-13 requiere que estudiantes solo puedan reservar con VoBo (Visto Bueno) de un profesor. No queda claro cómo se implementa esto en la UI: ¿campo de selección de profesor? ¿workflow separado? ¿notificación al profesor?
- **Impacto:** E2E-AVL-020 (restricción por categoría/VoBo) queda parcialmente bloqueado. No se puede diseñar los pasos del test sin conocer la UI.
- **Evidencia:** `bookly-availability-rf13-solicitud-reserva-vobo-docente.md` describe el requerimiento. No se encontró implementación específica en `src/app/[locale]/reservas/nueva/page.tsx`.
- **Pregunta concreta:** ¿El VoBo se implementa como: (a) campo de selección de profesor en el form de reserva, (b) workflow de aprobación separado post-reserva, o (c) requisito configurado por admin que bloquea la reserva?
- **Propuesta inicial (opcional):** Asumir opción (b) — workflow de aprobación separado manejado por stockpile-service. El E2E verificaría que el estudiante crea la solicitud y queda en estado "pendiente de VoBo".
- **Prioridad:** P1
- **Owner sugerido:** Producto

---

### MD-008 — Flujo — RF-19 (reservas múltiples) UI de selección múltiple no documentada

- **Descripción:** RF-19 permite reservas múltiples en una sola solicitud. No queda claro cómo la UI maneja esto: ¿múltiples recursos? ¿múltiples slots horarios? ¿wizard multi-paso?
- **Impacto:** E2E-AVL-022 queda bloqueado hasta definir la interacción UI.
- **Evidencia:** `bookly-availability-rf19-reservas-multiples-en-una-solicitud.md` describe el requerimiento. No se identificó UI específica.
- **Pregunta concreta:** ¿Las reservas múltiples se implementan como: (a) selección de múltiples slots en un solo form, (b) wizard que permite agregar líneas de reserva, o (c) selección en calendario con drag?
- **Propuesta inicial (opcional):** Diferir E2E hasta que la UI esté implementada. Crear placeholder spec con `test.skip`.
- **Prioridad:** P1
- **Owner sugerido:** Producto

---

### ✅ MD-009 — Errores/Mensajes — Catálogo de mensajes de error i18n para assertions negativas — RESUELTO

- **Resolución:** Se encontraron archivos de traducción i18n completos en `src/i18n/translations/es/` y `src/i18n/translations/en/`. Hay 20 archivos JSON por locale cubriendo todos los módulos. Archivo clave para assertions negativas: `errors.json` contiene mensajes por código (AUTH-0001, RSRC-0301, etc.) y por tipo HTTP. Archivo `auth.json` contiene mensajes de validación del formulario (email_invalid, passwords_mismatch, all_fields_required, etc.).
- **Archivos de referencia:** `src/i18n/translations/es/errors.json`, `src/i18n/translations/es/auth.json`
- **Fecha resolución:** 2026-02-17
- **Prioridad:** ~~P1~~ Resuelto

---

### ✅ MD-010 — Infra/CI — No existe workflow E2E en GitHub Actions — RESUELTO

- **Resolución:** Se creó `.github/workflows/e2e-frontend.yml` con 3 jobs: `e2e-smoke` (PR gate), `e2e-regression` (nightly cron 3 AM UTC), `e2e-visual` (nightly). Incluye triggers por `pull_request`, `schedule`, y `workflow_dispatch` con opción de suite. Cada job instala deps, Playwright chromium, ejecuta la suite correspondiente y sube artifacts HTML report.
- **Archivo creado:** `.github/workflows/e2e-frontend.yml`
- **Fecha resolución:** 2026-02-17
- **Prioridad:** ~~P0~~ Resuelto

---

### MD-011 — Visual QA — No hay baselines de screenshots ni definición de theme

- **Descripción:** No existen baselines de screenshots para visual regression. Tampoco está claro si la aplicación soporta dark mode y si debe testearse.
- **Impacto:** Suite visual (Fase 3) requiere baselines iniciales. Si hay dark mode, duplica el número de screenshots necesarios.
- **Evidencia:** No existe directorio `e2e/visual/` ni snapshots. `next-themes` está en dependencias (`package.json` línea 51), sugiriendo soporte de themes.
- **Pregunta concreta:** (1) ¿La app soporta dark mode activamente? (2) ¿Se deben generar baselines para ambos themes o solo light? (3) ¿Se usa algún diseño system reference (Figma) para comparación?
- **Propuesta inicial (opcional):** Generar baselines solo para light theme inicialmente. Agregar dark mode como expansión posterior si está activo.
- **Prioridad:** P2
- **Owner sugerido:** FE

---

### ✅ MD-012 — Flujo — PDFs de referencia no legibles programáticamente — RESUELTO

- **Resolución:** El usuario confirma que todos los RF y flujos de los PDFs fueron migrados a archivos `.md` en `.windsurf/rules/`. Las rules son la fuente canónica para E2E. No se requiere acción adicional.
- **Impacto:** La matriz de cobertura puede basarse exclusivamente en las rules `.md`.
- **Fecha resolución:** 2026-02-17
- **Prioridad:** ~~P1~~ Resuelto

---

### ✅ MD-013 — Datos/Seeds — Entidades mock de recursos/reservas/aprobaciones: ¿suficientes para E2E? — RESUELTO

- **Resolución:** Se verificó que existen datos mock pre-populados abundantes y suficientes:
  - **Recursos:** 8 recursos (`res_001`..`res_008`) con distintos tipos, estados y availability rules. Archivo: `resources-service.mock.ts`
  - **Categorías:** 5 categorías (`cat_001`..`cat_005`). Archivo: `resources-service.mock.ts`
  - **Reservas:** 12 reservas (`rsv_001`..`rsv_012`) con estados PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED. Archivo: `reservations-service.mock.ts`
  - **Aprobaciones:** 3 solicitudes (`apr_001`..`apr_003`) con estados PENDING y APPROVED, historial de 3 entradas, stats completas. Archivo: `stockpile-service.mock.ts`
  - **Mantenimientos, Programas Académicos:** También pre-populados.
  - **MockService** usa copias mutables de estos arrays, permitiendo CRUD in-memory.
- **IDs útiles para tests:** `res_001` (Aula 101), `rsv_002` (PENDING), `apr_001` (PENDING HIGH)
- **Fecha resolución:** 2026-02-17
- **Prioridad:** ~~P1~~ Resuelto

---

### ✅ MD-014 — i18n — ¿E2E debe cubrir ambos locales (es+en) o solo español? — RESUELTO

- **Resolución:** El usuario define que los tests E2E solo deben cubrir el locale `es`. Se debe asegurar que i18n cubra todos los casos (sin claves faltantes). No se requiere suite en `en`.
- **Impacto:** Los tests E2E se ejecutarán solo en español, simplificando la suite.
- **Fecha resolución:** 2026-02-17
- **Prioridad:** ~~P1~~ Resuelto

---

### ✅ MD-015 — Rol/Permisos — Comportamiento ante navegación a ruta denegada no definido — RESUELTO

- **Resolución:** Se analizó el código y se encontraron **dos capas de protección**:
  1. **`middleware.ts`**: Verifica presencia de `accessToken` cookie. Si no hay token, redirige a `/{locale}/login?callbackUrl=...`. **No verifica roles** (solo autenticación básica).
  2. **`ProtectedRoute.tsx`**: Componente client-side que verifica `requiredRole` y `requiredPermission`. Si el usuario autenticado no tiene el rol requerido, muestra **inline** un mensaje "Acceso Denegado" + "No tienes permisos para acceder a esta página." (no redirige).
  - **NOTA**: No todas las páginas usan `ProtectedRoute` con `requiredRole`. La protección por roles se maneja principalmente en el sidebar (ocultando links) y en el backend.
  - **Aserción correcta para E2E**: `page.getByText("Acceso Denegado")` para páginas que usan `ProtectedRoute` con `requiredRole`, o verificar que el sidebar oculta el link.
- **Archivos de referencia:** `src/middleware.ts`, `src/components/auth/ProtectedRoute.tsx`
- **Helper creado:** `e2e/helpers/assertions.helper.ts` → `expectAccessDenied(page)`
- **Fecha resolución:** 2026-02-17
- **Prioridad:** ~~P0~~ Resuelto

---

### ✅ MD-016 — i18n/UI — Claves faltantes en `approvals` mostraban texto crudo en detalle de aprobación — RESUELTO

- **Resolución:** Se agregaron las claves faltantes del namespace `approvals` en ambos locales (`es` y `en`) para la vista de detalle (`detail_title`, `actions`, `approve`, `reject`, `cancel_request`, `history`, `status.*`, `priority.*`, textos de modales, etc.).
- **Impacto corregido:** El detalle de aprobación dejó de mostrar claves crudas (ej. `approvals.approve`) y volvió a mostrar texto traducido; además, quedó estabilizada la prueba smoke de acciones en detalle.
- **Archivos modificados:** `src/i18n/translations/es/approvals.json`, `src/i18n/translations/en/approvals.json`
- **Evidencia:** Ejecución `npx playwright test --project=smoke` finalizada en verde (**22/22 passed**).
- **Fecha resolución:** 2026-02-17
- **Prioridad:** ~~P1~~ Resuelto

---

## Cambios

- 2026-02-17: Creación inicial con 15 items (MD-001 a MD-015)
- 2026-02-17: Resueltos MD-001, MD-005, MD-009, MD-010, MD-013, MD-015 (6/15). 0 P0 abiertos.
- 2026-02-17: Añadido y resuelto MD-016 (claves i18n faltantes en `approvals`). Smoke suite estable: 22/22 passed.
- 2026-02-17: Resueltos MD-012 (PDFs migrados a rules) y MD-014 (E2E solo en `es`). Total resueltos: 9/16.
