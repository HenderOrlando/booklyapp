# Availability Service - Documentación Técnica

## 📋 Descripción General

El **Availability Service** es el microservicio encargado de gestionar la disponibilidad de recursos, reservas y listas de espera dentro del ecosistema Bookly. Implementa lógica compleja de validación de conflictos, búsqueda avanzada y gestión de listas de espera automáticas.

**Puerto:** 3003  
**Base Path:** `/api/v1`  
**Documentación Swagger:** `http://localhost:3003/api/docs`

## 🏗️ Arquitectura

### Clean Architecture + CQRS + Event-Driven

```
┌─────────────────────────────────────────────────────────────┐
│                    Availability Service                     │
├─────────────────────────────────────────────────────────────┤
│  Infrastructure Layer                                       │
│  ├── Controllers (REST)                                     │
│  │   ├── ReservationsController                             │
│  │   ├── AvailabilitiesController                           │
│  │   └── WaitingListsController                             │
│  ├── Repositories (MongoDB)                                 │
│  │   ├── ReservationRepository                              │
│  │   ├── AvailabilityRepository                             │
│  │   └── WaitingListRepository                              │
│  ├── Schemas (Mongoose)                                     │
│  └── DTOs (Validation)                                      │
├─────────────────────────────────────────────────────────────┤
│  Application Layer                                          │
│  ├── Commands (Write Operations)                            │
│  ├── Queries (Read Operations)                              │
│  ├── Handlers (CQRS)                                        │
│  └── Services (Business Logic)                              │
│      ├── ReservationService                                 │
│      ├── AvailabilityService                                │
│      └── WaitingListService                                 │
├─────────────────────────────────────────────────────────────┤
│  Domain Layer                                               │
│  ├── Entities                                               │
│  │   ├── ReservationEntity                                  │
│  │   ├── AvailabilityEntity                                 │
│  │   └── WaitingListEntity                                  │
│  └── Repository Interfaces                                  │
└─────────────────────────────────────────────────────────────┘
```

## 📦 Modelos de Dominio

### ReservationEntity

Representa una reserva de recurso con validación de disponibilidad.

**Campos principales:**

- `resourceId`: ID del recurso reservado
- `userId`: ID del usuario que reserva
- `startDate`, `endDate`: Período de reserva
- `status`: Estado (PENDING, CONFIRMED, CANCELLED, COMPLETED, NO_SHOW)
- `purpose`: Propósito de la reserva
- `attendeesCount`: Número de asistentes
- `metadata`: Datos adicionales flexibles
- `cancellationReason`: Motivo de cancelación
- `checkInTime`, `checkOutTime`: Control de acceso

**Estados del ciclo de vida:**

```
PENDING → CONFIRMED → COMPLETED
              ↓
          CANCELLED / NO_SHOW
```

### AvailabilityEntity

Define reglas de disponibilidad para recursos.

**Campos principales:**

- `resourceId`: Recurso al que aplica
- `dayOfWeek`: Día de la semana (0-6)
- `startTime`, `endTime`: Horario disponible
- `isAvailable`: Si está disponible
- `maxCapacity`: Capacidad máxima
- `minAdvanceBooking`, `maxAdvanceBooking`: Ventana de reserva
- `allowRecurring`: Permite reservas recurrentes

### WaitingListEntity

Gestiona listas de espera cuando no hay disponibilidad.

**Campos principales:**

- `resourceId`: Recurso deseado
- `userId`: Usuario en espera
- `desiredStartDate`, `desiredEndDate`: Período deseado
- `status`: Estado (WAITING, NOTIFIED, EXPIRED, CANCELLED)
- `priority`: Prioridad en la lista
- `notificationAttempts`: Intentos de notificación
- `expiresAt`: Fecha de expiración

## 🔌 API Endpoints

### Reservations Controller

#### POST `/api/v1/reservations`

Crear una nueva reserva.

**Request Body:**

```json
{
  "resourceId": "507f1f77bcf86cd799439011",
  "userId": "507f1f77bcf86cd799439012",
  "startDate": "2024-11-10T09:00:00Z",
  "endDate": "2024-11-10T11:00:00Z",
  "purpose": "Reunión de equipo",
  "attendeesCount": 10,
  "metadata": {
    "department": "Engineering",
    "equipment": ["projector", "whiteboard"]
  }
}
```

**Response:**

```json
{
  "id": "507f1f77bcf86cd799439013",
  "resourceId": "507f1f77bcf86cd799439011",
  "userId": "507f1f77bcf86cd799439012",
  "startDate": "2024-11-10T09:00:00.000Z",
  "endDate": "2024-11-10T11:00:00.000Z",
  "status": "CONFIRMED",
  "purpose": "Reunión de equipo",
  "attendeesCount": 10,
  "createdAt": "2024-11-03T20:00:00.000Z"
}
```

#### GET `/api/v1/reservations`

Listar reservas con filtros y paginación.

**Query Parameters:**

