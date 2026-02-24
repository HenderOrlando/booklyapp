# 📝 CHANGELOG - Refactor Event-Driven

Registro detallado de cambios del refactor de arquitectura event-driven para eliminar errores ESM en Node.js v20/v22.

---

## [2.0.0] - 2025-11-19

### 🎉 MAJOR RELEASE - Arquitectura Event-Driven

**Breaking Changes**: Eliminación de `@libs/audit` y `@libs/oauth`

---

### ✨ Added (Nuevo)

#### **@libs/audit-decorators** (Nueva librería)

- **Decoradores**:
  - `@Audit()` - Para endpoints HTTP REST
  - `@AuditWebSocket()` - Para eventos WebSocket
  - `@AuditEvent()` - Para eventos de dominio CQRS
- **Interceptores**:
  - `AuditInterceptor` - Intercepta requests HTTP y emite eventos
  - `AuditWebSocketGateway` - Intercepta eventos WebSocket
  - `AuditEventHandler` - Intercepta eventos de dominio
- **Eventos**:
  - `AuditRecordRequestedEvent` - Evento para solicitar persistencia de auditoría
- **Interfaces**:
  - `IAuditRecord` - Registro completo de auditoría con `serviceName`
  - `IAuditQueryOptions` - Opciones de consulta
  - `IAuditQueryResult` - Resultado paginado de queries
  - `AuditAction` - Enum de acciones auditables
- **Módulo**:
  - `AuditDecoratorsModule` - Módulo exportable para microservicios

**Archivos**: 18 archivos nuevos (~800 LOC)

#### **reports-service/modules/audit** (Nuevo módulo)

- **Schema MongoDB**:
  - `AuditRecordSchema` - Schema con índices optimizados
  - Índices: userId, entityId, entityType, action, timestamp
  - TTL opcional para limpieza automática
- **Repository**:
  - `AuditRepository` - CRUD y queries avanzadas
  - Soporte para filtros por usuario, entidad, fecha, acción
  - Paginación y ordenamiento
- **Service**:
  - `AuditService` - Lógica de negocio
  - Validaciones y transformaciones
  - Limpieza de registros antiguos
- **Event Handler**:
  - `AuditRecordRequestedHandler` - Escucha eventos y persiste
  - Usa NestJS Logger para trazabilidad
- **Module**:
  - `AuditModule` - Módulo completo integrado en reports-service

**Archivos**: 5 archivos nuevos (~450 LOC)

#### **auth-service/modules/oauth** (Migrado desde libs)

- **Providers**:
  - `GoogleOAuthProvider` - OAuth2 para Google (SSO + Calendar)
  - `MicrosoftOAuthProvider` - OAuth2 para Microsoft (SSO + Calendar)
- **Utils**:
  - `TokenEncryptionUtil` - Encriptación de tokens OAuth
- **Events** (preparados):
  - `OAuthAuthorizationRequestedEvent`
  - `OAuthCallbackReceivedEvent`
- **Module**:
  - `OAuthModule` - Módulo dinámico con configuración por provider

**Archivos**: 8 archivos migrados (~600 LOC)

#### **Documentación**

- `REFACTOR_FINAL_COMPLETO.md` - Documentación completa del refactor
- `GUIA_USO_AUDIT_DECORATORS.md` - Guía de uso de decoradores
- `MIGRACION_SERVICIOS_RESTANTES.md` - Plan de migración
- `FASE2_AUDIT_COMPLETED.md` - Detalles fase 2
- `FASE3_OAUTH_COMPLETED.md` - Detalles fase 3
- `libs/audit-decorators/README.md` - README de la librería
- `libs/audit-decorators/EXAMPLE_USAGE.md` - Ejemplos de código

---

### 🔄 Changed (Modificado)

#### **availability-service**

- **availability.module.ts**:
  - ✅ Reemplazado `AuditModule` por `AuditDecoratorsModule`
  - ✅ Comentado `OAuthModule` (se usará via eventos)
  - ✅ Deshabilitado `CalendarIntegrationService` temporalmente
- **DTOs**:
  - `history-query.dto.ts` - Import desde `@libs/audit-decorators`
  - `calendar.dto.ts` - Import desde `@auth/modules/oauth`
- **Queries**:
  - `get-reservation-history.query.ts` - Interfaces actualizadas
  - `get-user-activity.query.ts` - Interfaces actualizadas
