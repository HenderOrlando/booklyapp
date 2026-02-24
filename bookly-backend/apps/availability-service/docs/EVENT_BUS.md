# 🔄 Availability Service - Event Bus

**Fecha**: Noviembre 6, 2025  
**Versión**: 1.0

---

## 📋 Índice

- [Visión General](#visión-general)
- [Eventos Publicados](#eventos-publicados)
- [Eventos Consumidos](#eventos-consumidos)

---

## 🎯 Visión General

El **Availability Service** publica eventos sobre reservas y consume eventos de recursos.

---

## 📤 Eventos Publicados

### 1. ReservationCreatedEvent

**Routing Key**: `availability.reservation.created`

**Payload**:

```json
{
  "eventId": "uuid",
  "timestamp": "2025-11-06T20:00:00Z",
  "data": {
    "reservationId": "507f1f77bcf86cd799439011",
    "resourceId": "507f1f77bcf86cd799439020",
    "userId": "507f1f77bcf86cd799439030",
    "startDate": "2025-11-10T14:00:00Z",
    "endDate": "2025-11-10T16:00:00Z",
    "purpose": "Clase de Matemáticas"
  }
}
```

**Consumidores**:

- **Notification Service**: Envía confirmación
- **Reports Service**: Actualiza estadísticas
- **Stockpile Service**: Valida aprobación si es necesario

---

### 2. ReservationCancelledEvent

**Routing Key**: `availability.reservation.cancelled`

**Payload**:

```json
{
  "eventId": "uuid",
  "timestamp": "2025-11-06T20:05:00Z",
  "data": {
    "reservationId": "507f1f77bcf86cd799439011",
    "cancelledBy": "507f1f77bcf86cd799439030",
    "reason": "Clase cancelada"
  }
}
```

**Consumidores**:

- **Notification Service**: Notifica cancelación
- **Waitlist Processor**: Procesa lista de espera

---

### 3. ResourceBecameAvailableEvent

**Routing Key**: `availability.resource.available`

**Payload**:

```json
{
  "eventId": "uuid",
  "timestamp": "2025-11-06T20:10:00Z",
  "data": {
    "resourceId": "507f1f77bcf86cd799439020",
    "availableSlot": {
      "startDate": "2025-11-10T14:00:00Z",
      "endDate": "2025-11-10T16:00:00Z"
    }
  }
}
```

---

## 📥 Eventos Consumidos

### resources.resource.created

Crear disponibilidad inicial del recurso.

### resources.resource.updated

Actualizar horarios de disponibilidad.

### resources.maintenance.scheduled

Bloquear horarios durante mantenimiento.

---

## 📚 Referencias

- [Arquitectura](ARCHITECTURE.md)
- [Endpoints](ENDPOINTS.md)

---

**Mantenedores**: Bookly Development Team  
**Última actualización**: Noviembre 6, 2025
