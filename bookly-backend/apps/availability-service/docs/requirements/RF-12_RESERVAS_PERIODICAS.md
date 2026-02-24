# RF-12: Reservas Periódicas

**Estado**: ✅ Completado

**Prioridad**: Alta

**Fecha de Implementación**: Noviembre 4, 2025

---

## 📋 Descripción

Soporte para reservas recurrentes usando formato iCalendar RRULE (RFC 5545) permitiendo patrones complejos de recurrencia (diaria, semanal, mensual) con opciones de modificación y cancelación flexible.

---

## ✅ Criterios de Aceptación

- [x] Soporte completo de RRULE estándar (RFC 5545)
- [x] Frecuencias: DAILY, WEEKLY, MONTHLY, YEARLY
- [x] Parámetros: UNTIL (fecha fin) o COUNT (número de ocurrencias)
- [x] BYDAY para especificar días de la semana
- [x] INTERVAL para frecuencia personalizada
- [x] Modificar serie completa o instancia individual
- [x] Cancelar serie o instancia específica
- [x] Validación de disponibilidad para cada ocurrencia

---

## 🏗️ Implementación

### Componentes Desarrollados

**Services**:

- `RecurrenceService` - Parser y generador de RRULE
- `SeriesManagementService` - Gestión de series

**Commands**:

- `CreateRecurrentReservationCommand` - Crear serie
- `ModifySeriesCommand` - Modificar serie completa
- `ModifyInstanceCommand` - Modificar instancia
- `CancelSeriesCommand` - Cancelar serie

---

### Formato RRULE

```
RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR;UNTIL=20251231T235959Z
RRULE:FREQ=DAILY;INTERVAL=2;COUNT=10
RRULE:FREQ=MONTHLY;BYMONTHDAY=15;COUNT=12
```

### Ejemplos

```json
{
  "resourceId": "xxx",
  "startTime": "09:00",
  "endTime": "10:00",
  "recurrenceRule": "FREQ=WEEKLY;BYDAY=MO,WE,FR;COUNT=10",
  "exceptions": ["2025-11-15"]
}
```

---

## 🗄️ Base de Datos

```prisma
model Reservation {
  recurrenceRule  String?
  seriesId        String?  @db.ObjectId
  isRecurring     Boolean  @default(false)
  exceptionDates  String[] // Fechas excluidas
}
```

---

## ⚡ Performance

- Generación lazy de ocurrencias futuras
- Cache de cálculos de recurrencia
- Validación asíncrona de disponibilidad

---

## 📚 Documentación Relacionada

- [RFC 5545 - iCalendar](https://tools.ietf.org/html/rfc5545)

---

**Mantenedor**: Bookly Development Team
