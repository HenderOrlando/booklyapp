# Directorio Global de Documentación - Bookly

Índice centralizado de toda la documentación del proyecto Bookly, organizada en tres áreas: global, backend y frontend.

---

## 🏗️ Backend (`bookly-mock/docs/`)

Documentación técnica, arquitectura y estándares del backend (microservicios NestJS, API Gateway, MongoDB).

* **Índice:** [`INDEX.md`](../bookly-mock/docs/INDEX.md)

* **Directorios Activos:**
  * `adr/` - Architecture Decision Records.
  * `api/` - Contratos OpenAPI/Swagger y estándares de respuesta.
  * `architecture/` - Diagramas C4, configuración de EventBus, MongoDB, ESM.
  * `deployment/` - Guías de despliegue (Docker, GH Actions, Pulumi, Local).
  * `development/` - Setup local, contribución, debug, seeds y guías de uso.
  * `implementation/` - Detalles por módulo (cache, idempotencia, logger, WebSocket).
  * `operations/` - KPIs y manuales de operación.
  * `templates/` - Plantillas estándar para documentar endpoints, arquitectura, seeds, etc.
  * `testing/` - Estado de pruebas y auditoría de specs.
  * `archive/` - Planes completados, migraciones, verificaciones históricas.

---

## 🎨 Frontend (`bookly-mock-frontend/docs/`)

Documentación del frontend Next.js: arquitectura, estándares, integración con APIs y backlog técnico.

* **Índice:** [`INDEX.md`](../bookly-mock-frontend/docs/INDEX.md)

* **Directorios Activos:**
  * `architecture-and-standards/` - Arquitectura, buenas prácticas, performance y testing.
  * `api-integration/` - Guías de integración UI-API por servicio (01 a 06) + estructura de respuesta.
  * `project-management/` - Backlog técnico (`PENDIENTES.md`).
  * `reports/` - Auditorías UX y accesibilidad.
  * `archive/` - Trabajo histórico organizado por categoría (sprints, fixes, migrations, etc.).

---

## 🌍 Global (`docs/`)

Documentación transversal, requisitos de negocio, alineación entre equipos y reportes de calidad.

* **Requisitos y Negocio (`business-requirements/`):**
  * PDFs oficiales: Requerimientos, Historias de Usuario, Flujos de Procesos, Casos de Uso, Catálogo de Errores.

* **Alineación Frontend ↔ Backend (`api-alignment/`):**
  * [`ALINEACION_BACKEND_FRONTEND.md`](./api-alignment/ALINEACION_BACKEND_FRONTEND.md) - Políticas de consistencia.
  * [`FRONTEND_BACKEND_ENDPOINT_MAPPING.md`](./api-alignment/FRONTEND_BACKEND_ENDPOINT_MAPPING.md) - Mapeo oficial endpoint → pantalla.
  * [`BACKEND_FRONTEND_ENDPOINTS_AUDIT.md`](./api-alignment/BACKEND_FRONTEND_ENDPOINTS_AUDIT.md) - Auditoría de contratos.
  * `inventories/` - Inventario de endpoints por microservicio (.md y .csv).
  * `missing-definitions/` - Definiciones faltantes identificadas en auditorías (MD-002 a MD-011).
  * [`PLAN_100_PERCENT_ENDPOINTS.md`](./api-alignment/PLAN_100_PERCENT_ENDPOINTS.md) - Plan maestro para llevar todos los endpoints a 100% backend funcional + 100% frontend implementado.
  * **Plan Activo:** Ejecución del plan 100% endpoints (10 fases, 6 semanas). Skills: `web-app`, `ux-ui`, `backend`, `data-reporting`, `qa-calidad`, `seguridad-avanzada`, `gestion-datos-calidad`, `plataforma-build-deploy-operate-observe`, `operacion-interna-equipo`, `gestion-ingenieria-delivery`.

