# Bookly Mock - Índice Maestro de Documentación

## 📚 Navegación Rápida

- [Microservicios](#microservicios)
- [Documentación Técnica](#documentación-técnica)
- [Guías de Integración](#guías-de-integración)
- [Configuración y Deploy](#configuración-y-deploy)
- [Documentación Histórica](#documentación-histórica)

---

## 🚀 Microservicios

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

---

## 📖 Documentación Técnica

### Arquitectura y Configuración

#### [API_SWAGGER_DOCUMENTATION.md](./API_SWAGGER_DOCUMENTATION.md)

Documentación completa de Swagger para todas las APIs

#### [ESM_CONFIGURATION.md](./ESM_CONFIGURATION.md)

Configuración de módulos ES (ESM) en el proyecto

#### [ESM_VERIFICATION_REPORT.md](./ESM_VERIFICATION_REPORT.md)

Reporte de verificación de módulos ESM

#### [RUNTIME_PATH_ALIASES.md](./RUNTIME_PATH_ALIASES.md)

Configuración de path aliases en runtime

### Implementación y Testing

#### [ESTADO_PROYECTO.md](./ESTADO_PROYECTO.md)

Estado actual del proyecto y roadmap

#### [TESTING_STATUS.md](./TESTING_STATUS.md)

Estado de testing y cobertura

#### [ERROR_RESOLUTION_REPORT.md](./ERROR_RESOLUTION_REPORT.md)

Reporte de resolución de errores

### Debugging y Desarrollo

#### [DEBUG_QUICK_START.md](./DEBUG_QUICK_START.md) ⚡

**Guía rápida de inicio** para debugging de microservicios  
Configuraciones VS Code listas para usar en 3 pasos

#### [DEBUG_SETUP.md](./DEBUG_SETUP.md) 🔧

**Documentación completa de debugging**  
Configuraciones, troubleshooting y mejores prácticas

### Observabilidad

#### [AUDIT_DASHBOARD_SPEC.md](./AUDIT_DASHBOARD_SPEC.md)

Especificación del dashboard de auditoría

#### [CACHE_METRICS_IMPLEMENTATION.md](./CACHE_METRICS_IMPLEMENTATION.md)

Implementación de métricas de cache

#### [WEBSOCKET_REALTIME.md](./WEBSOCKET_REALTIME.md)

Implementación de WebSockets y comunicación en tiempo real

---

## 🔗 Guías de Integración

### [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)

Guía completa de integración entre microservicios

### OAuth y Autenticación

#### [OAUTH_MIGRATION_GUIDE.md](./OAUTH_MIGRATION_GUIDE.md)

Guía de migración OAuth

#### [OAUTH_MIGRATION_COMPLETE.md](./OAUTH_MIGRATION_COMPLETE.md)

Migración OAuth completada

#### [OAUTH_COMPILATION_REPORT.md](./OAUTH_COMPILATION_REPORT.md)

Reporte de compilación OAuth

#### [OAUTH_CLEANUP_REPORT.md](./OAUTH_CLEANUP_REPORT.md)

Limpieza y optimización OAuth

### Calendar Integration

#### [MIGRACION_CALENDAR_OAUTH_EVENT_DRIVEN_PENDDING.md](./MIGRACION_CALENDAR_OAUTH_EVENT_DRIVEN_PENDDING.md)

Migración pendiente de Calendar OAuth con Event-Driven

---

## ⚙️ Configuración y Deploy

### [STOCKPILE_SERVICE_IMPLEMENTATION_PLAN.md](./STOCKPILE_SERVICE_IMPLEMENTATION_PLAN.md)

Plan de implementación del Stockpile Service

### Verificación de Plantillas

#### [VERIFICACION_PLANTILLAS_API_GATEWAY.md](./VERIFICACION_PLANTILLAS_API_GATEWAY.md)

Verificación de plantillas del API Gateway

#### [VERIFICACION_PLANTILLAS_AUTH_SERVICE.md](./VERIFICACION_PLANTILLAS_AUTH_SERVICE.md)

Verificación de plantillas del Auth Service

#### [VERIFICACION_PLANTILLAS_AVAILABILITY_SERVICE.md](./VERIFICACION_PLANTILLAS_AVAILABILITY_SERVICE.md)

Verificación de plantillas del Availability Service

#### [VERIFICACION_PLANTILLAS_RESOURCES_SERVICE.md](./VERIFICACION_PLANTILLAS_RESOURCES_SERVICE.md)

Verificación de plantillas del Resources Service

#### [VERIFICACION_PLANTILLAS_STOCKPILE_SERVICE.md](./VERIFICACION_PLANTILLAS_STOCKPILE_SERVICE.md)

Verificación de plantillas del Stockpile Service

#### [VERIFICACION_PLANTILLAS_REPORTS_SERVICE.md](./VERIFICACION_PLANTILLAS_REPORTS_SERVICE.md)

Verificación de plantillas del Reports Service

---

## 📜 Documentación Histórica

### [migrations/](./migrations/)

Documentos de migraciones y refactorings históricos:

- AUDITORIA_MIGRACION_FINAL.md
- MIGRACION_AUDIT_COMPLETADA.md
- MIGRACION_SERVICIOS_RESTANTES.md
- PLAN_MIGRACION_AUDIT_DECORATORS.md
- FASE2_AUDIT_COMPLETED.md
- FASE3_OAUTH_COMPLETED.md
- OPCIONES_2_Y_3_COMPLETADAS.md
- CALENDAR_EXPORT_IMPLEMENTADO.md
- COMMONJS_CONFIGURADO.md
- PROJECT_STATUS_FINAL.md
- DOCUMENTACION_REFACTOR_INDEX.md

### [refactoring/](./refactoring/)

Documentos de refactorings mayores:

- REFACTOR_FINAL_COMPLETO.md
- REFACTOR_COMPLETADO.md
- REFACTOR_EVENT_DRIVEN.md
- CHANGELOG_REFACTOR_EVENT_DRIVEN.md
- PLAN_REFACTOR_FINAL.md
- LIMPIEZA_SERVICIOS_COMENTADOS.md

### [guides/](./guides/)

Guías de uso y mejores prácticas:

- GUIA_USO_AUDIT_DECORATORS.md

---

## 📋 Templates

### [templates/](./templates/)

Plantillas para documentación estandarizada:

- REQUIREMENT_TEMPLATE.md
- ENDPOINTS_TEMPLATE.md
- SEEDS_TEMPLATE.md

---

## 🔧 Mantenimiento de la Documentación

### Estructura Organizativa

```
docs/
├── INDEX.md                    # Este archivo (índice maestro)
├── migrations/                 # Documentación histórica de migraciones
├── refactoring/               # Documentación de refactorings
├── guides/                    # Guías de uso
├── templates/                 # Plantillas de documentación
└── examples/                  # Ejemplos de código
```

### Guía de Contribución

Al agregar nueva documentación:

1. **Documentación de microservicio**: Agregar en `apps/{service}/docs/` y actualizar su `INDEX.md`
2. **Documentación técnica general**: Agregar en `docs/` y actualizar este índice
3. **Documentación histórica**: Mover a `docs/migrations/` o `docs/refactoring/`
4. **Guías y tutoriales**: Agregar en `docs/guides/`

### Limpieza de Documentación

- Mover documentos obsoletos a carpetas `archive/` dentro de cada microservicio
- Consolidar documentos duplicados
- Mantener enlaces actualizados
- Revisar y actualizar fechas regularmente

---

## 🌐 Enlaces Externos

- **Repositorio Principal**: [bookly-monorepo](../../)
- **Proyecto Real (Backend)**: [bookly-backend](../../../bookly-backend/)
- **Documentación Oficial**: [README.md](../README.md)
- **Guía de Contribución**: [CONTRIBUTING.md](../CONTRIBUTING.md)

---

**Última actualización**: Noviembre 2024  
**Proyecto**: Bookly Mock - Sistema de Reservas Institucionales  
**Mantenido por**: Equipo Bookly
