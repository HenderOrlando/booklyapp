# RF-05 EXTENSION: Resource Lifecycle Synchronization

**Fecha**: 2025-11-04  
**Estado**: ✅ **COMPLETADO**  
**Servicios**: `resources-service`, `availability-service`  
**Extensión de**: RF-05 Sincronización de Availability Rules

---

## 📋 Resumen

Extensión de la sincronización entre `resources-service` y `availability-service` para manejar **cambios de estado del ciclo de vida del recurso**:

- ✅ **Recurso eliminado**
- ✅ **Recurso bloqueado** (UNAVAILABLE)
- ✅ **Recurso en mantenimiento** (MAINTENANCE)

---

## 🎯 Objetivo

Cuando un recurso cambia a un estado que lo hace no disponible (eliminado, bloqueado, mantenimiento), el cache de reglas en `availability-service` debe ser **invalidado automáticamente** para evitar reservas sobre recursos no disponibles.

---

## 🏗️ Arquitectura Extendida

```
┌──────────────────┐                                     ┌─────────────────────┐
│ resources-service│                                     │ availability-service│
│                  │                                     │                     │
│ ResourceService  │  ──────Kafka Event───────────────►  │ StatusChangedHandler│
│                  │   "resource.status.changed"         │                     │
│ - updateStatus() │   "resource.deleted"                │ - Invalida cache    │
│ - deleteResource │                                     │ - Log de acción     │
└──────────────────┘                                     └─────────────────────┘
                                                                    │
                                                                    ▼
                                                          ┌─────────────────┐
                                                          │  Redis Cache    │
                                                          │  DEL key        │
                                                          └─────────────────┘
```

---

## ✅ Componentes Implementados

### 1. **resources-service**

#### Eventos Creados

**`resource-status-changed.event.ts`**:

```typescript
interface ResourceStatusChangedPayload {
  resourceId: string;
  previousStatus: ResourceStatus;
  newStatus: ResourceStatus;
  reason?: string;
  updatedBy: string;
}

class ResourceStatusChangedEvent {
  static create(payload): EventPayload<ResourceStatusChangedPayload>;
}
```

#### ResourceService Actualizado

**Métodos modificados**:

1. **`deleteResource(id, deletedBy?)`**:
   - Publica evento `RESOURCE_DELETED` a Kafka
   - Incluye estado anterior del recurso
   - Razón: "Resource deleted"

2. **`updateResourceStatus(id, status, updatedBy?, reason?)`**:
   - Publica evento `RESOURCE_STATUS_CHANGED` a Kafka
   - Incluye estado anterior y nuevo
   - Razón opcional personalizada

**Métodos nuevos**:

1. **`publishResourceStatusChanged()`**:
   - Publica evento de cambio de estado
   - Topic: `EventType.RESOURCE_STATUS_CHANGED`
   - Log estructurado

2. **`publishResourceDeleted()`**:
   - Publica evento de eliminación
   - Topic: `EventType.RESOURCE_DELETED`
   - Incluye previousStatus en payload

#### EventType Enum Extendido

**`libs/common/src/enums/index.ts`**:

```typescript
export enum EventType {
  // ...
  RESOURCE_STATUS_CHANGED = "resource.status.changed",
  RESOURCE_DELETED = "resource.deleted",
  // ...
}
```

---

### 2. **availability-service**

#### Handler Creado

**`resource-status-changed.handler.ts`**:

```typescript
@Injectable()
class ResourceStatusChangedHandler implements OnModuleInit {
  private readonly TOPIC_STATUS = EventType.RESOURCE_STATUS_CHANGED;
  private readonly TOPIC_DELETED = EventType.RESOURCE_DELETED;
  private readonly GROUP_ID = "availability-service-resource-status-sync";

  async onModuleInit() {
    // Subscribe a ambos topics
    await kafkaService.subscribe(TOPIC_STATUS, GROUP_ID, handleEvent);
    await kafkaService.subscribe(TOPIC_DELETED, GROUP_ID, handleEvent);
  }

  private async handleEvent(event: EventPayload<ResourceStatusChangedPayload>) {
    const { resourceId, newStatus } = event.data;

    if (shouldInvalidateCache(newStatus, event.eventType)) {
      await availabilityRulesService.invalidateCachedRules(resourceId);
    }
  }

  private shouldInvalidateCache(newStatus, eventType): boolean {
    // Siempre invalidar en eliminación
    if (eventType === EventType.RESOURCE_DELETED) return true;

    // Invalidar si pasa a UNAVAILABLE o MAINTENANCE
    return [ResourceStatus.UNAVAILABLE, ResourceStatus.MAINTENANCE].includes(
      newStatus
    );
  }
}
```

**Características**:

- ✅ Suscripción a 2 topics: `RESOURCE_STATUS_CHANGED` y `RESOURCE_DELETED`
- ✅ Invalidación automática de cache cuando corresponde
- ✅ Logging detallado de cada acción
- ✅ Manejo de errores sin detener consumer

