# RF-12: Reservas Recurrentes (Periódicas)

**Fecha**: 2025-01-04  
**Estado**: 🚧 **EN DESARROLLO**  
**Servicio**: `availability-service`  
**Prioridad**: 🔴 **CRÍTICA**

---

## 📋 Objetivo

Permitir a los usuarios crear reservas recurrentes (diarias, semanales, mensuales) con una sola solicitud, generando automáticamente todas las instancias necesarias y validando disponibilidad para toda la serie.

---

## 🎯 Casos de Uso

### CU-12.1: Crear Reserva Recurrente

**Actor**: Usuario autenticado

**Precondiciones**:

- Usuario autenticado con permisos de reserva
- Recurso existe y está activo
- Recurso permite reservas recurrentes (`allowRecurring: true`)

**Flujo Principal**:

1. Usuario especifica:
   - Recurso a reservar
   - Fecha/hora de inicio de la primera instancia
   - Duración de cada instancia
   - Patrón de recurrencia (frequency, interval, daysOfWeek)
   - Fecha de finalización de la serie
2. Sistema valida patrón de recurrencia
3. Sistema genera lista de fechas según patrón
4. Sistema valida disponibilidad para cada instancia
5. Sistema crea reserva padre (master) con `isRecurring: true`
6. Sistema crea instancias hijas vinculadas
7. Sistema publica evento `RECURRING_RESERVATION_CREATED`
8. Sistema retorna serie completa creada

**Flujo Alternativo A**: Conflicto en alguna instancia

- 4a. Sistema detecta conflicto en fecha N
- 4b. Sistema retorna error con fechas conflictivas
- 4c. Usuario puede optar por crear solo instancias sin conflicto

**Postcondiciones**:

- Serie de reservas creada en estado PENDING
- Todas las instancias vinculadas con `seriesId`
- Notificaciones enviadas para aprobación (si aplica)

---

### CU-12.2: Modificar Serie Completa

**Actor**: Usuario propietario o administrador

**Flujo Principal**:

1. Usuario selecciona opción "Modificar toda la serie"
2. Usuario modifica: horario, duración, o propósito
3. Sistema valida disponibilidad para todas las instancias futuras
4. Sistema actualiza todas las instancias no completadas
5. Sistema publica evento `RECURRING_RESERVATION_UPDATED`

---

### CU-12.3: Cancelar Serie Completa

**Actor**: Usuario propietario o administrador

**Flujo Principal**:

1. Usuario selecciona opción "Cancelar toda la serie"
2. Sistema cancela todas las instancias futuras (status: CANCELLED)
3. Sistema publica evento `RECURRING_RESERVATION_CANCELLED`
4. Sistema envía notificaciones

---

### CU-12.4: Modificar/Cancelar Instancia Individual

**Actor**: Usuario propietario o administrador

**Flujo Principal**:

1. Usuario selecciona una instancia específica
2. Usuario modifica o cancela solo esa instancia
3. Sistema marca instancia como "excepción de la serie"
4. Sistema publica evento `RECURRING_INSTANCE_MODIFIED`
5. Resto de la serie permanece intacta

---

## 🏗️ Arquitectura Técnica

### Modelo de Datos Extendido

```typescript
interface RecurringReservation extends Reservation {
  isRecurring: true;
  seriesId: string; // Identificador único de la serie
  parentReservationId?: string; // null para master, ObjectId para instancias
  instanceNumber?: number; // Número de instancia (1, 2, 3...)

  recurringPattern: {
    frequency: "daily" | "weekly" | "monthly";
    interval: number; // cada N días/semanas/meses
    endDate?: Date; // fecha final de la serie
    occurrences?: number; // O número de ocurrencias
    daysOfWeek?: number[]; // 0=domingo, 1=lunes, ..., 6=sábado
    monthDay?: number; // día del mes (1-31) para monthly
  };

  exceptions?: {
    date: Date;
    reason: string; // "cancelled", "modified", "rescheduled"
    modifiedTo?: Date;
  }[];
}
```

