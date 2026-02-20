# Directorio Global de Documentación - Bookly

Este documento sirve como guía rápida e índice centralizado para navegar por la extensa documentación del proyecto Bookly, dividida en backend, frontend y documentación general/arquitectura.

---

## 🏗️ Backend (`bookly-mock/docs/`)

Documentación técnica, arquitectura y planes específicos del backend (microservicios, API Gateway, base de datos).

* **Documentos Principales:**
  * [`INDEX.md`](../bookly-mock/docs/INDEX.md) - Índice principal del backend. Contiene la visión general de la arquitectura y enlaces a decisiones clave.
  * [`PLAN-BACKEND-CONSOLIDATION.md`](../bookly-mock/docs/PLAN-BACKEND-CONSOLIDATION.md) - Plan de consolidación y refactorización del monorepo a microservicios.
  * [`PLAN-HARDENING-IMPLEMENTATION.md`](../bookly-mock/docs/PLAN-HARDENING-IMPLEMENTATION.md) - Guía de endurecimiento y seguridad (OWASP, validaciones, rate limiting).
  * [`PLAN-BACKEND-AUDIT-AND-DOCS.md`](../bookly-mock/docs/PLAN-BACKEND-AUDIT-AND-DOCS.md) - Plan para la auditoría de código, cobertura de pruebas y generación de Swagger.

* **Directorios Clave:**
  * `api/` - Contratos de API, definiciones OpenAPI/Swagger y colecciones de Postman para pruebas manuales.
  * `architecture/` - Diagramas de C4 model, flujos de datos y decisiones de diseño del backend.
  * `adr/` - Architecture Decision Records (Registro histórico de por qué se tomaron ciertas decisiones técnicas).
  * `deployment/` & `operations/` - Guías de despliegue en Kubernetes, configuración de Docker, pipelines CI/CD y manuales de operación.
  * `development/` & `implementation/` - Guías para configurar el entorno local, estándares de código y detalles de implementación por módulo.
  * `testing/` - Estrategias de pruebas unitarias (Jest), integración y QA del backend.

---

## 🎨 Frontend (`bookly-mock-frontend/docs/`)

* **Documentos Principales:**
  * [`INDEX.md`](../bookly-mock-frontend/docs/INDEX.md) - Índice principal del frontend con enlaces a todos los recursos.
  * [`00_PLAN_GENERAL.md`](../bookly-mock-frontend/docs/00_PLAN_GENERAL.md) - Plan maestro de desarrollo, hitos y cronograma del frontend.
  * [`ARCHITECTURE.md`](../bookly-mock-frontend/docs/ARCHITECTURE.md) - Arquitectura de la aplicación React/Next.js (App Router, Server/Client components).
  * [`BEST_PRACTICES.md`](../bookly-mock-frontend/docs/BEST_PRACTICES.md) - Guía de estilo, convenciones de código, nombrado y estructura de carpetas.
  * [`CONFIGURACION_BACKEND.md`](../bookly-mock-frontend/docs/CONFIGURACION_BACKEND.md) - Instrucciones detalladas para conectar el frontend web con los microservicios locales.
  * [`PENDIENTES.md`](../bookly-mock-frontend/docs/PENDIENTES.md) - Backlog técnico, lista de tareas por hacer y registro de deuda técnica.
  * [`PERFORMANCE.md`](../bookly-mock-frontend/docs/PERFORMANCE.md) - Estrategias de optimización de carga, métricas web (Core Web Vitals) y caching.
  * [`TESTING.md`](../bookly-mock-frontend/docs/TESTING.md) - Estrategia de automatización de pruebas E2E con Playwright y pruebas de componentes.

* **Planes por Servicio (Integración UI-API):**
  * `01_AUTH_SERVICE.md` - Integración de login, roles, JWT y flujos de seguridad.
  * `02_RESOURCES_SERVICE.md` - Vistas CRUD para gestión de salas, equipos y sus características.
  * `03_AVAILABILITY_SERVICE.md` - Integración de calendarios, consultas de disponibilidad y creación de reservas.
  * `04_STOCKPILE_SERVICE.md` - Interfaces para aprobaciones, flujos de validación y control de vigilancia.
  * `05_REPORTS_SERVICE.md` - Dashboards, gráficos (Recharts) y exportación de datos.
  * `06_API_GATEWAY.md` - Configuración de llamadas unificadas y manejo global de errores.

---

## 🌍 General y Trabajo Futuro (`docs/`)

Documentación transversal, requisitos de negocio, alineación entre equipos y reportes globales. Útil como punto de partida para nuevos desarrollos o auditorías.

* **Requisitos y Negocio (PDFs Oficiales):**
  * `Bookly-Requerimientos.pdf` / `Bookly-Historias-de-Usuario.pdf` - Definiciones funcionales oficiales, RFs, RNFs y criterios de aceptación.
  * `Bookly-Flujos-de-procesos-v1.pdf` / `Bookly-Detalle-de-Casos-de-Uso.pdf` - Diagramas de flujo de negocio y casos de uso detallados por actor.
  * `bookly-documentacion-de-errores.pdf` - Catálogo estándar de códigos de error (ej. AUTH-001).

* **Alineación e Integración (Frontend ↔ Backend):**
  * [`ALINEACION_BACKEND_FRONTEND.md`](./ALINEACION_BACKEND_FRONTEND.md) - Políticas y reglas estrictas para mantener la consistencia entre ambos repositorios.
  * [`FRONTEND_BACKEND_ENDPOINT_MAPPING.md`](./FRONTEND_BACKEND_ENDPOINT_MAPPING.md) - Diccionario oficial de mapeo: qué endpoint usa qué pantalla.
  * [`BACKEND_FRONTEND_ENDPOINTS_AUDIT.md`](./BACKEND_FRONTEND_ENDPOINTS_AUDIT.md) - Resultados de la auditoría de contratos de API (Gaps y discrepancias).
  * `backend-inventory-*.md` - Inventarios exhaustivos de los endpoints implementados en cada microservicio.

