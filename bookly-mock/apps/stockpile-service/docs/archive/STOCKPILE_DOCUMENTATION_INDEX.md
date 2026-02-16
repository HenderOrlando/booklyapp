# 📚 Índice de Documentación - Stockpile Service

## 🎯 Documentación Principal

### 1. **README Principal**

**Ubicación**: `apps/stockpile-service/README.md`

**Contenido**:

- Descripción del servicio
- Características principales
- Stack tecnológico
- Instalación y configuración
- API Documentation
- Testing y deployment

**Audiencia**: Desarrolladores nuevos, DevOps

---

### 2. **Arquitectura del Sistema**

**Ubicación**: `apps/stockpile-service/docs/ARCHITECTURE.md`

**Contenido**:

- Arquitectura hexagonal
- Capas (Domain, Application, Infrastructure)
- Patrones implementados (CQRS, EDA, Repository, Adapter, Strategy)
- Event-Driven Architecture
- Comunicación entre servicios
- Sistema de notificaciones
- Geolocalización
- Cache distribuido
- Base de datos

**Audiencia**: Arquitectos, Tech Leads, Desarrolladores Senior

---

### 3. **Sistema de Notificaciones**

**Ubicación**: `apps/stockpile-service/docs/NOTIFICATION_PROVIDERS.md`

**Contenido**:

- Arquitectura multi-proveedor
- 10 proveedores implementados
  - Email: SendGrid, AWS SES, NodeMailer
  - SMS: Twilio SMS
  - WhatsApp: Twilio WhatsApp, WhatsApp Business API
  - Push: Firebase FCM, OneSignal, Expo Push
  - In-App: MongoDB + WebSocket
- Configuración por tenant/usuario
- Webhooks
- Métricas en tiempo real

**Audiencia**: Desarrolladores, Integradores

---

### 4. **Configuración de Redis**

**Ubicación**: `apps/stockpile-service/docs/REDIS_CACHE_SETUP.md`

**Contenido**:

- Configuración de Redis
- Cache de usuarios y recursos
- TTL strategies
- Health checks

**Audiencia**: DevOps, Backend Developers

---

### 5. **Metadatos de Approval Request**

**Ubicación**: `apps/stockpile-service/docs/APPROVAL_REQUEST_METADATA.md`

**Contenido**:

- Estructura de datos de aprobaciones
- Metadatos extendidos
- Flujos de aprobación

**Audiencia**: Backend Developers

---

## 📄 Reportes de Implementación

### 1. **Production Ready Report**

**Ubicación**: `STOCKPILE_PRODUCTION_READY.md`

**Contenido**:

- Estado final: Production Ready
- Todas las implementaciones completadas
- Controllers con Swagger
- AsyncAPI para WebSocket
- CORS y timeouts configurados
- Redis distribuido habilitado
- Paginación implementada
- Índices MongoDB optimizados
- Compresión de PDFs

**Última actualización**: Noviembre 6, 2025

---

### 2. **Advanced Features Complete**

**Ubicación**: `STOCKPILE_ADVANCED_FEATURES_COMPLETE.md`

**Contenido**:

- PDF generation con PDFKit
- QR codes visuales
- WebSocket Gateway para geolocalización
- Proximity notifications
- Location analytics
- Availability service client (request-response)
- CheckInOut service extensions

**Última actualización**: Noviembre 6, 2025

---

## 🔗 Recursos Externos

### 1. **Frontend Integration Examples**

**Ubicación**: `docs/frontend-integration-examples.md`

**Contenido**:

- Ejemplos completos para React, Vue, Angular
- Hooks personalizados
- WebSocket integration
- Proximity notifications
- Location analytics
- QR codes
- PDF download

**Audiencia**: Frontend Developers

---

### 2. **Documentación en UFPS Docs**

**Ubicación**: `docs/STOCKPILE_SERVICE.md`

**Contenido**:

- Documentación general del servicio
- Integración con otros servicios

**Audiencia**: Equipo completo

---

### 3. **Plan de Implementación**

**Ubicación**: `docs/plans/PLAN_05_STOCKPILE_SERVICE.md`

**Contenido**:

- Plan original de implementación
- Requisitos funcionales (RF-20 a RF-28)
- Historias de usuario

**Audiencia**: Product Managers, Arquitectos

---

### 4. **Auditoría del Servicio**

**Ubicación**: `docs/results/AUDITORIA_STOCKPILE_SERVICE.md`

**Contenido**:

- Resultados de auditoría
- Compliance y validaciones

**Audiencia**: QA, Auditoría

---

## 📦 Documentos Archivados

**Ubicación**: `apps/stockpile-service/docs/archive/`

Documentos históricos de implementación:

- `STOCKPILE_FINAL_REPORT.md`
- `STOCKPILE_SERVICE_INTEGRATION_COMPLETE.md`
- `IMPLEMENTACION_STOCKPILE_COMPLETADA.md`
- `IMPLEMENTATION_SUMMARY.md`
- `NOTIFICATION_PROVIDERS_ARCHITECTURE.md`
- `RF23_*.md` (5 documentos de RF-23)

**Nota**: Estos documentos son históricos y su contenido ha sido consolidado en la documentación principal.

---

## 🗺️ Mapa de Navegación

### Para Desarrolladores Nuevos

1. Leer `apps/stockpile-service/README.md`
2. Revisar `apps/stockpile-service/docs/ARCHITECTURE.md`
3. Explorar ejemplos en `docs/frontend-integration-examples.md`

### Para Integradores