### Patrones de Recurrencia Soportados

| Tipo        | Descripción                        | Ejemplo                                                           |
| ----------- | ---------------------------------- | ----------------------------------------------------------------- |
| **Daily**   | Cada N días                        | Cada 1 día = Diario<br>Cada 2 días = Cada dos días                |
| **Weekly**  | Cada N semanas en días específicos | Cada 1 semana los Lunes y Miércoles<br>Cada 2 semanas los Viernes |
| **Monthly** | Cada N meses en día específico     | Cada 1 mes el día 15<br>Cada 3 meses el primer día                |

---

## 🔧 Componentes a Implementar

### 1. DTOs

#### `CreateRecurringReservationDto`

```typescript
export class CreateRecurringReservationDto {
  resourceId: string;
  startDate: string; // ISO 8601
  endDate: string; // Hora de finalización de cada instancia
  purpose: string;

  recurrencePattern: {
    frequency: "daily" | "weekly" | "monthly";
    interval: number;
    endDate?: string; // Fecha final de la serie
    occurrences?: number; // O número de ocurrencias
    daysOfWeek?: number[]; // Solo para weekly
    monthDay?: number; // Solo para monthly
  };

  participants?: ParticipantDto[];
  notes?: string;
  createAllOrNone?: boolean; // true = falla si alguna instancia tiene conflicto
}
```

#### `RecurringReservationResponseDto`

```typescript
export class RecurringReservationResponseDto {
  seriesId: string;
  masterReservation: ReservationDto;
  instances: ReservationInstanceDto[];
  totalInstances: number;
  successfulInstances: number;
  failedInstances: {
    date: string;
    reason: string;
  }[];
  pattern: RecurrencePatternDto;
}
```

---

### 2. Commands CQRS

#### `CreateRecurringReservationCommand`

```typescript
export class CreateRecurringReservationCommand {
  constructor(
    public readonly dto: CreateRecurringReservationDto,
    public readonly userId: string
  ) {}
}
```

#### `UpdateRecurringSeriesCommand`

```typescript
export class UpdateRecurringSeriesCommand {
  constructor(
    public readonly seriesId: string,
    public readonly updates: Partial<CreateRecurringReservationDto>,
    public readonly userId: string,
    public readonly updateAll: boolean = true
  ) {}
}
```

#### `CancelRecurringSeriesCommand`

```typescript
export class CancelRecurringSeriesCommand {
  constructor(
    public readonly seriesId: string,
    public readonly reason: string,
    public readonly userId: string,
    public readonly cancelAll: boolean = true,
    public readonly instanceId?: string // Para cancelar instancia específica
  ) {}
}
```

---

### 3. Queries CQRS

#### `GetRecurringSeriesQuery`

```typescript
export class GetRecurringSeriesQuery {
  constructor(
    public readonly seriesId: string,
    public readonly includeInstances: boolean = true
  ) {}
}
```

#### `GetUserRecurringReservationsQuery`

```typescript
export class GetUserRecurringReservationsQuery {
  constructor(
    public readonly userId: string,
    public readonly filters?: {
      startDate?: string;
      endDate?: string;
      status?: ReservationStatus;
    }
  ) {}
}
```

---

### 4. Service: `RecurringReservationService`

#### Responsabilidades:

1. **Generación de Instancias**
   - `generateOccurrences()`: Calcula todas las fechas según patrón
   - `validateSeriesAvailability()`: Valida disponibilidad para todas las instancias
   - `createReservationSeries()`: Crea master + instancias

2. **Gestión de Serie**
   - `updateEntireSeries()`: Actualiza todas las instancias futuras
   - `updateSingleInstance()`: Actualiza solo una instancia (crea excepción)
   - `cancelEntireSeries()`: Cancela todas las instancias futuras
   - `cancelSingleInstance()`: Cancela solo una instancia

