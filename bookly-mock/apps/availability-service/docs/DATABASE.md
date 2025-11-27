# 🗄️ Availability Service - Base de Datos

**Fecha**: Noviembre 6, 2025  
**Versión**: 1.0

---

## 📋 Índice

- [Visión General](#visión-general)
- [Esquema de Datos](#esquema-de-datos)
- [Entidades Principales](#entidades-principales)
- [Relaciones](#relaciones)
- [Índices](#índices)

---

## 🎯 Visión General

El Availability Service gestiona reservas, disponibilidad de recursos y reasignaciones automáticas usando **MongoDB** con **Prisma**.

### Estadísticas

- **Colecciones**: 6 principales
- **Índices**: 18 optimizados
- **Volumen estimado**: 10,000-50,000 reservas/año

---

## 📊 Esquema de Datos

```prisma
// Reserva de recurso
model Reservation {
  id              String   @id @default(auto()) @map("_id") @db.ObjectId

  // Recurso y usuario
  resourceId      String   @db.ObjectId
  userId          String   @db.ObjectId

  // Fechas
  startDate       DateTime
  endDate         DateTime

  // Información
  purpose         String
  description     String?
  attendees       Int      @default(1)

  // Estado
  status          String   @default("PENDING") // PENDING, CONFIRMED, CANCELLED, COMPLETED

  // Aprobación
  requiresApproval Boolean @default(false)
  approvedBy      String?  @db.ObjectId
  approvedAt      DateTime?

  // Recurrencia
  isRecurring     Boolean  @default(false)
  recurrenceRule  Json?    // RRULE format
  parentReservationId String? @db.ObjectId

  // Auditoría
  createdBy       String   @db.ObjectId
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  cancelledAt     DateTime?
  cancelledBy     String?  @db.ObjectId
  cancellationReason String?

  // Relaciones
  history         ReservationHistory[]

  @@index([resourceId])
  @@index([userId])
  @@index([status])
  @@index([startDate])
  @@index([endDate])
  @@index([resourceId, startDate, endDate])
  @@map("reservations")
}

// Disponibilidad de recursos
model Availability {
  id              String   @id @default(auto()) @map("_id") @db.ObjectId
  resourceId      String   @db.ObjectId

  // Horario regular
  dayOfWeek       Int      // 0 = Sunday, 6 = Saturday
  startTime       String   // HH:mm format
  endTime         String   // HH:mm format
  isAvailable     Boolean  @default(true)

  // Excepciones (días específicos)
  exceptionDate   DateTime?
  exceptionReason String?

  // Metadata
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([resourceId])
  @@index([dayOfWeek])
  @@index([exceptionDate])
  @@map("availabilities")
}

// Historial de reservas
model ReservationHistory {
  id              String   @id @default(auto()) @map("_id") @db.ObjectId
  reservationId   String   @db.ObjectId
  reservation     Reservation @relation(fields: [reservationId], references: [id])

  // Acción
  action          String   // CREATED, UPDATED, CANCELLED, COMPLETED, APPROVED, REJECTED
  performedBy     String   @db.ObjectId
  timestamp       DateTime @default(now())

  // Cambios
  previousData    Json?
  newData         Json?

  // Metadata
  ip              String?
  userAgent       String?

  @@index([reservationId])
  @@index([timestamp])
  @@map("reservation_history")
}

// Lista de espera
model Waitlist {
  id              String   @id @default(auto()) @map("_id") @db.ObjectId

  // Usuario y recurso
  userId          String   @db.ObjectId
  resourceId      String   @db.ObjectId

  // Fechas deseadas
  desiredStartDate DateTime
  desiredEndDate   DateTime

  // Prioridad
  priority        Int      @default(0)

  // Estado
  status          String   @default("WAITING") // WAITING, NOTIFIED, RESERVED, EXPIRED

  // Notificación
  notifiedAt      DateTime?
  expiresAt       DateTime

  // Auditoría
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([resourceId])
  @@index([userId])
  @@index([status])
  @@index([expiresAt])
  @@map("waitlist")
}

// Solicitudes de reasignación
model ReassignmentRequest {
  id                  String   @id @default(auto()) @map("_id") @db.ObjectId

  // Reserva original
  originalReservationId String @db.ObjectId
  originalResourceId    String @db.ObjectId

  // Recurso sugerido
  suggestedResourceId String? @db.ObjectId

  // Razón
  reason              String

  // Estado
  status              String   @default("PENDING") // PENDING, ACCEPTED, REJECTED, AUTO_PROCESSED

  // Respuesta
  responseBy          String?  @db.ObjectId
  responseAt          DateTime?
  responseMessage     String?

  // Auditoría
  requestedBy         String   @db.ObjectId
  requestedAt         DateTime @default(now())

  @@index([originalReservationId])
  @@index([status])
  @@map("reassignment_requests")
}

// Integración con calendarios externos
model CalendarIntegration {
  id              String   @id @default(auto()) @map("_id") @db.ObjectId

  // Usuario
  userId          String   @db.ObjectId

  // Proveedor
  provider        String   // GOOGLE, OUTLOOK, ICAL

  // Credenciales
  accessToken     String
  refreshToken    String?
  expiresAt       DateTime?

  // Configuración
  syncEnabled     Boolean  @default(true)
  calendarId      String   // ID del calendario externo

  // Estado
  lastSync        DateTime?
  syncErrors      String?

  // Auditoría
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([userId])
  @@index([provider])
  @@map("calendar_integrations")
}
```

---

## 📦 Entidades Principales

### 1. Reservation

**Estados**:

- `PENDING`: Esperando aprobación
- `CONFIRMED`: Confirmada
- `CANCELLED`: Cancelada
- `COMPLETED`: Completada

**Ejemplo**:

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "resourceId": "507f1f77bcf86cd799439020",
  "userId": "507f1f77bcf86cd799439030",
  "startDate": "2025-11-10T14:00:00Z",
  "endDate": "2025-11-10T16:00:00Z",
  "purpose": "Clase de Matemáticas",
  "attendees": 35,
  "status": "CONFIRMED",
  "requiresApproval": false,
  "isRecurring": false,
  "createdAt": "2025-11-05T10:00:00Z"
}
```

---

### 2. Availability

Horarios disponibles por día de semana.

**Ejemplo**:

```json
{
  "_id": "507f1f77bcf86cd799439040",
  "resourceId": "507f1f77bcf86cd799439020",
  "dayOfWeek": 1,
  "startTime": "07:00",
  "endTime": "22:00",
  "isAvailable": true
}
```

---

### 3. Waitlist

Lista de espera para recursos ocupados.

**Ejemplo**:

```json
{
  "_id": "507f1f77bcf86cd799439050",
  "userId": "507f1f77bcf86cd799439030",
  "resourceId": "507f1f77bcf86cd799439020",
  "desiredStartDate": "2025-11-12T14:00:00Z",
  "desiredEndDate": "2025-11-12T16:00:00Z",
  "priority": 5,
  "status": "WAITING",
  "expiresAt": "2025-11-11T23:59:59Z"
}
```

---

## 🔗 Relaciones

### Reservation ↔ ReservationHistory

- **Tipo**: One-to-Many
- **Cascada**: Mantener historial

```typescript
const reservation = await prisma.reservation.findUnique({
  where: { id: reservationId },
  include: {
    history: {
      orderBy: { timestamp: "desc" },
    },
  },
});
```

---

## 🔍 Índices

### Reservation

```javascript
db.reservations.createIndex({ resourceId: 1, startDate: 1, endDate: 1 });
db.reservations.createIndex({ userId: 1 });
db.reservations.createIndex({ status: 1 });
db.reservations.createIndex({ startDate: 1 });
db.reservations.createIndex({ endDate: 1 });
```

### Availability

```javascript
db.availabilities.createIndex({ resourceId: 1, dayOfWeek: 1 });
db.availabilities.createIndex({ exceptionDate: 1 });
```

### Waitlist

```javascript
db.waitlist.createIndex({ resourceId: 1, status: 1 });
db.waitlist.createIndex({ expiresAt: 1 });
```

---

## 📚 Referencias

- [Arquitectura](ARCHITECTURE.md)
- [Endpoints](ENDPOINTS.md)

---

**Mantenedores**: Bookly Development Team  
**Última actualización**: Noviembre 6, 2025
