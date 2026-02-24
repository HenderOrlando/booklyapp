# Stockpile Service - Documentación Técnica

## 📋 Descripción General

El **Stockpile Service** es el microservicio responsable de gestionar flujos de aprobación y validación de reservas dentro del ecosistema Bookly. Implementa flujos multi-paso configurables, historial completo de decisiones, y validaciones automáticas basadas en reglas de negocio.

**Puerto:** 3004  
**Base Path:** `/api/v1`  
**Documentación Swagger:** `http://localhost:3004/api/docs`

## 🏗️ Arquitectura

### Clean Architecture + CQRS + Event-Driven

```
┌─────────────────────────────────────────────────────────────┐
│                    Stockpile Service                         │
├─────────────────────────────────────────────────────────────┤
│  Infrastructure Layer                                        │
│  ├── Controllers (REST)                                      │
│  │   ├── ApprovalRequestsController                         │
│  │   └── ApprovalFlowsController                            │
│  ├── Repositories (MongoDB)                                  │
│  │   ├── ApprovalRequestRepository                          │
│  │   └── ApprovalFlowRepository                             │
│  ├── Schemas (Mongoose)                                      │
│  └── DTOs (Validation)                                       │
├─────────────────────────────────────────────────────────────┤
│  Application Layer                                           │
│  ├── Commands (Write Operations)                            │
│  ├── Queries (Read Operations)                              │
│  ├── Handlers (CQRS)                                         │
│  └── Services (Business Logic)                              │
│      ├── ApprovalRequestService                             │
│      └── ApprovalFlowService                                │
├─────────────────────────────────────────────────────────────┤
│  Domain Layer                                                │
│  ├── Entities                                                │
│  │   ├── ApprovalRequestEntity                              │
│  │   └── ApprovalFlowEntity                                 │
│  └── Repository Interfaces                                   │
└─────────────────────────────────────────────────────────────┘
```

## 📦 Modelos de Dominio

### ApprovalRequestEntity

Representa una solicitud de aprobación vinculada a una reserva.

**Campos principales:**

- `reservationId`: ID de la reserva que requiere aprobación
- `requesterId`: Usuario que solicita
- `approvalFlowId`: Flujo de aprobación a seguir
- `status`: Estado (PENDING, IN_REVIEW, APPROVED, REJECTED, CANCELLED)
- `currentStepIndex`: Paso actual en el flujo
- `submittedAt`: Fecha de envío
- `completedAt`: Fecha de finalización
- `metadata`: Datos adicionales contextuales
- `approvalHistory`: Historial completo de decisiones

**Estados del ciclo de vida:**

```
PENDING → IN_REVIEW → APPROVED
                    ↓
                REJECTED
                    ↓
                CANCELLED
```

**Estructura del historial:**

```json
{
  "stepName": "Aprobación de Coordinador",
  "approverId": "507f1f77bcf86cd799439011",
  "decision": "APPROVED",
  "comment": "Aprobado sin observaciones",
  "approvedAt": "2024-11-03T20:00:00Z"
}
```

### ApprovalFlowEntity

Define un flujo de aprobación configurable y reutilizable.

**Campos principales:**

- `name`: Nombre único del flujo
- `description`: Descripción del flujo
- `resourceTypes`: Tipos de recursos a los que aplica
- `steps`: Array de pasos ordenados
- `isActive`: Si está activo
- `autoApproveConditions`: Condiciones para auto-aprobación

**Estructura de un paso:**

```json
{
  "name": "Aprobación de Coordinador",
  "approverRoles": ["coordinator", "program_director"],
  "order": 1,
  "isRequired": true,
  "allowParallel": false
}
```

**Características de los pasos:**

- **order**: Define secuencia de ejecución
- **isRequired**: Si es obligatorio o puede ser omitido
- **allowParallel**: Si permite múltiples aprobadores simultáneos
- **approverRoles**: Roles que pueden aprobar este paso

## 🔌 API Endpoints

### Approval Requests Controller

#### POST `/api/v1/approval-requests`

Crear una nueva solicitud de aprobación.

**Request Body:**

```json
{
  "reservationId": "507f1f77bcf86cd799439011",
  "requesterId": "507f1f77bcf86cd799439012",
  "approvalFlowId": "507f1f77bcf86cd799439013",
  "metadata": {
    "priority": "high",
    "department": "Engineering",
    "requestReason": "Important conference"
  }
}
```

**Response:**

```json
{
  "id": "507f1f77bcf86cd799439014",
  "reservationId": "507f1f77bcf86cd799439011",
  "requesterId": "507f1f77bcf86cd799439012",
  "approvalFlowId": "507f1f77bcf86cd799439013",
  "status": "PENDING",
  "currentStepIndex": 0,
  "submittedAt": "2024-11-03T20:00:00.000Z",
  "approvalHistory": []
}
```