#### Módulo Actualizado

**`availability.module.ts`**:

- ✅ `ResourceStatusChangedHandler` registrado en providers
- ✅ Inyección de `AvailabilityRulesService` y `KafkaService`

---

## 🔄 Flujos Implementados

### Flujo 1: Recurso Puesto en Mantenimiento

```
1. PATCH /api/v1/resources/:id/status
   body: { status: "MAINTENANCE", reason: "Reparación programada" }

2. ResourceService.updateResourceStatus(id, MAINTENANCE, userId, reason)
   └─► Guarda previousStatus (ej: AVAILABLE)
   └─► Actualiza status en MongoDB
   └─► Publica evento a Kafka:
        topic: "resource.status.changed"
        payload: {
          resourceId,
          previousStatus: AVAILABLE,
          newStatus: MAINTENANCE,
          updatedBy: userId,
          reason: "Reparación programada"
        }

3. Kafka distribuye evento

4. ResourceStatusChangedHandler recibe evento
   └─► availability-service

5. shouldInvalidateCache(MAINTENANCE, RESOURCE_STATUS_CHANGED)
   └─► return true (MAINTENANCE está en lista)

6. AvailabilityRulesService.invalidateCachedRules(resourceId)
   └─► Redis DEL "availability:rules:{resourceId}"

7. ✅ Cache invalidado
   └─► Próxima reserva obtendrá reglas frescas o fallback
```

### Flujo 2: Recurso Bloqueado (UNAVAILABLE)

```
1. PATCH /api/v1/resources/:id/status
   body: { status: "UNAVAILABLE", reason: "Recurso dañado" }

2. ResourceService.updateResourceStatus(id, UNAVAILABLE, userId, reason)
   └─► Similar a Flujo 1
   └─► Publica evento con newStatus: UNAVAILABLE

3. shouldInvalidateCache(UNAVAILABLE, RESOURCE_STATUS_CHANGED)
   └─► return true (UNAVAILABLE está en lista)

4. ✅ Cache invalidado
```

### Flujo 3: Recurso Eliminado

```
1. DELETE /api/v1/resources/:id

2. ResourceService.deleteResource(id, userId)
   └─► Guarda previousStatus antes de eliminar
   └─► Elimina de MongoDB
   └─► Publica evento a Kafka:
        topic: "resource.deleted"
        payload: {
          resourceId,
          previousStatus: AVAILABLE,
          newStatus: UNAVAILABLE,
          updatedBy: userId,
          reason: "Resource deleted"
        }

3. ResourceStatusChangedHandler recibe evento
   └─► eventType === RESOURCE_DELETED

4. shouldInvalidateCache(UNAVAILABLE, RESOURCE_DELETED)
   └─► return true (siempre true en DELETED)

5. ✅ Cache invalidado
   └─► Recurso ya no existe, reglas tampoco
```

### Flujo 4: Recurso Vuelve a AVAILABLE (No invalida cache)

```
1. PATCH /api/v1/resources/:id/status
   body: { status: "AVAILABLE" }

2. ResourceService.updateResourceStatus(id, AVAILABLE)
   └─► Publica evento con newStatus: AVAILABLE

3. shouldInvalidateCache(AVAILABLE, RESOURCE_STATUS_CHANGED)
   └─► return false (AVAILABLE no está en lista)

4. ⏭️ Cache NO se invalida
   └─► Reglas siguen vigentes en cache
```

---

## 📊 Matriz de Invalidación de Cache

| Estado Anterior | Estado Nuevo | Event Type       | ¿Invalida Cache? | Razón                               |
| --------------- | ------------ | ---------------- | ---------------- | ----------------------------------- |
| AVAILABLE       | MAINTENANCE  | STATUS_CHANGED   | ✅ SÍ            | Recurso no disponible temporalmente |
| AVAILABLE       | UNAVAILABLE  | STATUS_CHANGED   | ✅ SÍ            | Recurso bloqueado permanentemente   |
| AVAILABLE       | RESERVED     | STATUS_CHANGED   | ❌ NO            | Reserva temporal normal             |
| MAINTENANCE     | AVAILABLE    | STATUS_CHANGED   | ❌ NO            | Recurso vuelve a estar disponible   |
| UNAVAILABLE     | AVAILABLE    | STATUS_CHANGED   | ❌ NO            | Recurso desbloqueado                |
| (cualquiera)    | (eliminado)  | RESOURCE_DELETED | ✅ SÍ            | Recurso ya no existe                |

---

## 🎯 Estados de Recursos

```typescript
export enum ResourceStatus {
  AVAILABLE = "AVAILABLE", // ✅ Disponible para reservas
  RESERVED = "RESERVED", // 🔒 Temporalmente reservado
  MAINTENANCE = "MAINTENANCE", // 🔧 En mantenimiento (invalida cache)
  UNAVAILABLE = "UNAVAILABLE", // 🚫 No disponible (invalida cache)
}
```

