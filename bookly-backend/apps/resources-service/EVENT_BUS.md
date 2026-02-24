# 🔄 Event Bus - Resources Service

## 📋 Información General

**Servicio**: `resources-service`  
**Responsabilidad**: Gestión de recursos físicos, categorías y mantenimiento  
**Versión**: 1.0.0

---

## 📤 Eventos Publicados (8 eventos)

### 1. RESOURCE_CREATED
**Cuándo**: Al crear un nuevo recurso (sala, equipo, etc.)

**Payload**:
```typescript
interface ResourceCreatedPayload {
  resourceId: string;
  name: string;
  type: ResourceType;
  categoryId: string;
  programId?: string;
  capacity?: number;
  location?: string;
  createdBy: string;
}
```

**Consumidores**: `availability-service`, `reports-service`

---

### 2. RESOURCE_UPDATED
**Cuándo**: Al actualizar información de un recurso

**Payload**:
```typescript
interface ResourceUpdatedPayload {
  resourceId: string;
  changes: Record<string, any>;
  previousValues?: Record<string, any>;
  updatedBy: string;
}
```

**Consumidores**: `availability-service` (invalidar cache), `reports-service`

---

### 3. RESOURCE_DELETED
**Cuándo**: Al eliminar o deshabilitar un recurso

**Payload**:
```typescript
interface ResourceDeletedPayload {
  resourceId: string;
  name: string;
  reason?: string;
  deletedBy: string;
  softDelete: boolean;
}
```

**Consumidores**: `availability-service` (cancelar reservas futuras), `reports-service`

---

### 4. RESOURCE_AVAILABILITY_CHANGED
**Cuándo**: Al cambiar la disponibilidad de un recurso

**Payload**:
```typescript
interface ResourceAvailabilityChangedPayload {
  resourceId: string;
  previousAvailability: boolean;
  newAvailability: boolean;
  reason?: string;
  affectedTimeSlots?: Array<{ startTime: Date; endTime: Date }>;
  updatedBy: string;
}
```

**Consumidores**: `availability-service` (actualizar calendario), `stockpile-service`

---

### 5. MAINTENANCE_SCHEDULED
**Cuándo**: Al programar mantenimiento para un recurso

**Payload**:
```typescript
interface MaintenanceScheduledPayload {
  maintenanceId: string;
  resourceId: string;
  resourceName: string;
  scheduledStartDate: Date;
  scheduledEndDate: Date;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  scheduledBy: string;
}
```

**Consumidores**: `availability-service` (bloquear recurso), `stockpile-service`, notificaciones

---

### 6. MAINTENANCE_COMPLETED
**Cuándo**: Al completar mantenimiento de un recurso

**Payload**:
```typescript
interface MaintenanceCompletedPayload {
  maintenanceId: string;
  resourceId: string;
  resourceName: string;
  completedAt: Date;
  notes?: string;
  wasSuccessful: boolean;
  completedBy: string;
}
```

**Consumidores**: `availability-service` (liberar recurso), `reports-service`

---

### 7. CATEGORY_CREATED
**Cuándo**: Al crear una nueva categoría de recursos

**Payload**:
```typescript
interface CategoryCreatedPayload {
  categoryId: string;
  name: string;
  description?: string;
  parentCategoryId?: string;
  createdBy: string;
}
```

**Consumidores**: `reports-service`, frontend (actualizar catálogos)

---

### 8. CATEGORY_UPDATED
**Cuándo**: Al actualizar una categoría

**Payload**:
```typescript
interface CategoryUpdatedPayload {
  categoryId: string;
  changes: Record<string, any>;
  previousValues?: Record<string, any>;
  updatedBy: string;
}
```

**Consumidores**: `reports-service`, frontend (actualizar catálogos)

---

## 📥 Eventos Consumidos

### De `availability-service`:
- **RESERVATION_CREATED**: Para actualizar estado de uso del recurso
- **RESERVATION_CANCELLED**: Para liberar recurso

### De `stockpile-service`:
- **CHECK_OUT_COMPLETED**: Para registrar condición del recurso post-uso

---

## 🔧 Configuración del Event Bus

**Exchange**: `bookly.events`  
**Prefijo de routing keys**: `resources.*`

### Routing Keys

| Evento | Routing Key |
|--------|-------------|
| RESOURCE_CREATED | `resources.resource.created` |
| RESOURCE_UPDATED | `resources.resource.updated` |
| RESOURCE_DELETED | `resources.resource.deleted` |
| RESOURCE_AVAILABILITY_CHANGED | `resources.availability.changed` |
| MAINTENANCE_SCHEDULED | `resources.maintenance.scheduled` |
| MAINTENANCE_COMPLETED | `resources.maintenance.completed` |
| CATEGORY_CREATED | `resources.category.created` |
| CATEGORY_UPDATED | `resources.category.updated` |

---

## 📊 Métricas y Monitoreo

### Alertas Recomendadas
- ⚠️ Múltiples `RESOURCE_DELETED` en corto tiempo
- ⚠️ `MAINTENANCE_SCHEDULED` con prioridad `critical`
- ⚠️ Recursos con `RESOURCE_AVAILABILITY_CHANGED` frecuente

---

**Última actualización**: 1 de diciembre de 2024