3. **Validaciones**
   - `validateRecurrencePattern()`: Valida patrón de recurrencia
   - `checkResourceAllowsRecurring()`: Verifica que recurso permita recurrencia
   - `detectConflicts()`: Detecta conflictos para toda la serie

---

### 5. Algoritmo de Generación de Fechas

```typescript
private generateOccurrences(
  startDate: Date,
  pattern: RecurrencePattern
): Date[] {
  const occurrences: Date[] = [];
  let currentDate = new Date(startDate);

  const maxOccurrences = pattern.occurrences || 365; // Límite de seguridad
  const endDate = pattern.endDate ? new Date(pattern.endDate) : null;

  for (let i = 0; i < maxOccurrences; i++) {
    // Si hay endDate y lo superamos, parar
    if (endDate && currentDate > endDate) break;

    // Agregar ocurrencia actual
    if (this.matchesPattern(currentDate, pattern)) {
      occurrences.push(new Date(currentDate));
    }

    // Avanzar según frequency e interval
    switch (pattern.frequency) {
      case "daily":
        currentDate.setDate(currentDate.getDate() + pattern.interval);
        break;
      case "weekly":
        currentDate.setDate(currentDate.getDate() + (7 * pattern.interval));
        break;
      case "monthly":
        currentDate.setMonth(currentDate.getMonth() + pattern.interval);
        break;
    }

    // Si llegamos a occurrences especificadas, parar
    if (pattern.occurrences && occurrences.length >= pattern.occurrences) {
      break;
    }
  }

  return occurrences;
}

private matchesPattern(date: Date, pattern: RecurrencePattern): boolean {
  // Para weekly, verificar daysOfWeek
  if (pattern.frequency === "weekly" && pattern.daysOfWeek?.length) {
    const dayOfWeek = date.getDay();
    return pattern.daysOfWeek.includes(dayOfWeek);
  }

  // Para monthly, verificar monthDay
  if (pattern.frequency === "monthly" && pattern.monthDay) {
    return date.getDate() === pattern.monthDay;
  }

  // Daily siempre coincide
  return true;
}
```

---

## 📊 Eventos Kafka

### `RECURRING_RESERVATION_CREATED`

```json
{
  "eventType": "recurring_reservation.created",
  "seriesId": "series-abc123",
  "masterReservationId": "res-123",
  "resourceId": "resource-456",
  "userId": "user-789",
  "totalInstances": 12,
  "pattern": {
    "frequency": "weekly",
    "interval": 1,
    "daysOfWeek": [1, 3, 5],
    "endDate": "2025-06-30T00:00:00Z"
  },
  "timestamp": "2025-01-04T10:00:00Z"
}
```

### `RECURRING_RESERVATION_CANCELLED`

```json
{
  "eventType": "recurring_reservation.cancelled",
  "seriesId": "series-abc123",
  "cancelledBy": "user-789",
  "reason": "Cambio de plan de estudios",
  "cancelledInstances": 8,
  "timestamp": "2025-01-04T10:00:00Z"
}
```

---

## ✅ Validaciones de Negocio

| Validación                      | Regla                                                       | Mensaje de Error                                        |
| ------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------- | ------------ | ------------------------------------------------------ |
| **Recurso permite recurrencia** | `resource.allowRecurring === true`                          | "Este recurso no permite reservas recurrentes"          |
| **Intervalo válido**            | `interval >= 1 && interval <= 12`                           | "El intervalo debe estar entre 1 y 12"                  |
| **Duración de serie**           | `occurrences <= 365` o `endDate <= 1 año`                   | "La serie no puede exceder 365 instancias o 1 año"      |
| **DaysOfWeek para weekly**      | `frequency === "weekly" → daysOfWeek.length > 0`            | "Debe especificar al menos un día de la semana"         |
| **MonthDay para monthly**       | `frequency === "monthly" → monthDay >= 1 && monthDay <= 31` | "Día del mes inválido"                                  |
| **EndDate o Occurrences**       | `endDate                                                    |                                                         | occurrences` | "Debe especificar fecha final o número de ocurrencias" |
| **Disponibilidad**              | Todas las instancias sin conflictos                         | "Conflictos detectados en las siguientes fechas: [...]" |