1. Leer `apps/stockpile-service/docs/NOTIFICATION_PROVIDERS.md`
2. Revisar configuración en `apps/stockpile-service/docs/REDIS_CACHE_SETUP.md`
3. Consultar API en Swagger: `http://localhost:3004/api/docs`

### Para DevOps

1. Revisar `apps/stockpile-service/README.md` (sección Deployment)
2. Configurar variables de entorno
3. Ejecutar `npm run db:create-indexes`
4. Health checks: `/api/health`, `/api/health/redis`

### Para Product Managers

1. Leer `STOCKPILE_PRODUCTION_READY.md`
2. Revisar `docs/plans/PLAN_05_STOCKPILE_SERVICE.md`
3. Consultar `docs/results/AUDITORIA_STOCKPILE_SERVICE.md`

---

## 📊 Estado Actual

| Componente                     | Estado        | Documentación                       |
| ------------------------------ | ------------- | ----------------------------------- |
| Approval Requests              | ✅ Completado | README + ARCHITECTURE               |
| Check-In/Out                   | ✅ Completado | README + ARCHITECTURE               |
| Notificaciones Multi-Proveedor | ✅ Completado | NOTIFICATION_PROVIDERS              |
| Geolocalización WebSocket      | ✅ Completado | ARCHITECTURE + AsyncAPI             |
| Proximity Notifications        | ✅ Completado | ADVANCED_FEATURES                   |
| Location Analytics             | ✅ Completado | ADVANCED_FEATURES                   |
| Firmas Digitales + PDF         | ✅ Completado | ADVANCED_FEATURES                   |
| QR Codes                       | ✅ Completado | ADVANCED_FEATURES                   |
| Redis Cache                    | ✅ Completado | REDIS_CACHE_SETUP                   |
| MongoDB Indexes                | ✅ Completado | PRODUCTION_READY                    |
| Swagger Documentation          | ✅ Completado | `/api/docs`                         |
| AsyncAPI Documentation         | ✅ Completado | geolocation-dashboard.asyncapi.yaml |
| Frontend Examples              | ✅ Completado | frontend-integration-examples.md    |

---

## 📑 Requerimientos Funcionales Documentados

**Ubicación**: `apps/stockpile-service/docs/requirements/`

Documentación detallada de cada RF con criterios de aceptación, implementación y casos de uso:

| RF    | Documento                             | Estado | Descripción                               |
| ----- | ------------------------------------- | ------ | ----------------------------------------- |
| RF-20 | `RF-20_VALIDAR_SOLICITUDES.md`        | ✅     | Validación de solicitudes de aprobación   |
| RF-21 | `RF-21_GENERAR_DOCUMENTOS.md`         | ✅     | Generación de documentos PDF              |
| RF-22 | `RF-22_NOTIFICACIONES_AUTOMATICAS.md` | ✅     | Notificaciones automáticas                |
| RF-23 | `RF-23_PANTALLA_VIGILANCIA.md`        | ✅     | Dashboard para vigilancia                 |
| RF-24 | `RF-24_FLUJOS_DIFERENCIADOS.md`       | ✅     | Flujos de aprobación configurables        |
| RF-25 | `RF-25_TRAZABILIDAD.md`               | ✅     | Registro y trazabilidad completa          |
| RF-26 | `RF-26_CHECK_IN_OUT.md`               | ✅     | Check-in/out digital con QR               |
| RF-27 | `RF-27_MENSAJERIA.md`                 | ✅     | Integración multi-proveedor de mensajería |
| RF-28 | `RF-28_NOTIFICACIONES_CAMBIOS.md`     | ✅     | Notificaciones de cambios EDA             |

**Total**: 9 RFs documentados completamente

---

## 🔌 Endpoints API

**Ubicación**: `apps/stockpile-service/docs/ENDPOINTS.md`

**Contenido**:

- 44 endpoints REST documentados
- 9 categorías organizadas
- Request/Response examples completos
- Códigos HTTP y permisos por endpoint
- Autenticación JWT
- Swagger UI: `http://localhost:3004/api/docs`

**Categorías**:

1. Solicitudes de Aprobación (8 endpoints)
2. Flujos de Aprobación (7 endpoints)
3. Check-In/Check-Out (7 endpoints)
4. Analíticas de Ubicación (4 endpoints)
5. Notificaciones de Proximidad (5 endpoints)
6. Métricas de Notificaciones (6 endpoints)
7. Configuración de Tenant (4 endpoints)
8. Métricas de Sistema (2 endpoints)
9. Health Check (1 endpoint)

**Audiencia**: Desarrolladores Frontend/Backend, Integradores API

---

## 🔄 Actualizaciones

| Fecha      | Cambio                                  |
| ---------- | --------------------------------------- |
| 2025-11-12 | Documentación completa de RF-25 a RF-28 |
| 2025-11-12 | ENDPOINTS.md completo (44 endpoints)    |
| 2025-11-12 | Consolidación y limpieza de markdown    |
| 2025-11-06 | Consolidación de documentación          |
| 2025-11-06 | Archivado de documentos históricos      |
| 2025-11-06 | Creación de README principal            |
| 2025-11-06 | Creación de ARCHITECTURE.md             |
| 2025-11-06 | Creación de NOTIFICATION_PROVIDERS.md   |
| 2025-11-06 | Production Ready completado             |

---

## 📝 Notas

- **Documentación viva**: Esta documentación se actualiza constantemente
- **Pull Requests**: Actualizar documentación al agregar features
- **Versiones**: Mantener changelog en cada documento principal
- **Idioma**: Documentación en español para equipo UFPS

---

**Mantenedores**:

- Bookly Development Team
- UFPS - Universidad Francisco de Paula Santander

**Última actualización**: Noviembre 12, 2025
