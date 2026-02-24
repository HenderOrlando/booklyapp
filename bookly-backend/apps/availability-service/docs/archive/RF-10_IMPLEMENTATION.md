# RF-10: Visualización en Calendario - Implementación Completa

**Fecha de Implementación**: Noviembre 8, 2025  
**Estado**: ✅ Completado  
**Prioridad**: Alta (UX/Frontend)

---

## 📋 Resumen

Sistema completo de generación de vistas de calendario con slots coloreados por estado. Soporta vistas mensual, semanal y diaria con metadatos enriquecidos para renderizado en frontend (React Calendar, FullCalendar, etc.).

---

## 🎯 Características Implementadas

### ✅ DTOs y Tipos

**Componentes Creados**:

- ✅ `CalendarViewType` - Enum para tipos de vista (month, week, day)
- ✅ `SlotStatus` - Enum para estados de slots
- ✅ `CalendarViewDto` - DTO de solicitud con validación
- ✅ `CalendarSlotDto` - DTO de slot individual
- ✅ `CalendarLegendDto` - Leyenda de colores
- ✅ `CalendarViewResponseDto` - Respuesta completa con metadata

**Ubicación**: `/src/infrastructure/dtos/calendar-view.dto.ts`

### ✅ Servicios

**CalendarViewService**:

- ✅ Generación de vista mensual con todos los días del mes
- ✅ Generación de vista semanal (ISO 8601 week numbers)
- ✅ Generación de vista diaria con slots horarios
- ✅ Detección automática de conflictos con reservas
- ✅ Asignación de estados por slot
- ✅ Cálculo de capacidad y disponibilidad

**SlotColorService**:

- ✅ Mapeo de estados a códigos de color hexadecimales
- ✅ Detección de reservas propias del usuario
- ✅ Leyenda completa de colores
- ✅ Validación de códigos de color

**Ubicación**: `/src/application/services/`

### ✅ Constantes de Colores

```typescript
export const CALENDAR_COLORS = {
  AVAILABLE: "#4CAF50", // 🟢 Verde - Disponible
  RESERVED: "#F44336", // 🔴 Rojo - Reservado
  PENDING: "#FFC107", // 🟡 Amarillo - Pendiente
  BLOCKED: "#9E9E9E", // ⚫ Gris - Bloqueado
  OWN_RESERVATION: "#2196F3", // 🔵 Azul - Reserva propia
};
```

**Ubicación**: `/src/domain/constants/calendar-colors.constant.ts`

### ✅ Controller REST

**Endpoints Implementados**:

- ✅ `GET /calendar/view` - Vista general configurable
- ✅ `GET /calendar/month` - Atajo para vista mensual
- ✅ `GET /calendar/week` - Atajo para vista semanal
- ✅ `GET /calendar/day` - Atajo para vista diaria

**Ubicación**: `/src/infrastructure/controllers/calendar-view.controller.ts`

### ✅ CQRS Implementation

- ✅ `GetCalendarViewQuery` - Query con validación
- ✅ `GetCalendarViewHandler` - Handler con lógica de negocio

**Ubicación**: `/src/application/queries/` y `/src/application/handlers/`

---

## 🔌 API Endpoints

### 1. Vista General

```http
GET /api/calendar/view?view=month&year=2025&month=11&resourceId=507f1f77bcf86cd799439011
Authorization: Bearer <token>
```

**Parámetros**:

- `view`: `"month"` | `"week"` | `"day"` (requerido)
- `year`: Año (2020-2100, requerido)
- `month`: Mes (1-12, requerido para month view)
- `week`: Semana ISO 8601 (1-53, requerido para week view)
- `date`: Fecha ISO (YYYY-MM-DD, requerido para day view)
- `resourceId`: ID del recurso (requerido)

**Respuesta**:

```json
{
  "view": "month",
  "period": {
    "start": "2025-11-01T00:00:00Z",
    "end": "2025-11-30T23:59:59Z"
  },
  "slots": [
    {
      "date": "2025-11-08",
      "startTime": "09:00",
      "endTime": "10:00",
      "status": "available",
      "color": "#4CAF50",
      "metadata": {
        "resourceId": "507f1f77bcf86cd799439011",
        "canBook": true,
        "isRecurring": false
      }
    },
    {
      "date": "2025-11-08",
      "startTime": "10:00",
      "endTime": "11:00",
      "status": "reserved",
      "color": "#F44336",
      "reservationId": "507f1f77bcf86cd799439012",
      "userId": "507f1f77bcf86cd799439013",
      "metadata": {
        "resourceId": "507f1f77bcf86cd799439011",
        "canBook": false
      }
    }
  ],
  "legend": {
    "available": "#4CAF50",
    "reserved": "#F44336",
    "pending": "#FFC107",
    "blocked": "#9E9E9E",
    "ownReservation": "#2196F3"
  },
  "resource": {
    "id": "507f1f77bcf86cd799439011"
  },
  "metadata": {
    "totalSlots": 200,
    "availableSlots": 150,
    "reservedSlots": 40,
    "blockedSlots": 10,
    "timezone": "America/Bogota",
    "generatedAt": "2025-11-08T15:30:00Z"
  }
}
```