---

## 🧪 Casos de Prueba

### Test 1: Crear reserva semanal (Lunes y Miércoles por 4 semanas)

**Input**:

```json
{
  "resourceId": "res-101",
  "startDate": "2025-01-06T08:00:00Z",
  "endDate": "2025-01-06T10:00:00Z",
  "purpose": "Clase de Programación",
  "recurrencePattern": {
    "frequency": "weekly",
    "interval": 1,
    "daysOfWeek": [1, 3],
    "occurrences": 8
  }
}
```

**Expected**: 8 instancias creadas (4 lunes + 4 miércoles)

---

### Test 2: Crear reserva diaria (Lunes a Viernes por 2 semanas)

**Input**:

```json
{
  "resourceId": "res-102",
  "startDate": "2025-01-06T14:00:00Z",
  "endDate": "2025-01-06T16:00:00Z",
  "purpose": "Laboratorio",
  "recurrencePattern": {
    "frequency": "weekly",
    "interval": 1,
    "daysOfWeek": [1, 2, 3, 4, 5],
    "endDate": "2025-01-17T23:59:59Z"
  }
}
```

**Expected**: 10 instancias (5 días × 2 semanas)

---

### Test 3: Crear reserva mensual (Primer lunes de cada mes por 6 meses)

**Input**:

```json
{
  "resourceId": "res-103",
  "startDate": "2025-01-06T09:00:00Z",
  "endDate": "2025-01-06T11:00:00Z",
  "purpose": "Reunión mensual",
  "recurrencePattern": {
    "frequency": "monthly",
    "interval": 1,
    "monthDay": 1,
    "occurrences": 6
  }
}
```

**Expected**: 6 instancias (una por mes)

---

### Test 4: Conflicto en instancia N - CreateAllOrNone = true

**Escenario**: Ya existe reserva en fecha 3 de la serie

**Expected**:

- Error con código `RECURRING_SERIES_CONFLICT`
- Lista de fechas con conflicto
- Ninguna instancia creada

---

### Test 5: Conflicto en instancia N - CreateAllOrNone = false

**Expected**:

- Instancias sin conflicto creadas
- Instancias con conflicto omitidas
- Response incluye `failedInstances`

---

### Test 6: Cancelar instancia individual sin afectar serie

**Expected**:

- Solo instancia N cancelada
- Resto de instancias activas
- Evento `RECURRING_INSTANCE_CANCELLED` publicado

---

### Test 7: Modificar toda la serie

**Input**: Cambiar horario de 8:00-10:00 a 9:00-11:00

**Expected**:

- Todas las instancias futuras actualizadas
- Instancias pasadas no modificadas
- Evento `RECURRING_SERIES_UPDATED` publicado

---

## 📈 Métricas y Performance

### Límites del Sistema

| Límite                       | Valor       | Razón                     |
| ---------------------------- | ----------- | ------------------------- |
| **Max instancias por serie** | 365         | Prevenir series infinitas |
| **Max duración de serie**    | 1 año       | Limitar proyección futura |
| **Max interval**             | 12          | Para monthly (1 año)      |
| **Timeout validación**       | 30 segundos | Para series grandes       |

### Performance Esperado

| Operación              | Instancias | Tiempo Esperado |
| ---------------------- | ---------- | --------------- |
| Crear serie            | 10         | < 500ms         |
| Crear serie            | 50         | < 2s            |
| Crear serie            | 100        | < 5s            |
| Validar disponibilidad | 50         | < 1s            |
| Cancelar serie         | 100        | < 2s            |