- `page`: Número de página (default: 1)
- `limit`: Resultados por página (default: 10)
- `resourceId`: Filtrar por recurso
- `userId`: Filtrar por usuario
- `status`: Filtrar por estado
- `startDate`: Desde fecha
- `endDate`: Hasta fecha

**Response:**

```json
{
  "reservations": [...],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

#### GET `/api/v1/reservations/:id`

Obtener reserva por ID.

#### PATCH `/api/v1/reservations/:id`

Actualizar reserva (solo si está PENDING o CONFIRMED).

#### DELETE `/api/v1/reservations/:id`

Cancelar reserva.

**Request Body:**

```json
{
  "reason": "Cambio de planes"
}
```

#### POST `/api/v1/reservations/:id/check-in`

Registrar check-in del usuario.

#### POST `/api/v1/reservations/:id/check-out`

Registrar check-out del usuario.

#### POST `/api/v1/reservations/:id/mark-no-show`

Marcar como no presentado (para penalizaciones).

#### GET `/api/v1/reservations/conflicts`

Buscar conflictos de disponibilidad.

**Query Parameters:**

- `resourceId`: ID del recurso (required)
- `startDate`: Inicio (required)
- `endDate`: Fin (required)
- `excludeReservationId`: Excluir reserva específica

### Availabilities Controller

#### POST `/api/v1/availabilities`

Configurar disponibilidad de un recurso.

**Request Body:**

```json
{
  "resourceId": "507f1f77bcf86cd799439011",
  "dayOfWeek": 1,
  "startTime": "08:00",
  "endTime": "18:00",
  "isAvailable": true,
  "maxCapacity": 50,
  "minAdvanceBooking": 1,
  "maxAdvanceBooking": 30,
  "allowRecurring": true
}
```

#### GET `/api/v1/availabilities`

Listar reglas de disponibilidad.

**Query Parameters:**

- `page`, `limit`: Paginación
- `resourceId`: Filtrar por recurso
- `dayOfWeek`: Filtrar por día

#### GET `/api/v1/availabilities/:id`

Obtener regla por ID.

#### PATCH `/api/v1/availabilities/:id`

Actualizar regla de disponibilidad.

#### DELETE `/api/v1/availabilities/:id`

Eliminar regla.

#### GET `/api/v1/availabilities/resource/:resourceId`

Obtener disponibilidad completa de un recurso (7 días).

#### GET `/api/v1/availabilities/check`

Verificar si un período está disponible.

**Query Parameters:**

- `resourceId`: ID del recurso
- `startDate`: Inicio
- `endDate`: Fin

**Response:**

```json
{
  "available": true,
  "conflicts": [],
  "availabilityRules": [...]
}
```

### Waiting Lists Controller

#### POST `/api/v1/waiting-lists`

Agregar usuario a lista de espera.

**Request Body:**

```json
{
  "resourceId": "507f1f77bcf86cd799439011",
  "userId": "507f1f77bcf86cd799439012",
  "desiredStartDate": "2024-11-10T09:00:00Z",
  "desiredEndDate": "2024-11-10T11:00:00Z",
  "priority": 5,
  "expiresAt": "2024-11-15T23:59:59Z"
}
```

#### GET `/api/v1/waiting-lists`

Listar listas de espera.

**Query Parameters:**

- `page`, `limit`: Paginación
- `resourceId`: Por recurso
- `userId`: Por usuario
- `status`: Por estado

#### GET `/api/v1/waiting-lists/:id`

Obtener entrada por ID.

#### POST `/api/v1/waiting-lists/:id/notify`

Notificar disponibilidad al usuario.

#### POST `/api/v1/waiting-lists/:id/cancel`

Cancelar entrada en lista de espera.

#### POST `/api/v1/waiting-lists/process`

Procesar automáticamente listas de espera (cron job).

**Response:**

```json
{
  "processed": 5,
  "notified": 3,
  "expired": 2
}
```

## 🔄 Casos de Uso Principales

### 1. Crear Reserva con Validación

**Flujo:**

1. Usuario envía solicitud de reserva
2. Sistema valida disponibilidad del recurso
3. Sistema verifica conflictos con reservas existentes
4. Sistema valida reglas de disponibilidad (horarios, capacidad)
5. Si pasa validación → Reserva CONFIRMED
6. Si falla → Error 400 con detalles

**Validaciones:**

- Recurso existe y está activo
- Fechas válidas (inicio < fin)
- No hay conflictos con otras reservas
- Cumple reglas de disponibilidad del recurso
- Usuario no tiene penalizaciones activas

### 2. Lista de Espera Automática

**Flujo:**

1. Usuario intenta reservar pero no hay disponibilidad
2. Sistema ofrece agregar a lista de espera
3. Usuario acepta y se registra con prioridad
4. Cuando se cancela una reserva:
   - Sistema busca usuarios en lista de espera
   - Ordena por prioridad
   - Notifica al primer usuario
   - Usuario tiene tiempo limitado para confirmar
5. Si usuario no confirma → Se notifica al siguiente

### 3. Check-in / Check-out

**Flujo:**

1. Usuario llega al recurso
2. Sistema registra check-in con timestamp
3. Usuario termina de usar recurso
4. Sistema registra check-out con timestamp
5. Sistema actualiza estadísticas de uso real

**Propósito:**

- Control de acceso físico
- Estadísticas de uso real vs reservado
- Detectar no-shows para penalizaciones

## 🔧 Configuración

### Variables de Entorno

```bash
# MongoDB
MONGODB_URI_AVAILABILITY=mongodb://bookly:bookly123@localhost:27017/availability?replicaSet=bookly-rs

