# 🗄️ Stockpile Service - Base de Datos

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

El Stockpile Service gestiona flujos de aprobación, validaciones de reservas y notificaciones. Usa **MongoDB** con **Prisma**.

### Estadísticas

- **Colecciones**: 5 principales
- **Índices**: 12 optimizados
- **Volumen estimado**: 5,000-20,000 solicitudes/año

---

## 📊 Esquema de Datos

```prisma
// Solicitud de aprobación
model ApprovalRequest {
  id              String   @id @default(auto()) @map("_id") @db.ObjectId

  // Reserva asociada
  reservationId   String   @db.ObjectId

  // Solicitante
  requesterId     String   @db.ObjectId
  requesterName   String
  requesterEmail  String

  // Detalles de la solicitud
  purpose         String
  resourceName    String
  startDate       DateTime
  endDate         DateTime
  attendees       Int?

  // Estado
  status          String   @default("PENDING") // PENDING, APPROVED, REJECTED, EXPIRED

  // Flujo de aprobación
  approvalFlowId  String?  @db.ObjectId
  currentStep     Int      @default(1)
  totalSteps      Int      @default(1)

  // Aprobación
  approvedBy      String?  @db.ObjectId
  approvedAt      DateTime?
  approverComments String?

  // Rechazo
  rejectedBy      String?  @db.ObjectId
  rejectedAt      DateTime?
  rejectionReason String?

  // Expiración
  expiresAt       DateTime

  // Documentos generados
  approvalLetter  String?  // URL del PDF

  // Auditoría
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([reservationId])
  @@index([status])
  @@index([requesterId])
  @@index([expiresAt])
  @@index([createdAt])
  @@map("approval_requests")
}

// Flujo de aprobación configurado
model ApprovalFlow {
  id              String   @id @default(auto()) @map("_id") @db.ObjectId

  // Configuración
  name            String
  description     String?
  isActive        Boolean  @default(true)

  // Condiciones de activación
  resourceTypes   String[] // ROOM, AUDITORIUM, LAB, EQUIPMENT
  minAttendees    Int?
  requiresForAllResources Boolean @default(false)

  // Pasos del flujo (ordenados)
  steps           Json[]   // Array de { order, approverRole, approverUserId?, isOptional }

  // Auditoría
  createdBy       String   @db.ObjectId
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([isActive])
  @@map("approval_flows")
}

// Check-in/Check-out de recursos
model CheckInOut {
  id              String   @id @default(auto()) @map("_id") @db.ObjectId

  // Reserva
  reservationId   String   @db.ObjectId
  resourceId      String   @db.ObjectId
  userId          String   @db.ObjectId

  // Check-in
  checkInTime     DateTime?
  checkInBy       String?  @db.ObjectId
  checkInNotes    String?

  // Check-out
  checkOutTime    DateTime?
  checkOutBy      String?  @db.ObjectId
  checkOutNotes   String?

  // Estado del recurso
  resourceCondition String? // GOOD, DAMAGED, NEEDS_MAINTENANCE
  incidentReport  String?

  // Geolocalización
  checkInLocation Json?    // { lat, lng }
  checkOutLocation Json?

  // Auditoría
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([reservationId])
  @@index([resourceId])
  @@index([userId])
  @@map("check_in_out")
}

// Plantilla de documento
model DocumentTemplate {
  id              String   @id @default(auto()) @map("_id") @db.ObjectId

  // Información
  name            String
  type            String   // APPROVAL_LETTER, REJECTION_LETTER, CHECK_IN_FORM
  description     String?

  // Contenido
  template        String   // HTML con variables {{variable}}
  variables       String[] // Lista de variables disponibles

  // Configuración
  isActive        Boolean  @default(true)
  isDefault       Boolean  @default(false)

  // Auditoría
  createdBy       String   @db.ObjectId
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([type])
  @@index([isActive])
  @@map("document_templates")
}

// Plantilla de notificación
model NotificationTemplate {
  id              String   @id @default(auto()) @map("_id") @db.ObjectId

  // Información
  name            String
  type            String   // EMAIL, SMS, WHATSAPP, PUSH
  event           String   // APPROVAL_REQUESTED, APPROVED, REJECTED, etc.

  // Contenido
  subject         String?
  body            String   // Texto con variables {{variable}}
  variables       String[]

  // Configuración
  priority        String   @default("NORMAL") // LOW, NORMAL, HIGH
  isActive        Boolean  @default(true)

  // Auditoría
  createdBy       String   @db.ObjectId
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([event])
  @@index([type])
  @@index([isActive])
  @@map("notification_templates")
}
```