### 2. Vista Mensual (Atajo)

```http
GET /api/calendar/month?year=2025&month=11&resourceId=507f1f77bcf86cd799439011
Authorization: Bearer <token>
```

### 3. Vista Semanal (Atajo)

```http
GET /api/calendar/week?year=2025&week=45&resourceId=507f1f77bcf86cd799439011
Authorization: Bearer <token>
```

### 4. Vista Diaria (Atajo)

```http
GET /api/calendar/day?date=2025-11-08&resourceId=507f1f77bcf86cd799439011
Authorization: Bearer <token>
```

---

## 🎨 Códigos de Color

| Estado              | Color       | Hex       | Descripción                       |
| ------------------- | ----------- | --------- | --------------------------------- |
| **Available**       | 🟢 Verde    | `#4CAF50` | Slots disponibles para reservar   |
| **Reserved**        | 🔴 Rojo     | `#F44336` | Slots ya reservados por otros     |
| **Pending**         | 🟡 Amarillo | `#FFC107` | Reservas pendientes de aprobación |
| **Blocked**         | ⚫ Gris     | `#9E9E9E` | Slots bloqueados/mantenimiento    |
| **Own Reservation** | 🔵 Azul     | `#2196F3` | Reservas del usuario actual       |

---

## 🏗️ Arquitectura

### Flujo de Generación de Vista

```
1. Usuario solicita vista → GET /calendar/view?view=month&...
                            ↓
2. CalendarViewController recibe y valida parámetros
                            ↓
3. GetCalendarViewQuery ejecutado por QueryBus
                            ↓
4. GetCalendarViewHandler delega a CalendarViewService
                            ↓
5. CalendarViewService:
   ├─ Obtiene disponibilidades del recurso
   ├─ Obtiene reservas en el rango de fechas
   ├─ Genera slots horarios según disponibilidad
   ├─ Detecta conflictos con reservas
   ├─ Asigna estados y colores
   └─ Construye respuesta con metadata
                            ↓
6. Respuesta JSON con slots + leyenda + metadata
```

### Lógica de Asignación de Estados

```typescript
for each slot in availabilities:
  if (hay reserva en este slot):
    if (reserva.status === "PENDING"):
      status = PENDING
    else if (reserva.userId === currentUserId):
      status = OWN_RESERVATION
    else:
      status = RESERVED
  else:
    status = AVAILABLE

color = SlotColorService.getColorByStatus(status, isOwnReservation)
```

---

## 📊 Metadatos de Respuesta

Cada vista incluye metadatos útiles para el frontend:

```typescript
{
  metadata: {
    totalSlots: number; // Total de slots generados
    availableSlots: number; // Slots disponibles
    reservedSlots: number; // Slots reservados
    blockedSlots: number; // Slots bloqueados
    timezone: string; // Zona horaria (ej: "America/Bogota")
    generatedAt: string; // Timestamp de generación
  }
}
```

---

## 🔍 Ejemplos de Uso

### Integración con React Calendar

```typescript
import { Calendar } from "react-calendar";
import { useCalendarView } from "@/hooks/useCalendarView";

function ResourceCalendar({ resourceId }: { resourceId: string }) {
  const { data, isLoading } = useCalendarView({
    view: "month",
    year: 2025,
    month: 11,
    resourceId,
  });

  if (isLoading) return <Spinner />;

  return (
    <div>
      <Calendar
        tileClassName={({ date }) => {
          const dateStr = date.toISOString().split("T")[0];
          const slot = data.slots.find((s) => s.date === dateStr);
          return slot ? `slot-${slot.status}` : "";
        }}
        tileContent={({ date }) => {
          const dateStr = date.toISOString().split("T")[0];
          const slotsForDate = data.slots.filter((s) => s.date === dateStr);
          return (
            <div className="slots-summary">
              {slotsForDate.length} slots
            </div>
          );
        }}
      />

      {/* Leyenda */}
      <div className="legend">
        {Object.entries(data.legend).map(([status, color]) => (
          <div key={status}>
            <span style={{ backgroundColor: color }}></span>
            {status}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Integración con FullCalendar

```typescript
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";

