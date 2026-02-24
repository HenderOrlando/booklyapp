# 🔌 Availability Service - Endpoints

**Fecha**: Noviembre 6, 2025  
**Versión**: 1.0

---

## 📋 Tabla de Contenidos

- [Disponibilidad](#disponibilidad)
- [Reservas](#reservas)
- [Lista de Espera](#lista-de-espera)
- [Reasignaciones](#reasignaciones)

---

## 🔍 Disponibilidad

### Consultar Disponibilidad

**GET** `/api/availability/:resourceId`

**Query Parameters**:

```typescript
{
  startDate: string;  // ISO 8601
  endDate: string;    // ISO 8601
  duration?: number;  // Minutos
}
```

**Response 200**:

```json
{
  "resourceId": "507f1f77bcf86cd799439020",
  "availableSlots": [
    {
      "startTime": "2025-11-10T08:00:00Z",
      "endTime": "2025-11-10T10:00:00Z",
      "isAvailable": true
    }
  ]
}
```

---

## 📅 Reservas

### Crear Reserva

**POST** `/api/reservations`

**Body**:

```json
{
  "resourceId": "507f1f77bcf86cd799439020",
  "startDate": "2025-11-10T14:00:00Z",
  "endDate": "2025-11-10T16:00:00Z",
  "purpose": "Clase de Matemáticas",
  "attendees": 35,
  "recurrenceRule": {
    "freq": "WEEKLY",
    "interval": 1,
    "until": "2025-12-15T00:00:00Z"
  }
}
```

**Response 201**: Reserva creada

**Permisos**: Autenticado

**Errores**:

- `409`: Conflicto de horario
- `403`: Recurso requiere aprobación

---

### Listar Mis Reservas

**GET** `/api/reservations/my`

**Response 200**: Array de reservas del usuario

---

### Cancelar Reserva

**DELETE** `/api/reservations/:id`

**Body**:

```json
{
  "reason": "Clase cancelada"
}
```

**Response 204**: Sin contenido

---

## ⏳ Lista de Espera

### Agregar a Lista de Espera

**POST** `/api/waitlist`

**Body**:

```json
{
  "resourceId": "507f1f77bcf86cd799439020",
  "desiredStartDate": "2025-11-12T14:00:00Z",
  "desiredEndDate": "2025-11-12T16:00:00Z"
}
```

**Response 201**: Agregado a lista de espera

---

## 🔄 Reasignaciones

### Solicitar Reasignación

**POST** `/api/reassignments`

**Body**:

```json
{
  "reservationId": "507f1f77bcf86cd799439011",
  "reason": "Mantenimiento programado"
}
```

**Response 202**: Solicitud creada

---

### Buscar Recursos Equivalentes

**GET** `/api/reassignments/suggest`

**Query**:

```typescript
{
  resourceId: string;
  startDate: string;
  endDate: string;
}
```

**Response 200**: Array de recursos alternativos

---

## 📚 Referencias

- [Arquitectura](ARCHITECTURE.md)
- [Base de Datos](DATABASE.md)

---

**Mantenedores**: Bookly Development Team  
**Última actualización**: Noviembre 6, 2025
