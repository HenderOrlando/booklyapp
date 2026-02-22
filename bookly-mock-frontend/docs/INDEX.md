# Índice de Documentación - Bookly Frontend

> **Última actualización**: Febrero 2026

---

## Arquitectura y Estándares (`architecture-and-standards/`)

- **[ARCHITECTURE.md](./architecture-and-standards/ARCHITECTURE.md)** - Principios de diseño, Atomic Design, flujo de datos, patrones de componentes.
- **[BEST_PRACTICES.md](./architecture-and-standards/BEST_PRACTICES.md)** - Convenciones de React, TypeScript, hooks, TailwindCSS, accesibilidad, Git.
- **[TESTING.md](./architecture-and-standards/TESTING.md)** - Estrategia de testing (unitarios, integración, E2E), coverage, mocks.
- **[PERFORMANCE.md](./architecture-and-standards/PERFORMANCE.md)** - Core Web Vitals, code splitting, virtual scrolling, bundle optimization.

---

## Integración con APIs (`api-integration/`)

Guías de cómo el frontend consume cada microservicio del backend.

- **[01_AUTH_SERVICE.md](./api-integration/01_AUTH_SERVICE.md)** - RF-41 a RF-45: Login, SSO, roles, auditoría, 2FA.
- **[02_RESOURCES_SERVICE.md](./api-integration/02_RESOURCES_SERVICE.md)** - RF-01 a RF-06: CRUD recursos, categorías, CSV, mantenimiento.
- **[03_AVAILABILITY_SERVICE.md](./api-integration/03_AVAILABILITY_SERVICE.md)** - RF-07 a RF-19: Reservas, calendario, recurrentes, lista de espera.
- **[04_STOCKPILE_SERVICE.md](./api-integration/04_STOCKPILE_SERVICE.md)** - RF-20 a RF-28: Aprobaciones, check-in/out, PDF, notificaciones.
- **[05_REPORTS_SERVICE.md](./api-integration/05_REPORTS_SERVICE.md)** - RF-31 a RF-37: Reportes, dashboards, exportación, feedback.
- **[06_API_GATEWAY.md](./api-integration/06_API_GATEWAY.md)** - WebSocket, notificaciones, health checks, métricas.
- **[CONFIGURACION_BACKEND.md](./api-integration/CONFIGURACION_BACKEND.md)** - Guía para conectar frontend con microservicios locales.
- **[API_RESPONSE_STRUCTURE.md](./api-integration/API_RESPONSE_STRUCTURE.md)** - Estructura estándar de respuesta del backend.

---

## Gestión de Proyecto (`project-management/`)

- **[PENDIENTES.md](./project-management/PENDIENTES.md)** - Backlog técnico, TODOs consolidados, priorización y roadmap.

---

## Reportes y Auditorías (`reports/`)

- **[A11Y_REASSIGNMENT_AUDIT.md](./reports/A11Y_REASSIGNMENT_AUDIT.md)** - Auditoría de accesibilidad en reasignación.
- **[UX_REASSIGNMENT_AUDIT.md](./reports/UX_REASSIGNMENT_AUDIT.md)** - Auditoría UX de reasignación.
- **[UX_REASSIGNMENT_PLAN.md](./reports/UX_REASSIGNMENT_PLAN.md)** - Plan de mejoras UX.

---

## Archivo Histórico (`archive/`)

Documentación completada organizada por categoría:

- `sprints/` - Documentación de sprints y fases completadas.
- `fixes/` - Soluciones a errores críticos (sidenav, role validation, session, etc.).
- `plans/` - Planes completados (plan general, limpieza, próximos pasos).
- `implementations/` - Features implementadas (drag & drop, virtual scrolling, interceptors, etc.).
- `migrations/` - Migraciones completadas (React Query, Redux, HTTP client).
- `refactoring/` - Refactorings completados (atomic design, optimizaciones).
- `design-system/` - Documentación histórica del design system.
- `translations/` - Auditorías y progreso de traducciones.
- `sessions/` - Resúmenes de sesiones de trabajo.

---

## Estructura de Documentación

```text
docs/
├── INDEX.md                        # Este archivo
├── architecture-and-standards/     # Arquitectura, prácticas, testing, performance
├── api-integration/                # Integración UI-API por servicio (01 a 06)
├── project-management/             # Backlog técnico (PENDIENTES.md)
├── reports/                        # Auditorías UX y accesibilidad
└── archive/                        # Trabajo histórico
    ├── sprints/
    ├── fixes/
    ├── plans/
    ├── implementations/
    ├── migrations/
    ├── refactoring/
    ├── design-system/
    ├── translations/
    └── sessions/
```

---

## Navegación Rápida

| Necesito...                  | Ir a...                                                                         |
| ---------------------------- | ------------------------------------------------------------------------------- |
| Entender la arquitectura     | [ARCHITECTURE.md](./architecture-and-standards/ARCHITECTURE.md)                 |
| Convenciones de código       | [BEST_PRACTICES.md](./architecture-and-standards/BEST_PRACTICES.md)             |
| Hacer tests                  | [TESTING.md](./architecture-and-standards/TESTING.md)                           |
| Mejorar performance          | [PERFORMANCE.md](./architecture-and-standards/PERFORMANCE.md)                   |
| Ver TODOs pendientes         | [PENDIENTES.md](./project-management/PENDIENTES.md)                            |
| Conectar con el backend      | [CONFIGURACION_BACKEND.md](./api-integration/CONFIGURACION_BACKEND.md)          |
| Ver el README principal      | [README.md](../README.md)                                                       |

---

**Última actualización**: Febrero 2026
