# Bookly Mock - Índice Maestro de Documentación

## Navegación Rápida

- [Microservicios](#microservicios)
- [Desarrollo](#desarrollo)
- [Arquitectura](#arquitectura)
- [API](#api)
- [Implementación](#implementación)
- [Testing](#testing)
- [Plantillas](#plantillas)
- [Archivo Histórico](#archivo-histórico)

---

## Microservicios

### [API Gateway](../apps/api-gateway/docs/INDEX.md)

**Puerto**: 3000  
**Descripción**: Punto de entrada principal, enrutamiento y balanceo de carga  
**Documentos**:

- Arquitectura híbrida REST + Event-Driven
- Integración Redis + JWT
- Patrones avanzados (Circuit Breaker, Rate Limiting)

### [Auth Service](../apps/auth-service/docs/INDEX.md)

**Puerto**: 3001  
**Descripción**: Autenticación, autorización, gestión de roles y permisos  
**Documentos**:

- RF-41: Gestión de roles y permisos
- RF-42: Restricciones de modificación
- RF-43: SSO Google Workspace
- RF-44: Auditoría completa
- RF-45: Autenticación 2FA

### [Resources Service](../apps/resources-service/docs/INDEX.md)

**Puerto**: 3002  
**Descripción**: Gestión de recursos físicos (salas, equipos, laboratorios)  
**Documentos**:

- RF-01: CRUD de recursos
- RF-02: Asociación a categorías y programas
- RF-03: Atributos clave
- RF-04: Importación masiva CSV
- RF-05: Reglas de disponibilidad
- RF-06: Mantenimiento de recursos

### [Availability Service](../apps/availability-service/docs/INDEX.md)

**Puerto**: 3003  
**Descripción**: Disponibilidad, reservas, calendarios y reasignaciones  
**Documentos**:

- RF-07: Configurar disponibilidad
- RF-08: Integración con calendarios
- RF-09: Búsqueda avanzada
- RF-10: Visualización calendario
- RF-11: Historial de uso
- RF-12: Reservas recurrentes
- RF-13: Modificación y cancelación
- RF-14: Lista de espera
- RF-15: Reasignación automática

### [Stockpile Service](../apps/stockpile-service/docs/INDEX.md)

**Puerto**: 3004  
**Descripción**: Flujos de aprobación, documentos y notificaciones  
**Documentos**:

- RF-20: Validación de solicitudes
- RF-21: Generación de documentos
- RF-22: Notificaciones automáticas
- RF-23: Pantalla de vigilancia
- RF-24: Flujos diferenciados
- RF-25: Trazabilidad
- RF-26: Check-in/Check-out
- RF-27: Integración mensajería
- RF-28: Notificaciones de cambios

### [Reports Service](../apps/reports-service/docs/INDEX.md)

**Puerto**: 3005  
**Descripción**: Reportes, análisis, dashboards y feedback  
**Documentos**:

- RF-31: Reportes de uso
- RF-32: Reportes por usuario
- RF-33: Exportación CSV
- RF-34: Sistema de feedback
- RF-35: Evaluación de usuarios
- RF-36: Dashboards interactivos
- RF-37: Demanda insatisfecha
- RF-38: Conflictos de reserva
- RF-39: Cumplimiento de reserva

---

## Desarrollo

Guías para desarrollo, debugging y ejecución de servicios.

- **[CONTRIBUTING.md](./development/CONTRIBUTING.md)** - Guía de contribución
- **[RUNNING_SERVICES.md](./development/RUNNING_SERVICES.md)** - Comandos para ejecutar servicios
- **[DEBUG_QUICK_START.md](./development/DEBUG_QUICK_START.md)** - Inicio rápido de debugging
- **[DEBUG_SETUP.md](./development/DEBUG_SETUP.md)** - Guía completa de debugging
- **[DEBUG_README.md](./development/DEBUG_README.md)** - Resumen de configuración
- **[MIGRATION_GUIDE_REORGANIZATION.md](./development/MIGRATION_GUIDE_REORGANIZATION.md)** - Guía de migración
- **[GUIA_USO_AUDIT_DECORATORS.md](./development/GUIA_USO_AUDIT_DECORATORS.md)** - Uso de decoradores de auditoría
- **[SEED_IDS_REFERENCE.md](./development/SEED_IDS_REFERENCE.md)** - Referencia de IDs de seeds
- **[resources-import-template.csv](./development/resources-import-template.csv)** - Template CSV de importación

---

## Arquitectura

Configuración y diseño del sistema.

- **[C4-ARCHITECTURE.md](./architecture/C4-ARCHITECTURE.md)** - Modelo C4
- **[ESM_CONFIGURATION.md](./architecture/ESM_CONFIGURATION.md)** - Configuración ES Modules
- **[MONGODB_CONFIGURATION.md](./architecture/MONGODB_CONFIGURATION.md)** - Configuración MongoDB
- **[EVENTBUS_RABBITMQ_CONFIG.md](./architecture/EVENTBUS_RABBITMQ_CONFIG.md)** - Configuración RabbitMQ

### ADRs (Architecture Decision Records)

- **[ADR-001](./adr/ADR-001-auth-service-sot.md)** - Auth Service como fuente de verdad
- **[ADR-002](./adr/ADR-002-event-store-outbox.md)** - Event Store con Outbox Pattern
- **[ADR-003](./adr/ADR-003-dlq-policy.md)** - Política de Dead Letter Queue

---

## API

Estándares de respuesta, Swagger y AsyncAPI.

- **[API_RESPONSE_STANDARD.md](./api/API_RESPONSE_STANDARD.md)** - Estándar de respuestas
- **[API_SWAGGER_DOCUMENTATION.md](./api/API_SWAGGER_DOCUMENTATION.md)** - Documentación Swagger
- **[API_DOCUMENTATION_STATUS.md](./api/API_DOCUMENTATION_STATUS.md)** - Estado (313 OpenAPI ops + 78 AsyncAPI channels)
- **[RESPONSE_STANDARD_SUMMARY.md](./api/RESPONSE_STANDARD_SUMMARY.md)** - Resumen del estándar
- **[RESPONSE_UTIL_USAGE_EXAMPLES.md](./api/RESPONSE_UTIL_USAGE_EXAMPLES.md)** - Ejemplos de uso

### AsyncAPI Specs

- [auth-events.asyncapi.yaml](../apps/auth-service/docs/auth-events.asyncapi.yaml)
- [resources-events.asyncapi.yaml](../apps/resources-service/docs/resources-events.asyncapi.yaml)
- [availability-events.asyncapi.yaml](../apps/availability-service/docs/availability-events.asyncapi.yaml)
- [stockpile-events.asyncapi.yaml](../apps/stockpile-service/docs/stockpile-events.asyncapi.yaml)
- [reports-events.asyncapi.yaml](../apps/reports-service/docs/reports-events.asyncapi.yaml)
- [geolocation-dashboard.asyncapi.yaml](../apps/stockpile-service/src/infrastructure/gateways/geolocation-dashboard.asyncapi.yaml)

---

## Implementación

Guías de implementación de características y patrones.

- **[IDEMPOTENCY_README.md](./implementation/IDEMPOTENCY_README.md)** - Guía de idempotencia
- **[IDEMPOTENCY_AND_DISTRIBUTED_TRACING.md](./implementation/IDEMPOTENCY_AND_DISTRIBUTED_TRACING.md)** - Tracing distribuido
- **[LOGGER_ENHANCEMENTS.md](./implementation/LOGGER_ENHANCEMENTS.md)** - Mejoras del logger
- **[LOGGER_STANDARDIZATION.md](./implementation/LOGGER_STANDARDIZATION.md)** - Estandarización de logging
- **[CHANGELOG_LOGGER.md](./implementation/CHANGELOG_LOGGER.md)** - Historial de cambios
- **[CACHE_METRICS_IMPLEMENTATION.md](./implementation/CACHE_METRICS_IMPLEMENTATION.md)** - Métricas de cache
- **[WEBSOCKET_REALTIME.md](./implementation/WEBSOCKET_REALTIME.md)** - Comunicación en tiempo real
- **[INTEGRATION_GUIDE.md](./implementation/INTEGRATION_GUIDE.md)** - Integración entre microservicios

---

## Testing

- **[TESTING_STATUS.md](./testing/TESTING_STATUS.md)** - Estado de testing y cobertura
- **[AUDIT_DASHBOARD_SPEC.md](./testing/AUDIT_DASHBOARD_SPEC.md)** - Especificación del dashboard de auditoría

---

## Plantillas

Plantillas estandarizadas en [`templates/`](./templates/):

- `REQUIREMENT_TEMPLATE.md`, `ENDPOINTS_TEMPLATE.md`, `SEEDS_TEMPLATE.md`
- `ARCHITECTURE_TEMPLATE.md`, `DATABASE_TEMPLATE.md`, `EVENT_BUS_TEMPLATE.md`

---

## Despliegue y Operaciones

- **[DEPLOY_LOCAL.md](./deployment/DEPLOY_LOCAL.md)** - Despliegue local
- **[DEPLOY_DOCKER.md](./deployment/DEPLOY_DOCKER.md)** - Docker
- **[DEPLOY_GH_ACTIONS.md](./deployment/DEPLOY_GH_ACTIONS.md)** - GitHub Actions CI/CD
- **[DEPLOY_PULUMI.md](./deployment/DEPLOY_PULUMI.md)** - IaC con Pulumi
- **[KPIS.md](./operations/KPIS.md)** - KPIs operativos

---

## Archivo Histórico

Documentación completada en [`archive/`](./archive/):

- `plans/` - Planes de consolidación, hardening y auditoría completados.
- `migrations/` - Reportes de migraciones (OAuth, response standard, etc.).
- `refactoring/` - Documentación de refactorings mayores.
- `rules-review/` - Logs de auditorías de reglas por ejecución.
- `resumen/` - Resúmenes de progreso por fase.
- Verificaciones de plantillas por servicio.

---

## Estructura de Documentación

```text
docs/
├── INDEX.md                    # Este archivo
├── adr/                        # Architecture Decision Records
├── api/                        # Estándares de respuesta y Swagger
├── architecture/               # Configuración y diseño del sistema
├── deployment/                 # Guías de despliegue
├── development/                # Guías de desarrollo, seeds y debug
├── implementation/             # Guías de implementación activas
├── operations/                 # KPIs y manuales
├── templates/                  # Plantillas estandarizadas
├── testing/                    # Testing y cobertura
└── archive/                    # Documentación histórica
    ├── plans/
    ├── migrations/
    ├── refactoring/
    ├── rules-review/
    └── resumen/
```

---

**Última actualización**: Febrero 2026  
**Proyecto**: Bookly Mock - Sistema de Reservas Institucionales
