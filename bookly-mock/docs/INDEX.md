# Bookly Mock - Índice Maestro de Documentación

## Navegación Rápida

- [Microservicios](#microservicios)
- [Desarrollo](#desarrollo)
- [Arquitectura](#arquitectura)
- [API](#api)
- [Implementación](#implementación)
- [Testing](#testing)
- [Rules Review](#rules-review)
- [Documentación Histórica](#documentación-histórica)

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

- **[DEBUG_README.md](./development/DEBUG_README.md)** - Resumen de configuración de debugging
- **[DEBUG_QUICK_START.md](./development/DEBUG_QUICK_START.md)** ⚡ - Inicio rápido de debugging en VS Code
- **[DEBUG_SETUP.md](./development/DEBUG_SETUP.md)** 🔧 - Guía completa de debugging
- **[RUNNING_SERVICES.md](./development/RUNNING_SERVICES.md)** - Comandos para ejecutar servicios
- **[CONTRIBUTING.md](./development/CONTRIBUTING.md)** - Guía de contribución
- **[MIGRATION_GUIDE_REORGANIZATION.md](./development/MIGRATION_GUIDE_REORGANIZATION.md)** 🔄 - Guía de migración tras reorganización

---

## Arquitectura

Documentación de arquitectura, configuración y estado del proyecto.

- **[ESTADO_PROYECTO.md](./architecture/ESTADO_PROYECTO.md)** - Estado actual y roadmap
- **[ORGANIZATION_SUMMARY.md](./architecture/ORGANIZATION_SUMMARY.md)** - Resumen organizativo
- **[ESM_CONFIGURATION.md](./architecture/ESM_CONFIGURATION.md)** - Configuración de módulos ES
- **[ESM_VERIFICATION_REPORT.md](./architecture/ESM_VERIFICATION_REPORT.md)** - Verificación de ESM
- **[MONGODB_CONFIGURATION.md](./architecture/MONGODB_CONFIGURATION.md)** - Configuración de MongoDB
- **[EVENTBUS_RABBITMQ_CONFIG.md](./architecture/EVENTBUS_RABBITMQ_CONFIG.md)** - Configuración de RabbitMQ

---

## API

Documentación de APIs, estándares de respuesta y Swagger.

- **[API_DOCUMENTATION_STATUS.md](./api/API_DOCUMENTATION_STATUS.md)** - Estado de documentación de APIs
- **[API_RESPONSE_STANDARD.md](./api/API_RESPONSE_STANDARD.md)** - Estándar de respuestas API
- **[API_SWAGGER_DOCUMENTATION.md](./api/API_SWAGGER_DOCUMENTATION.md)** - Documentación Swagger
- **[RESPONSE_STANDARD_SUMMARY.md](./api/RESPONSE_STANDARD_SUMMARY.md)** - Resumen del estándar
- **[RESPONSE_UTIL_USAGE_EXAMPLES.md](./api/RESPONSE_UTIL_USAGE_EXAMPLES.md)** - Ejemplos de uso

---

## Implementación

Guías de implementación de características y patrones.

### Idempotencia y Distributed Tracing

- **[IDEMPOTENCY_README.md](./implementation/IDEMPOTENCY_README.md)** 📖 - Guía principal
- **[IDEMPOTENCY_AND_DISTRIBUTED_TRACING.md](./implementation/IDEMPOTENCY_AND_DISTRIBUTED_TRACING.md)** - Teoría y conceptos

### Observabilidad y Logging

- **[LOGGER_ENHANCEMENTS.md](./implementation/LOGGER_ENHANCEMENTS.md)** - Mejoras del logger
- **[LOGGER_STANDARDIZATION.md](./implementation/LOGGER_STANDARDIZATION.md)** - Estandarización de logging
- **[CHANGELOG_LOGGER.md](./implementation/CHANGELOG_LOGGER.md)** - Historial de cambios
- **[CACHE_METRICS_IMPLEMENTATION.md](./implementation/CACHE_METRICS_IMPLEMENTATION.md)** - Métricas de cache

### WebSocket y Real-time

- **[WEBSOCKET_REALTIME.md](./implementation/WEBSOCKET_REALTIME.md)** - Comunicación en tiempo real

### Integraciones

- **[INTEGRATION_GUIDE.md](./implementation/INTEGRATION_GUIDE.md)** - Guía de integración entre microservicios

---

## Testing

Documentación de testing, auditoría y dashboards.

- **[TESTING_STATUS.md](./testing/TESTING_STATUS.md)** - Estado de testing y cobertura
- **[AUDIT_DASHBOARD_SPEC.md](./testing/AUDIT_DASHBOARD_SPEC.md)** - Especificación del dashboard de auditoría

---

## Rules Review

Auditorías formales de cumplimiento de Requerimientos Funcionales.

### [Run 2026-02-16-bookly-mock-01](./rules-review/runs/2026-02-16-bookly-mock-01/README.md)

- **44 RFs** auditados con score individual
- **PLAN-RF-RESOLUTION.md** - Plan de resolución para llevar todos los RFs a score ≥ 4
- **RULE-{SERVICE}-RF{XX}.md** - Evidencia por RF

---

## Documentación Histórica

Documentación de migraciones, refactorings y reportes históricos archivados.

### [archive/](./archive/)

Documentos archivados:

- **Migraciones**: Reportes de migraciones completadas
- **Refactorings**: Documentación de refactorings mayores
- **Fixes**: Reportes de resolución de errores
- **Verificaciones**: Reportes de verificación de plantillas
- **Resúmenes**: Documentación de progreso por fase

Consulta [archive/README.md](./archive/README.md) para más detalles.

---

## Plantillas y Ejemplos

### [templates/](./templates/)

Plantillas estandarizadas para documentación:

- **REQUIREMENT_TEMPLATE.md** - Template para requerimientos
- **ENDPOINTS_TEMPLATE.md** - Template para endpoints
- **SEEDS_TEMPLATE.md** - Template para seeds

### [examples/](./examples/)

Ejemplos de código y configuración.

### [seeds/](./seeds/)

Scripts y documentación de seeding de datos.

---

## Estructura de Documentación

```text
docs/
├── INDEX.md                      # Este archivo (índice maestro)
├── api/                          # Estándares de respuesta y Swagger
├── architecture/                 # Configuración y diseño del sistema
├── development/                  # Guías de desarrollo y debugging
├── examples/                     # Ejemplos (CSV de importación, etc.)
├── guides/                       # Guías de uso (audit decorators, etc.)
├── implementation/               # Guías de implementación activas
├── rules-review/                 # Auditorías de RFs por run
│   └── runs/{RUN_ID}/           # Resultados por ejecución
├── seeds/                        # Integridad referencial y seeds
├── templates/                    # Plantillas estandarizadas
├── testing/                      # Testing y cobertura
└── archive/                      # Documentación histórica
    ├── implementation/           # Planes completados
    ├── migrations/               # Migraciones completadas
    ├── refactoring/              # Refactorings completados
    └── resumen/                  # Progreso por fase

apps/{service}/
├── docs/
│   ├── INDEX.md                 # Índice del servicio
│   ├── ARCHITECTURE.md          # Arquitectura
│   ├── DATABASE.md              # Esquemas y modelos
│   ├── ENDPOINTS.md             # Endpoints REST
│   ├── EVENT_BUS.md             # Eventos publicados/consumidos
│   ├── SEEDS.md                 # Datos iniciales
│   ├── requirements/            # Documentación por RF
│   └── archive/                 # Docs completados del servicio
└── test/unit/services/           # Tests unitarios BDD
```

---

## Guía de Contribución

Al agregar nueva documentación:

1. **Documentación de microservicio**: Agregar en `apps/{service}/docs/` y actualizar su `INDEX.md`
2. **Desarrollo**: Documentos de debugging y desarrollo → `docs/development/`
3. **Arquitectura**: Configuración y diseño → `docs/architecture/`
4. **APIs**: Estándares y documentación → `docs/api/`
5. **Implementación**: Guías de features → `docs/implementation/`
6. **Testing**: Cobertura y auditoría → `docs/testing/`
7. **Histórico**: Documentos obsoletos → `docs/archive/`

---

## Enlaces Útiles

- **[README Principal](../README.md)** - Documentación principal del proyecto
- **[Scripts](../scripts/README.md)** - Documentación de scripts utilitarios
- **Swagger UIs**: Disponibles en cada microservicio (puertos 3000-3005)

---

**Última actualización**: Febrero 2026  
**Proyecto**: Bookly Mock - Sistema de Reservas Institucionales  
**Mantenido por**: Equipo Bookly
