# 🔄 Event Bus - Availability Service

## 📋 Información General

**Servicio**: `availability-service`  
**Responsabilidad**: Gestión de reservas, disponibilidad y listas de espera  
**Versión**: 1.0.0

---

## 📤 Eventos Publicados (8 eventos)

### 1. RESERVATION_CREATED
**Cuándo**: Al crear una nueva reserva

**Payload**:
```typescript
interface ReservationCreatedPayload {
  reservationId: string;
  resourceId: string;
  userId: string;
  startTime: Date;
  endTime: Date;
  purpose?: string;
  createdBy: string;
}
```

**Consumidores**: `stockpile-service` (iniciar flujo de aprobación), `resources-service`, `reports-service`

---

### 2. RESERVATION_UPDATED
**Cuándo**: Al modificar una reserva existente

**Payload**:
```typescript
interface ReservationUpdatedPayload {
  reservationId: string;
  changes: Record<string, any>;
  previousValues?: Record<string, any>;
  updatedBy: string;
}
```

**Consumidores**: `stockpile-service`, notificaciones, `reports-service`

---

### 3. RESERVATION_CANCELLED
**Cuándo**: Al cancelar una reserva

**Payload**:
```typescript
interface ReservationCancelledPayload {
  reservationId: string;
  resourceId: string;
  userId: string;
  reason?: string;
  cancelledBy: string;
}
```

**Consumidores**: `resources-service` (liberar recurso), `stockpile-service`, notificaciones, `waiting-list`

---

### 4. RESERVATION_CONFIRMED
**Cuándo**: Al confirmar una reserva (después de aprobación)

**Payload**:
```typescript
interface ReservationConfirmedPayload {
  reservationId: string;
  resourceId: string;
  userId: string;
  confirmedBy: string;
  confirmedAt: Date;
}
```

**Consumidores**: `resources-service`, notificaciones, `reports-service`

---

### 5. RESERVATION_REJECTED
**Cuándo**: Al rechazar una solicitud de reserva

**Payload**:
```typescript
interface ReservationRejectedPayload {
  reservationId: string;
  resourceId: string;
  userId: string;
  reason: string;
  rejectedBy: string;
}
```

**Consumidores**: notificaciones, `reports-service`, `waiting-list`

---

### 6. WAITING_LIST_ADDED
**Cuándo**: Al agregar un usuario a lista de espera

**Payload**:
```typescript
interface WaitingListAddedPayload {
  waitingListId: string;
  resourceId: string;
  userId: string;
  requestedStartTime: Date;
  requestedEndTime: Date;
  priority: number;
}
```

**Consumidores**: notificaciones, `reports-service`

---

### 7. WAITING_LIST_NOTIFIED
**Cuándo**: Al notificar a usuario en lista de espera sobre disponibilidad

**Payload**:
```typescript
interface WaitingListNotifiedPayload {
  waitingListId: string;
  resourceId: string;
  userId: string;
  availableSlot: { startTime: Date; endTime: Date };
  notifiedAt: Date;
}
```

**Consumidores**: notificaciones

---

### 8. SCHEDULE_CONFLICT_DETECTED
**Cuándo**: Al detectar conflicto en horarios de reservas

**Payload**:
```typescript
interface ScheduleConflictDetectedPayload {
  resourceId: string;
  conflictingReservations: string[];
  timeSlot: { startTime: Date; endTime: Date };
  detectedAt: Date;
}
```

**Consumidores**: `reports-service` (alertas), administradores

---

## 📥 Eventos Consumidos

### De `resources-service`:
- **RESOURCE_DELETED**: Cancelar reservas futuras del recurso
- **RESOURCE_AVAILABILITY_CHANGED**: Actualizar disponibilidad en calendario
- **MAINTENANCE_SCHEDULED**: Bloquear recurso durante mantenimiento

### De `stockpile-service`:
- **APPROVAL_GRANTED**: Confirmar reserva
- **APPROVAL_REJECTED**: Rechazar reserva

### De `auth-service`:
- **ROLE_ASSIGNED**: Actualizar permisos de reserva del usuario

---

## 🔧 Configuración del Event Bus

**Exchange**: `bookly.events`  
**Prefijo de routing keys**: `availability.*`

### Routing Keys

| Evento | Routing Key |
|--------|-------------|
| RESERVATION_CREATED | `availability.reservation.created` |
| RESERVATION_UPDATED | `availability.reservation.updated` |
| RESERVATION_CANCELLED | `availability.reservation.cancelled` |
| RESERVATION_CONFIRMED | `availability.reservation.confirmed` |
| RESERVATION_REJECTED | `availability.reservation.rejected` |
| WAITING_LIST_ADDED | `availability.waiting_list.added` |
| WAITING_LIST_NOTIFIED | `availability.waiting_list.notified` |
| SCHEDULE_CONFLICT_DETECTED | `availability.conflict.detected` |

---

## 📊 Métricas y Monitoreo

### Alertas Recomendadas
- ⚠️ `SCHEDULE_CONFLICT_DETECTED`: Requiere intervención inmediata
- ⚠️ Alta tasa de `RESERVATION_CANCELLED`: Posible problema con recursos
- ⚠️ `WAITING_LIST_ADDED` creciente: Demanda supera oferta

---

**Última actualización**: 1 de diciembre de 2024