* **Gestión de Proyecto (`project-management/`):**
  * [`PROGRESO_IMPLEMENTACION.md`](./project-management/PROGRESO_IMPLEMENTACION.md) - Estado y avance general.
  * [`SECURITY_SUMMARY.md`](./project-management/SECURITY_SUMMARY.md) - Postura de seguridad.
  * [`PLAN_I18N_AUDIT.md`](./project-management/PLAN_I18N_AUDIT.md) - Auditoría de internacionalización.
  * [`PLAN_WAITLIST_INTEGRATION.md`](./project-management/PLAN_WAITLIST_INTEGRATION.md) - Integración de lista de espera.

* **Calidad y Testing (`qa/`):**
  * `F12-SMOKE-TEST-REPORT.md` - Smoke test de consola.
  * `AUDIT-ARCHITECTURE-FUNCTIONS-2026-02-21.md` - Auditoría de funciones.
  * `DASHBOARD-IMPROVEMENTS.md` - Mejoras del dashboard.
  * `e2e/` - Planes, suites, cobertura y roadmap de pruebas E2E.

* **Workflows y Automatización (`workflows-guide/`):**
  * [`INICIO_RAPIDO_WORKFLOWS.md`](./workflows-guide/INICIO_RAPIDO_WORKFLOWS.md) - Guía rápida.
  * `WF-REV-01-windsurf-workflow.md` - Workflow de revisión.
  * `WF-RULES-REVIEW-workflow.md` / `WF-RULES-REVIEW.md` - Workflow de auditoría de reglas.

* **Análisis para Tesis de Grado (`tesis/`):**
  * [`00-RESUMEN-EJECUTIVO.md`](./tesis/00-RESUMEN-EJECUTIVO.md) - Resumen ejecutivo con cifras clave, top 10 aspectos impactantes y contribuciones académicas.
  * [`01-DOMINIO-AUTENTICACION.md`](./tesis/01-DOMINIO-AUTENTICACION.md) - Análisis del dominio de identidad y control de accesos (auth-service).
  * [`02-DOMINIO-RECURSOS.md`](./tesis/02-DOMINIO-RECURSOS.md) - Análisis del dominio de gestión de recursos físicos (resources-service).
  * [`03-DOMINIO-DISPONIBILIDAD.md`](./tesis/03-DOMINIO-DISPONIBILIDAD.md) - Análisis del dominio de reservas y disponibilidad (availability-service).
  * [`04-DOMINIO-APROBACIONES.md`](./tesis/04-DOMINIO-APROBACIONES.md) - Análisis del dominio de aprobaciones y validaciones (stockpile-service).
  * [`05-DOMINIO-REPORTES.md`](./tesis/05-DOMINIO-REPORTES.md) - Análisis del dominio de reportes y análisis (reports-service).
  * [`06-ARQUITECTURA-TRANSVERSAL.md`](./tesis/06-ARQUITECTURA-TRANSVERSAL.md) - Arquitectura transversal: API Gateway, Event Bus, observabilidad, estándares.
  * [`07-FRONTEND-UX.md`](./tesis/07-FRONTEND-UX.md) - Frontend y experiencia de usuario: Next.js, Atomic Design, analytics, i18n.
  * [`08-CALIDAD-TESTING-DEVOPS.md`](./tesis/08-CALIDAD-TESTING-DEVOPS.md) - Calidad, testing y DevOps: CI/CD, Docker, Kubernetes, Pulumi.

* **Archivo Histórico (`archive/`):**
  * `rules-review/` - Logs de ejecución de auditorías de reglas.
  * `workflows-old/` - Guías de migración obsoletas.
  * Documentos de fix y mapeo anteriores.

---

> 💡 **Navegación Rápida:**

* **Modificar API o BD** → `bookly-mock/docs/architecture/` y `adr/`
* **Nueva pantalla o componente** → `bookly-mock-frontend/docs/architecture-and-standards/BEST_PRACTICES.md`
* **Conexión frontend ↔ backend** → `docs/api-alignment/FRONTEND_BACKEND_ENDPOINT_MAPPING.md`