#### GET `/api/v1/approval-requests`

Listar solicitudes con filtros.

**Query Parameters:**

- `page`, `limit`: Paginación
- `requesterId`: Por solicitante
- `approvalFlowId`: Por flujo
- `status`: Por estado
- `reservationId`: Por reserva

**Response:**

```json
{
  "requests": [...],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

#### GET `/api/v1/approval-requests/statistics`

Obtener estadísticas de aprobaciones.

**Query Parameters:**

- `startDate`: Desde fecha
- `endDate`: Hasta fecha
- `approvalFlowId`: Por flujo específico

**Response:**

```json
{
  "total": 150,
  "approved": 120,
  "rejected": 20,
  "pending": 10,
  "averageApprovalTime": 45.5
}
```

#### GET `/api/v1/approval-requests/:id`

Obtener solicitud por ID con historial completo.

#### POST `/api/v1/approval-requests/:id/approve`

Aprobar el paso actual.

**Request Body:**

```json
{
  "approverId": "507f1f77bcf86cd799439012",
  "stepName": "Aprobación de Coordinador",
  "comment": "Aprobado sin observaciones"
}
```

**Comportamiento:**

- Si es el último paso → Status: APPROVED
- Si hay más pasos → Status: IN_REVIEW, currentStepIndex++
- Registra en approvalHistory

#### POST `/api/v1/approval-requests/:id/reject`

Rechazar el paso actual.

**Request Body:**

```json
{
  "approverId": "507f1f77bcf86cd799439012",
  "stepName": "Aprobación de Coordinador",
  "comment": "No cumple con los requisitos mínimos"
}
```

**Comportamiento:**

- Status: REJECTED
- No procesa pasos siguientes
- Registra en approvalHistory

#### POST `/api/v1/approval-requests/:id/cancel`

Cancelar solicitud (solo si no está completada).

**Request Body:**

```json
{
  "cancelledBy": "507f1f77bcf86cd799439012",
  "reason": "El solicitante ya no requiere el recurso"
}
```

#### DELETE `/api/v1/approval-requests/:id`

Eliminar solicitud (soft delete).

### Approval Flows Controller

#### POST `/api/v1/approval-flows`

Crear un nuevo flujo de aprobación.

**Request Body:**

```json
{
  "name": "Flujo de Aprobación de Salas",
  "description": "Flujo para aprobar reservas de salas de conferencias",
  "resourceTypes": ["ROOM", "AUDITORIUM"],
  "steps": [
    {
      "name": "Aprobación de Coordinador",
      "approverRoles": ["coordinator"],
      "order": 1,
      "isRequired": true,
      "allowParallel": false
    },
    {
      "name": "Aprobación de Director",
      "approverRoles": ["program_director", "general_admin"],
      "order": 2,
      "isRequired": true,
      "allowParallel": true
    }
  ],
  "autoApproveConditions": {
    "maxDuration": 120,
    "userType": "staff"
  }
}
```

**Response:**

```json
{
  "id": "507f1f77bcf86cd799439013",
  "name": "Flujo de Aprobación de Salas",
  "isActive": true,
  "steps": [...],
  "createdAt": "2024-11-03T20:00:00.000Z"
}
```

#### GET `/api/v1/approval-flows`

Listar flujos de aprobación.

**Query Parameters:**

- `page`, `limit`: Paginación
- `isActive`: Solo activos/inactivos
- `resourceType`: Por tipo de recurso

#### GET `/api/v1/approval-flows/:id`

Obtener flujo por ID.

#### PATCH `/api/v1/approval-flows/:id`

Actualizar flujo.

**Request Body (parcial):**

```json
{
  "description": "Flujo actualizado con nuevos requisitos",
  "steps": [...]
}
```

#### POST `/api/v1/approval-flows/:id/deactivate`

Desactivar flujo (no se puede usar en nuevas solicitudes).

#### POST `/api/v1/approval-flows/:id/activate`

Activar flujo desactivado.

#### DELETE `/api/v1/approval-flows/:id`

Eliminar flujo (solo si no tiene solicitudes asociadas).

## 🔄 Casos de Uso Principales

### 1. Crear Solicitud de Aprobación

**Flujo:**

1. Usuario crea reserva en Availability Service
2. Availability Service detecta que recurso requiere aprobación
3. Availability Service llama a Stockpile Service
4. Stockpile Service:
   - Busca flujo aplicable al tipo de recurso
   - Crea solicitud con status PENDING
   - Identifica primer paso del flujo
   - Notifica a aprobadores del primer paso
5. Reserva queda en status PENDING hasta aprobación

**Validaciones:**

- Reserva existe y está en estado válido
- Flujo de aprobación existe y está activo
- Usuario solicitante tiene permisos
- No existe solicitud duplicada para la misma reserva

### 2. Flujo Multi-Paso de Aprobación

**Escenario:** Flujo con 3 pasos (Coordinador → Director → Decano)

**Paso 1 - Coordinador aprueba:**

- currentStepIndex: 0 → 1
- status: PENDING → IN_REVIEW
- approvalHistory agrega decisión
- Notifica a aprobadores del paso 2

**Paso 2 - Director aprueba:**

- currentStepIndex: 1 → 2
- status: IN_REVIEW
- approvalHistory agrega decisión
- Notifica a aprobadores del paso 3

**Paso 3 - Decano aprueba:**

- currentStepIndex: 2 → 3
- status: IN_REVIEW → APPROVED
- completedAt: timestamp actual
- approvalHistory agrega decisión
- Notifica a Availability Service para confirmar reserva

### 3. Rechazo en Cualquier Paso

**Comportamiento:**

- Cualquier rechazo termina el flujo inmediatamente
- No se procesan pasos siguientes
- Status: REJECTED
- Notifica a solicitante y cancela reserva

### 4. Auto-Aprobación Condicional

**Condiciones configurables:**

```json
{
  "maxDuration": 120,
  "userType": "staff",
  "departmentPriority": "high"
}
```

**Lógica:**

- Sistema evalúa condiciones al crear solicitud
- Si cumple todas → Aprobación automática
- Si no → Flujo normal de aprobación

### 5. Cancelación de Solicitud

**Escenarios:**

- Usuario cancela reserva → Solicitud cancelada automáticamente
- Administrador cancela solicitud directamente
- Expiración por tiempo límite

**Restricciones:**

- No se puede cancelar solicitud ya APPROVED o REJECTED
- Solo solicitante o administrador pueden cancelar

## 🔧 Configuración

### Variables de Entorno

```bash
# MongoDB
MONGODB_URI_STOCKPILE=mongodb://bookly:bookly123@localhost:27017/stockpile?replicaSet=bookly-rs