* **Workflows y Automatización (Windsurf):**
  * [`INICIO_RAPIDO_WORKFLOWS.md`](./INICIO_RAPIDO_WORKFLOWS.md) - Guía sobre cómo ejecutar los flujos de trabajo automatizados del agente.
  * `windsurf/` - Definiciones Markdown de workflows personalizados (ej. `WF-REV-01-windsurf-workflow.md`).
  * `rules-review/` - Logs y resultados de las auditorías automáticas de reglas.

* **Reportes y Progreso de Calidad:**
  * [`PROGRESO_IMPLEMENTACION.md`](./PROGRESO_IMPLEMENTACION.md) - Estado general del proyecto, porcentaje de avance y próximos pasos.
  * [`SECURITY_SUMMARY.md`](./SECURITY_SUMMARY.md) - Resumen ejecutivo de la postura de seguridad actual.
  * `reports/` - Auditorías específicas de pantallas (ej. DASHBOARD-IMPROVEMENTS.md).
  * `qa/` - Reportes de calidad, resultados de pruebas E2E globales (ej. F12-SMOKE-TEST-REPORT.md).

---

## 🧠 Capacidades del Agente (Skills & Rules)

El entorno de desarrollo está configurado con habilidades (`Skills`) y reglas de negocio (`Rules`) específicas que el asistente de IA utiliza para garantizar la calidad y alineación del código.

### 🛠️ Skills Disponibles (`.windsurf/skills/`)

Habilidades técnicas avanzadas que puedes solicitar invocar explícitamente:

* `arquitectura-escalabilidad-resiliencia`: Diseño de sistemas alta disponibilidad, failover, concurrencia.
* `backend`: Creación de APIs modulares, auditables, multi-tenant.
* `cumplimiento-certificaciones`: Implementación SOC 2, ISO 27001, retención de datos.
* `data-platform` / `data-reporting`: Diseño de pipelines, data warehouse, metrics, recomendadores.
* `gestion-datos-calidad`: Gobernanza de datos, lineage, MDM.
* `gestion-ingenieria-delivery`: FinOps, tech debt, documentación.
* `gobierno-de-arquitectura-diseno`: ADRs, domain modeling, API Governance.
* `ingenieria-de-producto`: A/B testing, feature flags, telemetría.
* `ingenieria-sincronizacion-datos-dificiles`: Offline-first, backfills, resolucion de conflictos.
* `legal-product`: Disclaimers, anti-abuso, flujos de apelación Fintech.
* `negocio-gtm-b2b-unificado`: Go-To-Market, pricing, B2B metrics.
* `operacion-interna-equipo`: Property-based testing, QA contable, release governance.
* `operaciones-soporte-escalamiento`: Soporte estructurado, SLAs, T&C.
* `plataforma-build-deploy-operate-observe`: SRE, OTel, SLI/SLO, Chaos testing, Incident response.
* `qa-calidad`: Automatización E2E, prevensión de regresiones.
* `seguridad-avanzada` / `seguridad-privacidad-compliance`: Fintech-grade IAM, KMS, SAST/DAST, Threat modeling.
* `ux-ui` / `web-app`: Diseño sistemático, SSR/CSR, a11y, i18n, Core Web Vitals.

### 📜 Reglas de Negocio Activas (`.windsurf/rules/`)

Reglas contextuales que el agente aplica automáticamente dependiendo del archivo editado.

* **Reglas Base:**
  * `bookly-base.md`: Arquitectura core (Hexagonal, CQRS, EDA).
  * `bookly-modules.md`: Definición de los 5 microservicios.
  * `bookly-tech-quality-observe-i18n.md`: Estándares de calidad y observabilidad.
  * `bookly-planificacion.md`: Reglas de planificación general.

* **Reglas Frontend (Design System):**
  * `design-system-colores-tokens.md`: Uso estricto de variables CSS.
  * `design-system-componentes.md`: Atomic design.
  * `design-system-layouts-pages.md`: Estructura de vistas.

* **Reglas de Negocio por Módulo (Requisitos RF/RNF):**
  * **Auth:** `bookly-auth-rf41...` a `rf45` (Roles, auditoría, 2FA).
  * **Availability:** `bookly-availability-rf07...` a `rf19` (Horarios, calendarios, conflictos).
  * **Reports:** `bookly-reports-rf31...` a `rf40` (Dashboards, CSV, feedback).
  * **Resources:** `bookly-resource-rf01...` a `rf06` (CRUD, características, importación).
  * **Stockpile:** `bookly-stockpile-rf20...` a `rf30` (Aprobaciones, WhatsApp, check-in).
  * *(También se incluyen flujos específicos en `bookly-flujos-*.md` y directivas MoSCoW `must-*`, `should-*`, `could-*`)*

---

> 💡 **Tip para el Trabajo Futuro:**

* Si vas a modificar la **API o Base de Datos**, revisa primero `bookly-mock/docs/architecture/` y los ADRs.
* Si vas a crear una **nueva pantalla o componente**, consulta `bookly-mock-frontend/docs/BEST_PRACTICES.md` y el plan del servicio correspondiente.
* Si necesitas entender **cómo se conectan ambos mundos**, la fuente de verdad es `docs/FRONTEND_BACKEND_ENDPOINT_MAPPING.md`.