function FullResourceCalendar({ resourceId }: { resourceId: string }) {
  const { data } = useCalendarView({
    view: "month",
    year: 2025,
    month: 11,
    resourceId,
  });

  const events = data.slots.map((slot) => ({
    id: slot.reservationId || `slot-${slot.date}-${slot.startTime}`,
    title:
      slot.status === "available"
        ? "Disponible"
        : slot.status === "reserved"
        ? "Reservado"
        : "Pendiente",
    start: `${slot.date}T${slot.startTime}:00`,
    end: `${slot.date}T${slot.endTime}:00`,
    backgroundColor: slot.color,
    borderColor: slot.color,
    extendedProps: {
      canBook: slot.metadata.canBook,
      resourceId: slot.metadata.resourceId,
    },
  }));

  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin]}
      initialView="dayGridMonth"
      events={events}
      headerToolbar={{
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,timeGridWeek,timeGridDay",
      }}
    />
  );
}
```

---

## 🧪 Testing

### Ejemplo de Test Unitario

```typescript
describe("CalendarViewService", () => {
  it("debe generar vista mensual con todos los slots", async () => {
    const dto: CalendarViewDto = {
      view: CalendarViewType.MONTH,
      year: 2025,
      month: 11,
      resourceId: "507f1f77bcf86cd799439011",
    };

    const result = await service.generateCalendarView(dto, "user-123");

    expect(result.view).toBe("month");
    expect(result.period.start).toBe("2025-11-01T00:00:00Z");
    expect(result.period.end).toBe("2025-11-30T23:59:59Z");
    expect(result.slots.length).toBeGreaterThan(0);
    expect(result.metadata.totalSlots).toBe(result.slots.length);
  });

  it("debe detectar reservas propias del usuario", async () => {
    const currentUserId = "user-123";
    // Mock: crear reserva del usuario
    const result = await service.generateCalendarView(dto, currentUserId);

    const ownSlots = result.slots.filter(
      (s) => s.status === SlotStatus.OWN_RESERVATION
    );
    expect(ownSlots.length).toBeGreaterThan(0);
    expect(ownSlots[0].color).toBe(CALENDAR_COLORS.OWN_RESERVATION);
  });
});
```

---

## 📈 Performance

### Optimizaciones Implementadas

- ✅ **Consultas eficientes**: Solo se buscan disponibilidades y reservas del recurso específico
- ✅ **Generación lazy**: Los slots se generan bajo demanda según la vista solicitada
- ✅ **Paginación de resultados**: Límite de 10,000 slots por vista (seguridad)
- ✅ **Cache recomendado**: Se puede cachear en Redis con TTL de 5 minutos

### Métricas Esperadas

- Vista mensual: ~200-400 slots (30 días × 8-12 horas/día)
- Vista semanal: ~50-100 slots (7 días × 8-12 horas/día)
- Vista diaria: ~10-20 slots (8-12 horas de disponibilidad)

---

## 🔗 Integración con Otros Servicios

### Resources Service

- Obtiene información del recurso (nombre, tipo, capacidad) vía Event Bus
- Escucha eventos `resource.updated` para invalidar cache

### Availability Service (interno)

- Usa `AvailabilityRepository` para obtener horarios configurados
- Respeta excepciones y mantenimientos programados

### Reservations (interno)

- Usa `ReservationRepository` para detectar conflictos
- Marca slots como reservados automáticamente

---

## ✅ Criterios de Aceptación Cumplidos

- [x] Vista mensual con todos los días del mes
- [x] Vista semanal con 7 días (ISO 8601)
- [x] Vista diaria con slots horarios
- [x] Códigos de color por estado (5 estados diferentes)
- [x] Detección de reservas propias del usuario
- [x] Metadatos enriquecidos para frontend
- [x] Leyenda de colores incluida
- [x] Información de capacidad y disponibilidad
- [x] Respuesta optimizada para renderizado
- [x] Documentación Swagger completa
- [x] Validación de parámetros con class-validator

---

## 📚 Documentación Adicional

- [RF-10: Requisitos](/apps/availability-service/docs/requirements/RF-10_VISUALIZACION_CALENDARIO.md)
- [PENDING_FEATURES_PLAN.md](/apps/availability-service/docs/PENDING_FEATURES_PLAN.md)
- [API Swagger](http://localhost:3003/api/docs)

---

**Última Actualización**: Noviembre 8, 2025  
**Implementado por**: Bookly Development Team  
**Estado**: ✅ Production Ready