# JWT
JWT_SECRET=bookly-secret-key
JWT_EXPIRATION=24h

# Server
PORT=3003
CORS_ORIGIN=*

# Business Rules
MIN_ADVANCE_BOOKING_HOURS=1
MAX_ADVANCE_BOOKING_DAYS=90
MAX_RESERVATION_DURATION_HOURS=8
WAITING_LIST_EXPIRATION_HOURS=24
```

### Índices de MongoDB

**Reservations Collection:**

- `{ resourceId: 1, startDate: 1, endDate: 1 }` - Búsqueda de conflictos
- `{ userId: 1, status: 1 }` - Reservas por usuario
- `{ status: 1, startDate: -1 }` - Ordenamiento
- `{ resourceId: 1, status: 1, startDate: 1 }` - Compuesto

**Availabilities Collection:**

- `{ resourceId: 1, dayOfWeek: 1 }` - Búsqueda rápida
- `{ resourceId: 1 }` - Por recurso

**WaitingLists Collection:**

- `{ resourceId: 1, status: 1, priority: -1 }` - Ordenamiento por prioridad
- `{ userId: 1, status: 1 }` - Por usuario
- `{ expiresAt: 1 }` - TTL index para expiración automática

## 📊 Eventos Publicados

El servicio publica eventos de dominio que otros servicios pueden consumir:

- `ReservationCreated`: Nueva reserva creada
- `ReservationUpdated`: Reserva actualizada
- `ReservationCancelled`: Reserva cancelada
- `ReservationCompleted`: Reserva completada
- `NoShowRecorded`: Usuario no se presentó
- `CheckInRecorded`: Usuario hizo check-in
- `CheckOutRecorded`: Usuario hizo check-out
- `WaitingListEntryCreated`: Usuario agregado a lista de espera
- `WaitingListEntryNotified`: Usuario notificado de disponibilidad

## 🧪 Ejemplos de Uso

### Crear Reserva y Manejar Conflictos

```typescript
// Cliente
const response = await fetch("http://localhost:3003/api/v1/reservations", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer <token>",
  },
  body: JSON.stringify({
    resourceId: "507f1f77bcf86cd799439011",
    userId: "507f1f77bcf86cd799439012",
    startDate: "2024-11-10T09:00:00Z",
    endDate: "2024-11-10T11:00:00Z",
    purpose: "Clase de programación",
    attendeesCount: 30,
  }),
});

if (response.status === 400) {
  const error = await response.json();
  if (error.code === "RESERVATION_CONFLICT") {
    // Ofrecer lista de espera
    console.log("Recurso no disponible. ¿Desea entrar en lista de espera?");
  }
}
```

### Verificar Disponibilidad

```typescript
const available = await fetch(
  "http://localhost:3003/api/v1/availabilities/check?" +
    "resourceId=507f1f77bcf86cd799439011&" +
    "startDate=2024-11-10T09:00:00Z&" +
    "endDate=2024-11-10T11:00:00Z",
  {
    headers: { Authorization: "Bearer <token>" },
  }
);

const result = await available.json();
console.log("Disponible:", result.available);
console.log("Conflictos:", result.conflicts);
```

## 🔒 Seguridad

- **JWT Authentication**: Todos los endpoints requieren token válido
- **Authorization**: Validación de roles y permisos
- **Rate Limiting**: Prevención de abuso
- **Input Validation**: class-validator en todos los DTOs
- **SQL Injection**: Uso de ODM (Mongoose) previene inyecciones

## 📈 Métricas y Monitoreo

- Logs estructurados con Winston
- Trazabilidad con correlation IDs
- Métricas de rendimiento (tiempo de respuesta)
- Alertas en Sentry para errores críticos
- Estadísticas de uso por recurso

## 🚀 Despliegue

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod

# Docker
docker-compose up availability-service
```

## 🔗 Dependencias con Otros Servicios

- **Resources Service**: Valida que recursos existan y estén activos
- **Auth Service**: Valida tokens JWT y permisos de usuario
- **Stockpile Service**: Recibe eventos para flujos de aprobación
- **Reports Service**: Provee datos de reservas para reportes

---

**Versión:** 1.0.0  
**Última actualización:** Noviembre 2024  
**Mantenido por:** Equipo Bookly