# JWT
JWT_SECRET=bookly-secret-key
JWT_EXPIRATION=24h

# Server
PORT=3004
CORS_ORIGIN=*

# Business Rules
MAX_APPROVAL_TIME_DAYS=7
AUTO_EXPIRE_PENDING_HOURS=48
MAX_APPROVAL_STEPS=5
```

### Índices de MongoDB

**Approval Requests Collection:**

- `{ reservationId: 1 }` - Unique, una solicitud por reserva
- `{ requesterId: 1, status: 1 }` - Solicitudes por usuario
- `{ approvalFlowId: 1, status: 1 }` - Por flujo y estado
- `{ status: 1, submittedAt: -1 }` - Ordenamiento
- `{ createdAt: -1 }` - Más recientes

**Approval Flows Collection:**

- `{ name: 1 }` - Unique
- `{ isActive: 1 }` - Flujos activos
- `{ resourceTypes: 1 }` - Por tipo de recurso
- `{ createdAt: -1 }` - Ordenamiento

## 📊 Eventos Publicados

El servicio publica eventos que otros servicios pueden consumir:

- `ApprovalRequestCreated`: Nueva solicitud creada
- `ApprovalRequestApproved`: Solicitud completamente aprobada
- `ApprovalRequestRejected`: Solicitud rechazada
- `ApprovalRequestCancelled`: Solicitud cancelada
- `ApprovalStepApproved`: Un paso fue aprobado
- `ApprovalStepRejected`: Un paso fue rechazado
- `ApprovalFlowCreated`: Nuevo flujo creado
- `ApprovalFlowUpdated`: Flujo actualizado
- `ApprovalFlowDeactivated`: Flujo desactivado

**Estructura de evento:**

```json
{
  "eventType": "ApprovalRequestApproved",
  "timestamp": "2024-11-03T20:00:00Z",
  "data": {
    "approvalRequestId": "507f1f77bcf86cd799439014",
    "reservationId": "507f1f77bcf86cd799439011",
    "requesterId": "507f1f77bcf86cd799439012",
    "approvalFlowId": "507f1f77bcf86cd799439013",
    "completedAt": "2024-11-03T20:00:00Z",
    "totalSteps": 3,
    "approvalTime": 45
  }
}
```

## 🧪 Ejemplos de Uso

### Crear Solicitud de Aprobación

```typescript
const approvalRequest = await fetch(
  "http://localhost:3004/api/v1/approval-requests",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer <token>",
    },
    body: JSON.stringify({
      reservationId: "507f1f77bcf86cd799439011",
      requesterId: "507f1f77bcf86cd799439012",
      approvalFlowId: "507f1f77bcf86cd799439013",
      metadata: {
        priority: "high",
        department: "Engineering",
      },
    }),
  }
);
```

### Aprobar Paso

```typescript
const approval = await fetch(
  "http://localhost:3004/api/v1/approval-requests/507f1f77bcf86cd799439014/approve",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer <token>",
    },
    body: JSON.stringify({
      approverId: "507f1f77bcf86cd799439015",
      stepName: "Aprobación de Coordinador",
      comment: "Aprobado sin observaciones",
    }),
  }
);
```

### Crear Flujo de Aprobación

```typescript
const flow = await fetch("http://localhost:3004/api/v1/approval-flows", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer <token>",
  },
  body: JSON.stringify({
    name: "Flujo Rápido para Equipos",
    description: "Aprobación simplificada para equipamiento",
    resourceTypes: ["EQUIPMENT"],
    steps: [
      {
        name: "Aprobación de Técnico",
        approverRoles: ["technical_staff"],
        order: 1,
        isRequired: true,
        allowParallel: false,
      },
    ],
    autoApproveConditions: {
      maxDuration: 60,
      userType: "professor",
    },
  }),
});
```

### Obtener Estadísticas

```typescript
const stats = await fetch(
  "http://localhost:3004/api/v1/approval-requests/statistics?" +
    "startDate=2024-11-01T00:00:00Z&" +
    "endDate=2024-11-30T23:59:59Z&" +
    "approvalFlowId=507f1f77bcf86cd799439013",
  {
    headers: { Authorization: "Bearer <token>" },
  }
);