---

## 🔗 Referencias

- [HU-13: Reservas periódicas](../../MEMORY[bookly-modules.md])
- [Reservation Schema](../../apps/availability-service/src/infrastructure/schemas/reservation.schema.ts)
- [Create Reservation Use Case](../../apps/availability-service/src/application/use-cases/create-reservation.use-case.ts)

---

## 📋 Checklist de Implementación

### Fase 1: Modelo y DTOs ✅

- [x] Extender `Reservation` schema con `seriesId`, `parentReservationId`, `instanceNumber`
- [x] Crear `CreateRecurringReservationDto`
- [x] Crear `RecurringReservationResponseDto`
- [x] Crear `RecurrencePatternDto`
- [x] Crear DTOs adicionales (Update, Cancel, Modify, Filters)
- [x] Actualizar `ReservationEntity` con nuevos campos
- [x] Agregar índices MongoDB para series

### Fase 2: CQRS ✅

- [x] Crear `CreateRecurringReservationCommand`
- [x] Crear `UpdateRecurringSeriesCommand`
- [x] Crear `CancelRecurringSeriesCommand`
- [x] Crear `CancelRecurringInstanceCommand`
- [x] Crear `ModifyRecurringInstanceCommand`
- [x] Crear `GetRecurringSeriesQuery`
- [x] Crear `GetUserRecurringReservationsQuery`
- [x] Crear handlers para cada command/query (7 handlers)

### Fase 3: Lógica de Negocio ✅

- [x] Crear `RecurringReservationService`
- [x] Implementar `generateOccurrences()`
- [x] Implementar `validateSeriesAvailability()`
- [x] Implementar `createReservationSeries()`
- [x] Implementar `updateEntireSeries()`
- [x] Implementar `cancelEntireSeries()`
- [x] Implementar `cancelRecurringInstance()`
- [x] Implementar `modifyRecurringInstance()`
- [x] Implementar helpers de validación y generación

### Fase 4: Integración ✅

- [x] Agregar endpoint POST `/reservations/recurring`
- [x] Agregar endpoint GET `/reservations/recurring`
- [x] Agregar endpoint GET `/reservations/series/:seriesId`
- [x] Agregar endpoint PATCH `/reservations/series/:seriesId`
- [x] Agregar endpoint DELETE `/reservations/series/:seriesId`
- [x] Agregar endpoint POST `/reservations/series/instances/:id/cancel`
- [x] Agregar endpoint PATCH `/reservations/series/instances/:id`
- [x] Registrar service en AvailabilityModule
- [x] Integrar handlers en módulo principal
- [x] Implementar métodos `find` y `findOne` en Repository

### Fase 5: Testing ⏳

- [ ] Tests unitarios de `generateOccurrences()`
- [ ] Tests de validación de patrones
- [ ] Tests de conflictos
- [ ] Tests E2E de creación de series
- [ ] Tests de modificación/cancelación
- [ ] Performance tests con series grandes

### Fase 6: Documentación ✅

- [x] Swagger documentation (decoradores en controller)
- [x] Ejemplos de uso HTTP (RF12_API_ENDPOINTS.md)
- [x] Guía de patrones de recurrencia (RF12_API_ENDPOINTS.md)
- [x] Diagramas de flujo (RF12_DIAGRAMAS_FLUJO.md)
- [x] Documentación de arquitectura (RF12_RESERVAS_RECURRENTES.md)
- [x] Ejemplos con cURL y Postman

---

**Última Actualización**: 2025-01-04  
**Estado**: ✅ **IMPLEMENTADO Y OPERATIVO** (Fase 5 pendiente)  
**Progreso**: 83% completo (5/6 fases)  
**Tiempo invertido**: ~14 horas  
**Prioridad**: 🟢 Funcional - Testing pendiente