---

## 📈 Beneficios

### 1. **Consistencia de Datos**

- Cache siempre sincronizado con estado real del recurso
- No hay reservas sobre recursos no disponibles
- Evita estados inconsistentes

### 2. **Experiencia de Usuario**

- Usuario no intenta reservar recursos en mantenimiento
- Mensajes claros sobre disponibilidad
- Validaciones precisas en tiempo real

### 3. **Operaciones**

- Mantenimiento de recursos no afecta reservas activas
- Bloqueo de recursos es inmediato
- Trazabilidad completa de cambios de estado

### 4. **Performance**

- Solo invalida cache cuando es necesario
- Estados AVAILABLE/RESERVED no invalidan
- Reducción de carga en Redis

---

## 🧪 Casos de Prueba

### Test 1: Mantenimiento invalida cache

```javascript
// Given
const resourceId = "resource-123";
await createResource(resourceId);
await availabilityRulesService.getAvailabilityRules(resourceId); // Cachea

// When
await resourceService.updateResourceStatus(
  resourceId,
  ResourceStatus.MAINTENANCE,
  "admin-user",
  "Mantenimiento preventivo"
);
await waitForKafkaEvent(); // Esperar propagación

// Then
const cacheExists = await redisService.exists(
  `availability:rules:${resourceId}`
);
expect(cacheExists).toBe(false); // ✅ Cache invalidado
```

### Test 2: Eliminación invalida cache

```javascript
// Given
const resourceId = "resource-456";
await createResource(resourceId);
await availabilityRulesService.getAvailabilityRules(resourceId);

// When
await resourceService.deleteResource(resourceId, "admin-user");
await waitForKafkaEvent();

// Then
const cacheExists = await redisService.exists(
  `availability:rules:${resourceId}`
);
expect(cacheExists).toBe(false); // ✅ Cache invalidado
```

### Test 3: AVAILABLE no invalida cache

```javascript
// Given
const resourceId = "resource-789";
await createResource(resourceId, { status: ResourceStatus.MAINTENANCE });
await availabilityRulesService.getAvailabilityRules(resourceId);

// When
await resourceService.updateResourceStatus(
  resourceId,
  ResourceStatus.AVAILABLE
);
await waitForKafkaEvent();

// Then
const cacheExists = await redisService.exists(
  `availability:rules:${resourceId}`
);
expect(cacheExists).toBe(true); // ✅ Cache NO invalidado
```

---

## 📚 Archivos Modificados/Creados

### resources-service

**Nuevos**:

1. `src/application/events/resource-status-changed.event.ts`

**Modificados**:

1. `src/application/services/resource.service.ts`
   - Métodos `deleteResource()` y `updateResourceStatus()` actualizados
   - Nuevos métodos: `publishResourceStatusChanged()`, `publishResourceDeleted()`

### availability-service

**Nuevos**:

1. `src/application/handlers/resource-status-changed.handler.ts`

**Modificados**:

1. `src/availability.module.ts`
   - Registrado `ResourceStatusChangedHandler`

### libs/common

**Modificados**:

1. `src/enums/index.ts`
   - Agregado `EventType.RESOURCE_STATUS_CHANGED`

---

## ✅ Checklist de Implementación

- [x] Evento `ResourceStatusChangedEvent` creado
- [x] `ResourceService.deleteResource()` publica eventos
- [x] `ResourceService.updateResourceStatus()` publica eventos
- [x] Handler `ResourceStatusChangedHandler` creado
- [x] Suscripción a `RESOURCE_STATUS_CHANGED` topic
- [x] Suscripción a `RESOURCE_DELETED` topic
- [x] Lógica de invalidación selectiva implementada
- [x] EventType enum extendido
- [x] Logging completo de acciones
- [x] Compilación exitosa
- [x] Documentación completa

---

## 🚀 Resultado Final

**Sincronización completa del ciclo de vida del recurso** con:

- ✅ **Invalidación automática** de cache en estados críticos
- ✅ **Eventos granulares** para cada cambio de estado
- ✅ **Lógica selectiva** para optimizar performance
- ✅ **Trazabilidad completa** con logging estructurado
- ✅ **Resiliencia** ante errores de Kafka
- ✅ **0 errores de compilación**
- ✅ **Producción Ready** 🚀

---

## 🔗 Referencias

- [RF05_SINCRONIZACION_AVAILABILITY_RULES_COMPLETE.md](./RF05_SINCRONIZACION_AVAILABILITY_RULES_COMPLETE.md) - Implementación base
- [ResourceService](../../apps/resources-service/src/application/services/resource.service.ts)
- [ResourceStatusChangedHandler](../../apps/availability-service/src/application/handlers/resource-status-changed.handler.ts)

---

**Última Actualización**: 2025-11-04  
**Estado**: ✅ COMPLETADO  
**Compilación**: ✅ Exitosa