const result = await stats.json();
console.log("Aprobadas:", result.approved);
console.log("Tiempo promedio:", result.averageApprovalTime, "minutos");
```

## 🔒 Seguridad

- **JWT Authentication**: Todos los endpoints protegidos
- **Role-Based Authorization**: Validación de roles para aprobar
- **Audit Trail**: Historial completo inmutable
- **Input Validation**: class-validator en DTOs
- **Business Rules**: Validaciones de lógica de negocio

**Permisos necesarios:**

- **Crear solicitud**: Usuario autenticado
- **Aprobar/Rechazar**: Usuario con rol aprobador del paso
- **Cancelar**: Solicitante o administrador
- **Gestionar flujos**: Solo administradores

## 📈 Métricas y Monitoreo

- Tiempo promedio de aprobación por flujo
- Tasa de aprobación/rechazo por paso
- Solicitudes pendientes por flujo
- Cuellos de botella en pasos específicos
- Alertas de solicitudes expiradas

## 🚀 Despliegue

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod

# Docker
docker-compose up stockpile-service
```

## 🔗 Dependencias con Otros Servicios

- **Availability Service**:
  - Recibe notificación cuando reserva requiere aprobación
  - Notifica cuando solicitud es aprobada/rechazada
- **Resources Service**:
  - Consulta si recurso requiere aprobación
  - Obtiene tipo de recurso para seleccionar flujo
- **Auth Service**:
  - Valida tokens JWT
  - Verifica roles de aprobadores
- **Reports Service**:
  - Provee datos de aprobaciones para análisis

## 📋 Reglas de Negocio

### Validaciones de Solicitud

1. **Una solicitud por reserva**: Reserva solo puede tener una solicitud activa
2. **Flujo activo**: Solo se pueden usar flujos activos
3. **Tipo compatible**: Flujo debe aplicar al tipo de recurso
4. **No duplicados**: No crear solicitud si ya existe una activa

### Reglas de Aprobación

1. **Orden secuencial**: Pasos deben aprobarse en orden (a menos que allowParallel=true)
2. **Rol válido**: Solo usuarios con rol correcto pueden aprobar
3. **Un aprobador por paso**: Mismo usuario no puede aprobar múltiples pasos
4. **Rechazo definitivo**: Cualquier rechazo termina el flujo

### Reglas de Flujo

1. **Nombre único**: No puede haber dos flujos con mismo nombre
2. **Mínimo un paso**: Flujo debe tener al menos un paso
3. **Orden consecutivo**: Pasos deben estar numerados consecutivamente desde 1
4. **No eliminar con solicitudes**: No se puede eliminar flujo con solicitudes activas

### Auto-Aprobación

Condiciones evaluadas en orden:

1. Duración de reserva dentro del límite
2. Tipo de usuario permitido
3. Prioridad del departamento
4. Historial del usuario (sin penalizaciones)

Si **todas** las condiciones se cumplen → Auto-aprobación

## 🎯 KPIs del Servicio

- **Tiempo promedio de aprobación**: < 2 horas
- **Tasa de auto-aprobación**: 30-40%
- **Tasa de rechazo**: < 10%
- **Solicitudes pendientes**: < 50
- **Disponibilidad**: 99.9%

---

**Versión:** 1.0.0  
**Última actualización:** Noviembre 2024  
**Mantenido por:** Equipo Bookly