- **Handlers**:
  - `get-reservation-history.handler.ts` - Return type actualizado
  - `get-user-activity.handler.ts` - Return type actualizado
- **Controllers**:
  - `history.controller.ts` - Import actualizado
- **Repositories**:
  - `reservation-history.repository.ts` - Eliminado `implements IAuditRepository`
  - Agregado `serviceName` en `toAuditRecord()`
- **Schemas**:
  - `calendar-connection.schema.ts` - Import desde `@auth/modules/oauth`

**Total**: 9 archivos modificados

#### **auth-service**

- **auth.module.ts**:
  - ✅ Preparado para `AuditDecoratorsModule` (comentado temporalmente)
  - ✅ Import actualizado de `OAuthModule` desde módulo interno
- **google-oauth.service.ts**:
  - ✅ Import actualizado desde módulo interno

**Total**: 2 archivos modificados

#### **reports-service**

- **reports.module.ts**:
  - ✅ Agregado `AuditModule` en imports

**Total**: 1 archivo modificado

#### **tsconfig.json**

- ✅ Path `@libs/audit-decorators` agregado
- ✅ Exclude `**/*.disabled` agregado
- ❌ Paths de `@libs/audit` y `@libs/oauth` eliminados (libs removidas)

---

### 🗑️ Removed (Eliminado)

#### **libs/audit/** ❌ ELIMINADA COMPLETAMENTE

- Todos los archivos de la librería antigua (~15 archivos, ~800 LOC)
- Razón: Arquitectura monolítica con persistencia directa
- Reemplazado por: `@libs/audit-decorators` (event-driven)

#### **libs/oauth/** ❌ ELIMINADA COMPLETAMENTE

- Todos los archivos de la librería compartida (~8 archivos, ~600 LOC)
- Razón: Errores ESM en Node.js v20/v22
- Migrado a: `apps/auth-service/src/modules/oauth`

#### **Servicios deshabilitados** ⏸️

- `calendar-integration.service.ts` → `calendar-integration.service.ts.disabled`
- `calendar-oauth.service.ts` → `calendar-oauth.service.ts.disabled`
- Razón: Requieren migración a event-driven OAuth

---

### 🐛 Fixed (Corregido)

#### **Errores ESM resueltos**

- ✅ `ERR_MODULE_NOT_FOUND` al importar `@libs/audit`
- ✅ `ERR_MODULE_NOT_FOUND` al importar `@libs/oauth`
- ✅ Problemas de hot-reload en Node.js v20/v22
- ✅ Errores de module resolution en watch mode

#### **Errores TypeScript corregidos**

- ✅ Type incompatibility entre `IAuditRecord` antiguo y nuevo
- ✅ Missing `serviceName` en audit records
- ✅ Import paths incorrectos
- ✅ Circular dependencies

#### **Compilación**

- ✅ **0 errores** de TypeScript
- ✅ Build exitoso en todos los servicios
- ✅ Watch mode estable

---

### 🔧 Technical Details

#### **Arquitectura Event-Driven**

```
Microservicio → Decorador → Interceptor → Evento → EventBus → reports-service → MongoDB
```

**Ventajas**:

- ✅ Desacoplamiento total entre servicios
- ✅ Auditoría centralizada
- ✅ Escalabilidad horizontal
- ✅ No bloquea responses HTTP (async)
- ✅ Single Responsibility Principle

#### **Event Flow**

1. Decorador `@Audit()` aplicado en endpoint
2. Interceptor captura request/response
3. Emite `AuditRecordRequestedEvent`
4. EventBus (RabbitMQ/Kafka) transporta evento
5. `reports-service` escucha evento
6. `AuditRecordRequestedHandler` persiste en MongoDB

#### **MongoDB Schema**

```typescript
{
  entityId: String (indexed),
  entityType: String (indexed),
  action: String (indexed),
  userId: String (indexed),
  serviceName: String (indexed),
  beforeData: Object,
  afterData: Object,
  ip: String,
  userAgent: String,
  location: Object,
  timestamp: Date (indexed),
  metadata: Object
}
```

**Índices**:

- `{ userId: 1, timestamp: -1 }` - Queries por usuario
- `{ entityId: 1, entityType: 1 }` - Queries por entidad
- `{ action: 1, timestamp: -1 }` - Queries por acción
- `{ timestamp: 1 }` - TTL para limpieza automática