---

## 📦 Entidades Principales

### 1. ApprovalRequest

**Estados**:

- `PENDING`: Esperando aprobación
- `APPROVED`: Aprobada
- `REJECTED`: Rechazada
- `EXPIRED`: Expirada

**Ejemplo**:

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "reservationId": "507f1f77bcf86cd799439020",
  "requesterId": "507f1f77bcf86cd799439030",
  "requesterName": "Juan Pérez",
  "requesterEmail": "juan.perez@ufps.edu.co",
  "purpose": "Evento académico institucional",
  "resourceName": "Auditorio Principal",
  "startDate": "2025-11-15T14:00:00Z",
  "endDate": "2025-11-15T18:00:00Z",
  "attendees": 250,
  "status": "PENDING",
  "currentStep": 1,
  "totalSteps": 2,
  "expiresAt": "2025-11-14T23:59:59Z"
}
```

---

### 2. ApprovalFlow

Flujo de aprobación configurable por tipo de recurso.

**Ejemplo**:

```json
{
  "_id": "507f1f77bcf86cd799439040",
  "name": "Aprobación de Auditorios",
  "description": "Flujo de 2 pasos para reservas de auditorios",
  "isActive": true,
  "resourceTypes": ["AUDITORIUM"],
  "minAttendees": 100,
  "steps": [
    {
      "order": 1,
      "approverRole": "coordinator",
      "isOptional": false
    },
    {
      "order": 2,
      "approverRole": "admin",
      "isOptional": false
    }
  ]
}
```

---

### 3. CheckInOut

Registro de entrada/salida de recursos.

**Ejemplo**:

```json
{
  "_id": "507f1f77bcf86cd799439050",
  "reservationId": "507f1f77bcf86cd799439020",
  "resourceId": "507f1f77bcf86cd799439060",
  "userId": "507f1f77bcf86cd799439030",
  "checkInTime": "2025-11-15T14:05:00Z",
  "checkInBy": "507f1f77bcf86cd799439070",
  "checkInNotes": "Todo en orden",
  "checkOutTime": "2025-11-15T17:55:00Z",
  "resourceCondition": "GOOD"
}
```

---

## 🔗 Relaciones

### ApprovalRequest ↔ Reservation

- **Tipo**: One-to-One
- **Campo**: `reservationId`

### ApprovalRequest ↔ ApprovalFlow

- **Tipo**: Many-to-One
- **Campo**: `approvalFlowId`

---

## 🔍 Índices

### ApprovalRequest

```javascript
db.approval_requests.createIndex({ reservationId: 1 });
db.approval_requests.createIndex({ status: 1 });
db.approval_requests.createIndex({ requesterId: 1 });
db.approval_requests.createIndex({ expiresAt: 1 });
db.approval_requests.createIndex({ createdAt: -1 });
```

### ApprovalFlow

```javascript
db.approval_flows.createIndex({ isActive: 1 });
db.approval_flows.createIndex({ resourceTypes: 1 });
```

### CheckInOut

```javascript
db.check_in_out.createIndex({ reservationId: 1 });
db.check_in_out.createIndex({ resourceId: 1 });
db.check_in_out.createIndex({ userId: 1 });
```

---

## 📚 Referencias

- [Arquitectura](ARCHITECTURE.md)
- [Endpoints](ENDPOINTS.md)
- [Notification Providers](NOTIFICATION_PROVIDERS.md)

---

**Mantenedores**: Bookly Development Team  
**Última actualización**: Noviembre 6, 2025