---

### 📊 Métricas del Refactor

| Métrica                   | Valor        |
| ------------------------- | ------------ |
| **Tiempo invertido**      | ~7-8 horas   |
| **Fases completadas**     | 6/6 (100%)   |
| **Archivos creados**      | 31           |
| **Archivos modificados**  | 14           |
| **Archivos eliminados**   | ~23 (2 libs) |
| **LOC agregadas**         | ~2,000       |
| **LOC eliminadas**        | ~1,400       |
| **Errores ESM resueltos** | 100%         |
| **Errores TypeScript**    | 0            |
| **Servicios migrados**    | 3/5 (60%)    |

---

### 🎯 Breaking Changes

#### **Imports de auditoría**

```typescript
// ❌ Antiguo (NO funciona)
import { IAuditRecord } from "@libs/audit";

// ✅ Nuevo (correcto)
import { IAuditRecord } from "@libs/audit-decorators";
```

#### **Imports de OAuth**

```typescript
// ❌ Antiguo (NO funciona)
import { OAuthProvider } from "@libs/oauth";

// ✅ Nuevo (correcto)
import { OAuthProvider } from "@auth/modules/oauth";
```

#### **Repositorios de auditoría**

```typescript
// ❌ Antiguo
export class Repository implements IAuditRepository {
  // Implementación de persistencia directa
}

// ✅ Nuevo
export class Repository {
  // Sin implementación de auditoría
  // Los decoradores manejan la auditoría automáticamente
}
```

---

### 📚 Migration Guide

#### **Para migrar de @libs/audit a @libs/audit-decorators**:

1. Actualizar import:

```typescript
import { Audit } from "@libs/audit-decorators";
```

2. Aplicar decorador:

```typescript
@Post()
@Audit({ entityType: 'RESOURCE', action: 'CREATE' })
async create(@Body() dto: any) { }
```

3. Eliminar código de persistencia manual

#### **Para usar OAuth desde auth-service**:

1. Actualizar import:

```typescript
import { OAuthProvider } from "@auth/modules/oauth";
```

2. Usar el enum directamente (sin cambios en lógica)

---

### ⚠️ Deprecations

#### **Deprecated (sin fecha de eliminación)**

- ❌ `libs/audit` - Ya eliminada
- ❌ `libs/oauth` - Ya eliminada
- ⚠️ `CalendarIntegrationService` - Deshabilitado (migrar a eventos)
- ⚠️ `CalendarOAuthService` - Deshabilitado (legacy)

---

### 🔜 Próximos Pasos

#### **Pendiente para v2.1.0**

- [ ] Aplicar `@Audit()` en auth-service endpoints
- [ ] Aplicar `@Audit()` en resources-service endpoints
- [ ] Aplicar `@Audit()` en stockpile-service endpoints
- [ ] Habilitar `CalendarIntegrationService` via eventos OAuth
- [ ] Dashboard de auditoría en frontend
- [ ] Pruebas de integración event-driven

**Ver**: [MIGRACION_SERVICIOS_RESTANTES.md](./MIGRACION_SERVICIOS_RESTANTES.md)

---

### 🤝 Contributors

- Equipo de Desarrollo Bookly
- Arquitectura: Event-Driven Design
- Stack: NestJS, MongoDB, RabbitMQ/Kafka, TypeScript

---

### 📖 Documentation

- [Refactor completo](./REFACTOR_FINAL_COMPLETO.md)
- [Guía de uso](./GUIA_USO_AUDIT_DECORATORS.md)
- [Plan de migración](./MIGRACION_SERVICIOS_RESTANTES.md)
- [README audit-decorators](../libs/audit-decorators/README.md)
- [Ejemplos](../libs/audit-decorators/EXAMPLE_USAGE.md)

---

## [1.0.0] - 2025-11-10 (Anterior)

### Estado antes del refactor

- ❌ `@libs/audit` con persistencia directa
- ❌ `@libs/oauth` causando errores ESM
- ❌ Errores frecuentes en Node.js v20/v22
- ❌ Hot-reload inestable
- ❌ Arquitectura monolítica

---

**Última actualización**: 19 de noviembre de 2025  
**Versión actual**: 2.0.0  
**Estado**: ✅ Producción
