# 🔑 Referencia de ObjectIds - Seeds de Bookly

**Fecha**: Noviembre 23, 2025  
**Versión**: 1.0  
**Propósito**: Catálogo centralizado de todos los ObjectIds usados en seeds para garantizar integridad referencial

---

## 📋 Índice de IDs

- [Sistema](#sistema)
- [Usuarios por Rol](#usuarios-por-rol)
- [Programas Académicos](#programas-académicos)
- [Roles y Permisos](#roles-y-permisos)
- [Categorías](#categorías)
- [Recursos](#recursos)
- [Reservas](#reservas)
- [Aprobaciones](#aprobaciones)
- [Relaciones Clave](#relaciones-clave)

---

## 🤖 Sistema

```typescript
const SYSTEM_USER_ID = "507f1f77bcf86cd799439000";
```

**Uso**: Acciones automáticas del sistema, creación de permisos base, tareas programadas.

---

## 👥 Usuarios por Rol

### Administradores

```typescript
// Admin General (puede gestionar todo)
const ADMIN_GENERAL_ID = "507f1f77bcf86cd799439022";
const ADMIN_GENERAL_EMAIL = "admin@ufps.edu.co";
const ADMIN_GENERAL_NAME = "Admin Sistema";

// Admin TI (gestión técnica)
const ADMIN_TI_ID = "507f1f77bcf86cd799439025";
const ADMIN_TI_EMAIL = "admin.ti@ufps.edu.co";
const ADMIN_TI_NAME = "Admin TI";
```

**Responsabilidades**:

- Crear programas académicos
- Crear roles y permisos
- Gestionar recursos globales
- Asignar coordinadores

---

### Coordinadores de Programa

```typescript
// Coordinador de Ingeniería de Sistemas
const COORDINADOR_SISTEMAS_ID = "507f1f77bcf86cd799439021";
const COORDINADOR_SISTEMAS_EMAIL = "juan.docente@ufps.edu.co";
const COORDINADOR_SISTEMAS_NAME = "Juan Docente";
const COORDINADOR_SISTEMAS_PROGRAM = PROGRAMA_SISTEMAS_ID;

// Coordinador de Ingeniería Industrial
const COORDINADOR_INDUSTRIAL_ID = "507f1f77bcf86cd799439026";
const COORDINADOR_INDUSTRIAL_EMAIL = "pedro.coordinador@ufps.edu.co";
const COORDINADOR_INDUSTRIAL_NAME = "Pedro Coordinador";
const COORDINADOR_INDUSTRIAL_PROGRAM = PROGRAMA_INDUSTRIAL_ID;
```

**Campos Especiales**:

```typescript
{
  _id: COORDINADOR_SISTEMAS_ID,
  programId: PROGRAMA_SISTEMAS_ID,              // Programa al que pertenece
  coordinatedProgramId: PROGRAMA_SISTEMAS_ID,   // Programa que coordina (mismo)
  roles: [ROLE_COORDINADOR_ID],
  isActive: true
}
```

**Responsabilidades**:

- Crear categorías de su programa
- Crear recursos de su programa
- Aprobar reservas de su programa
- Evaluar usuarios de su programa

---

### Docentes

```typescript
// Docente Auxiliar (sin coordinación)
const DOCENTE_AUXILIAR_ID = "507f1f77bcf86cd799439027";
const DOCENTE_AUXILIAR_EMAIL = "auxiliar@ufps.edu.co";
const DOCENTE_AUXILIAR_NAME = "Carlos Auxiliar";
const DOCENTE_AUXILIAR_PROGRAM = PROGRAMA_SISTEMAS_ID;
```

**Campos**:

```typescript
{
  _id: DOCENTE_AUXILIAR_ID,
  programId: PROGRAMA_SISTEMAS_ID,
  coordinatedProgramId: null,  // NO coordina programa
  roles: [ROLE_DOCENTE_ID],
  isActive: true
}
```

---

### Estudiantes

```typescript
// Estudiante de Sistemas
const ESTUDIANTE_MARIA_ID = "507f1f77bcf86cd799439023";
const ESTUDIANTE_MARIA_EMAIL = "maria.estudiante@ufps.edu.co";
const ESTUDIANTE_MARIA_NAME = "María Estudiante";
const ESTUDIANTE_MARIA_PROGRAM = PROGRAMA_SISTEMAS_ID;

// Estudiante de Industrial
const ESTUDIANTE_CARLOS_ID = "507f1f77bcf86cd799439028";
const ESTUDIANTE_CARLOS_EMAIL = "carlos.estudiante@ufps.edu.co";
const ESTUDIANTE_CARLOS_NAME = "Carlos Estudiante";
const ESTUDIANTE_CARLOS_PROGRAM = PROGRAMA_INDUSTRIAL_ID;
```

**Campos**:

```typescript
{
  _id: ESTUDIANTE_MARIA_ID,
  programId: PROGRAMA_SISTEMAS_ID,
  coordinatedProgramId: null,
  roles: [ROLE_ESTUDIANTE_ID],
  isActive: true
}
```

---

### Personal / Staff

```typescript
// Vigilante
const STAFF_VIGILANTE_ID = "507f1f77bcf86cd799439024";
const STAFF_VIGILANTE_EMAIL = "vigilante@ufps.edu.co";
const STAFF_VIGILANTE_NAME = "Jorge Vigilante";
```

**Campos**:

```typescript
{
  _id: STAFF_VIGILANTE_ID,
  programId: null,  // Personal no pertenece a programa específico
  coordinatedProgramId: null,
  roles: [ROLE_STAFF_ID],
  isActive: true
}
```

---

## 🎓 Programas Académicos

```typescript
// Ingeniería de Sistemas
const PROGRAMA_SISTEMAS_ID = "507f1f77bcf86cd799439041";
const PROGRAMA_SISTEMAS_CODE = "SIS";
const PROGRAMA_SISTEMAS_NAME = "Ingeniería de Sistemas";
const PROGRAMA_SISTEMAS_COORDINATOR = COORDINADOR_SISTEMAS_ID;

// Ingeniería Industrial
const PROGRAMA_INDUSTRIAL_ID = "507f1f77bcf86cd799439042";
const PROGRAMA_INDUSTRIAL_CODE = "IND";
const PROGRAMA_INDUSTRIAL_NAME = "Ingeniería Industrial";
const PROGRAMA_INDUSTRIAL_COORDINATOR = COORDINADOR_INDUSTRIAL_ID;

// Ingeniería Electrónica
const PROGRAMA_ELECTRONICA_ID = "507f1f77bcf86cd799439043";
const PROGRAMA_ELECTRONICA_CODE = "ELE";
const PROGRAMA_ELECTRONICA_NAME = "Ingeniería Electrónica";
// NOTA: Este programa aún no tiene coordinador en seeds
```

**Estructura en Schema**:

```typescript
{
  _id: PROGRAMA_SISTEMAS_ID,
  name: "Ingeniería de Sistemas",
  code: "SIS",
  coordinatorId: COORDINADOR_SISTEMAS_ID,  // ← Relación con usuario
  isActive: true,
  audit: {
    createdBy: ADMIN_GENERAL_ID,
    updatedBy: ADMIN_GENERAL_ID,
    createdAt: new Date(),
    updatedAt: new Date()
  }
}
```

---

## 🔐 Roles y Permisos

### Roles

```typescript
const ROLE_ADMIN_ID = "507f1f77bcf86cd799439051";
const ROLE_COORDINADOR_ID = "507f1f77bcf86cd799439052";
const ROLE_DOCENTE_ID = "507f1f77bcf86cd799439053";
const ROLE_ESTUDIANTE_ID = "507f1f77bcf86cd799439054";
const ROLE_STAFF_ID = "507f1f77bcf86cd799439055";
```

**Estructura**:

```typescript
{
  _id: ROLE_COORDINADOR_ID,
  name: "Coordinador",
  code: "COORDINADOR",
  categoryCode: "ACADEMIC",
  permissions: [/* IDs de permisos */],
  audit: {
    createdBy: ADMIN_GENERAL_ID,
    updatedBy: ADMIN_GENERAL_ID
  }
}
```

### Permisos

```typescript
// Ejemplos de permisos base
const PERMISSION_CREATE_RESOURCE_ID = "507f1f77bcf86cd799439061";
const PERMISSION_APPROVE_RESERVATION_ID = "507f1f77bcf86cd799439062";
const PERMISSION_VIEW_REPORTS_ID = "507f1f77bcf86cd799439063";
```

**Estructura**:

```typescript
{
  _id: PERMISSION_CREATE_RESOURCE_ID,
  name: "Crear Recursos",
  code: "CREATE_RESOURCE",
  resource: "RESOURCE",
  action: "CREATE",
  audit: {
    createdBy: SYSTEM_USER_ID,  // Sistema crea permisos base
    updatedBy: SYSTEM_USER_ID
  }
}
```

---

## 📁 Categorías

```typescript
// Categorías de Recursos
const CATEGORIA_AUDITORIO_ID = "507f1f77bcf86cd799439071";
const CATEGORIA_LABORATORIO_ID = "507f1f77bcf86cd799439072";
const CATEGORIA_SALA_ID = "507f1f77bcf86cd799439073";
const CATEGORIA_EQUIPO_ID = "507f1f77bcf86cd799439074";
```

**Estructura**:

```typescript
{
  _id: CATEGORIA_AUDITORIO_ID,
  name: "Auditorio",
  code: "AUDITORIO",
  type: CategoryType.RESOURCE,
  isDefault: true,
  isActive: true,
  audit: {
    createdBy: ADMIN_GENERAL_ID,  // Admin crea categorías default
    updatedBy: ADMIN_GENERAL_ID
  }
}

// Categoría creada por coordinador
{
  _id: new ObjectId(),
  name: "Laboratorio de Redes",
  code: "LAB-REDES",
  type: CategoryType.RESOURCE,
  isDefault: false,
  isActive: true,
  audit: {
    createdBy: COORDINADOR_SISTEMAS_ID,  // Coordinador crea categoría específica
    updatedBy: COORDINADOR_SISTEMAS_ID
  }
}
```

---

## 🏢 Recursos

```typescript
// Auditorio Principal
const RECURSO_AUDITORIO_ID = "507f1f77bcf86cd799439011";
const RECURSO_AUDITORIO_NAME = "Auditorio Principal";
const RECURSO_AUDITORIO_CODE = "AUD-001";

// Laboratorio de Sistemas 1
const RECURSO_LABORATORIO_ID = "507f1f77bcf86cd799439012";
const RECURSO_LABORATORIO_NAME = "Laboratorio de Sistemas 1";
const RECURSO_LABORATORIO_CODE = "LAB-SIS-001";

// Sala de Conferencias A
const RECURSO_SALA_ID = "507f1f77bcf86cd799439013";
const RECURSO_SALA_NAME = "Sala Conferencias A";
const RECURSO_SALA_CODE = "SALA-001";

// Proyector Epson 5050UB
const RECURSO_EQUIPO_ID = "507f1f77bcf86cd799439014";
const RECURSO_EQUIPO_NAME = "Proyector Epson 5050UB";
const RECURSO_EQUIPO_CODE = "PROY-001";
```

**Estructura con Programas**:

```typescript
{
  _id: RECURSO_AUDITORIO_ID,
  name: "Auditorio Principal",
  code: "AUD-001",
  categoryId: CATEGORIA_AUDITORIO_ID,
  programIds: [
    PROGRAMA_SISTEMAS_ID,      // Usado por Sistemas
    PROGRAMA_INDUSTRIAL_ID,    // Y por Industrial
    PROGRAMA_ELECTRONICA_ID    // Y por Electrónica
  ],
  capacity: 200,
  isActive: true,
  audit: {
    createdBy: ADMIN_GENERAL_ID,  // Admin crea recursos globales
    updatedBy: ADMIN_GENERAL_ID
  }
}

// Recurso específico de programa
{
  _id: RECURSO_LABORATORIO_ID,
  name: "Laboratorio de Sistemas 1",
  code: "LAB-SIS-001",
  categoryId: CATEGORIA_LABORATORIO_ID,
  programIds: [
    PROGRAMA_SISTEMAS_ID  // Solo para Sistemas
  ],
  capacity: 30,
  isActive: true,
  audit: {
    createdBy: COORDINADOR_SISTEMAS_ID,  // Coordinador crea recurso de su programa
    updatedBy: COORDINADOR_SISTEMAS_ID
  }
}
```

---

## 📅 Reservas

```typescript
// Reserva 1 - Aprobada por coordinador
const RESERVA_1_ID = "507f1f77bcf86cd799439031";

// Reserva 2 - Directa (sin aprobación)
const RESERVA_2_ID = "507f1f77bcf86cd799439032";
```

**Estructura - Reserva Aprobada**:

```typescript
{
  _id: RESERVA_1_ID,
  userId: ESTUDIANTE_MARIA_ID,           // Beneficiario
  resourceId: RECURSO_AUDITORIO_ID,
  programId: PROGRAMA_SISTEMAS_ID,       // Del usuario
  approvalRequestId: REQUEST_1_ID,       // Referencia a solicitud
  startDate: new Date("2025-11-25 14:00"),
  endDate: new Date("2025-11-25 16:00"),
  status: ReservationStatus.CONFIRMED,
  audit: {
    createdBy: COORDINADOR_SISTEMAS_ID,  // Coordinador que aprobó
    updatedBy: COORDINADOR_SISTEMAS_ID,
    createdAt: new Date(),
    updatedAt: new Date()
  }
}
```

**Estructura - Reserva Directa**:

```typescript
{
  _id: RESERVA_2_ID,
  userId: DOCENTE_AUXILIAR_ID,
  resourceId: RECURSO_SALA_ID,
  programId: PROGRAMA_SISTEMAS_ID,
  approvalRequestId: null,               // Sin aprobación
  startDate: new Date("2025-11-26 10:00"),
  endDate: new Date("2025-11-26 12:00"),
  status: ReservationStatus.CONFIRMED,
  audit: {
    createdBy: DOCENTE_AUXILIAR_ID,      // Usuario que la creó directamente
    updatedBy: DOCENTE_AUXILIAR_ID
  }
}
```

---

## ✅ Aprobaciones

### Approval Flows

```typescript
const FLOW_AUDITORIO_ID = "507f1f77bcf86cd799439071";
const FLOW_EQUIPO_ID = "507f1f77bcf86cd799439072";
const FLOW_SALA_ID = "507f1f77bcf86cd799439073";
```

**Estructura**:

```typescript
{
  _id: FLOW_AUDITORIO_ID,
  name: "Flujo Aprobación Auditorio",
  resourceTypes: ["AUDITORIUM"],
  steps: [{
    stepIndex: 0,
    name: "Aprobación Coordinador",
    approverRoles: ["COORDINADOR", "ADMIN"],
    isRequired: true
  }],
  audit: {
    createdBy: ADMIN_GENERAL_ID,
    updatedBy: ADMIN_GENERAL_ID
  }
}
```

### Approval Requests

```typescript
const REQUEST_1_ID = "507f1f77bcf86cd799439081"; // Aprobada
const REQUEST_2_ID = "507f1f77bcf86cd799439082"; // Pendiente
```

**Estructura - Solicitud Aprobada**:

```typescript
{
  _id: REQUEST_1_ID,
  requesterId: ESTUDIANTE_MARIA_ID,       // Quien solicita
  resourceId: RECURSO_AUDITORIO_ID,
  programId: PROGRAMA_SISTEMAS_ID,        // Del recurso
  approvalFlowId: FLOW_AUDITORIO_ID,
  requestedStartDate: new Date("2025-11-25 14:00"),
  requestedEndDate: new Date("2025-11-25 16:00"),
  status: ApprovalRequestStatus.APPROVED,
  currentStepIndex: 1,                    // Completado
  approvalHistory: [{
    stepIndex: 0,
    approverId: COORDINADOR_SISTEMAS_ID,  // Quien aprobó
    decision: ApprovalHistoryDecision.APPROVED,
    comments: "Aprobado para evento académico",
    decidedAt: new Date()
  }],
  audit: {
    createdBy: ESTUDIANTE_MARIA_ID,       // Original
    updatedBy: COORDINADOR_SISTEMAS_ID,   // Último que actualizó
    createdAt: new Date(),
    updatedAt: new Date()
  }
}
```

---

## 🔗 Relaciones Clave

### 1. Usuario ↔ Roles ↔ Permisos (Many-to-Many)

```typescript
// User
{
  _id: COORDINADOR_SISTEMAS_ID,
  roles: [UserRole.TEACHER, UserRole.PROGRAM_ADMIN],  // Enums para lógica
  roleIds: [ROLE_DOCENTE_ID, ROLE_COORDINADOR_ID]    // ObjectIds de documentos Role
}

// Role
{
  _id: ROLE_COORDINADOR_ID,
  name: "PROGRAM_ADMIN",
  permissions: [
    PERMISSION_CREATE_RESOURCE_ID,
    PERMISSION_APPROVE_RESERVATION_ID
  ]  // ObjectIds de documentos Permission
}

// Permission
{
  _id: PERMISSION_CREATE_RESOURCE_ID,
  code: "CREATE_RESOURCE",
  resource: "RESOURCE",
  action: "CREATE"
}
```

**Validación**:

```typescript
user.roleIds.includes(ROLE_COORDINADOR_ID);
role.permissions.includes(PERMISSION_CREATE_RESOURCE_ID);
```

**Diseño**:

- `roles[]`: Array de enums para validación rápida en guards
- `roleIds[]`: Array de ObjectIds para poblar permisos completos
- Cada Role tiene múltiples Permission IDs
- Los permisos se expanden dinámicamente desde los roles

---

### 2. Programa ↔ Coordinador (Bidireccional)

```typescript
// Program
{
  _id: PROGRAMA_SISTEMAS_ID,
  coordinatorId: COORDINADOR_SISTEMAS_ID  // → User
}

// User
{
  _id: COORDINADOR_SISTEMAS_ID,
  programId: PROGRAMA_SISTEMAS_ID,              // ← Program
  coordinatedProgramId: PROGRAMA_SISTEMAS_ID    // ← Program (que coordina)
}
```

**Validación**:

```typescript
program.coordinatorId === user._id;
user.coordinatedProgramId === program._id;
user.programId === program._id;
```

---

### 3. Recurso → Programas (Uno a Muchos)

```typescript
// Resource
{
  _id: RECURSO_AUDITORIO_ID,
  programIds: [
    PROGRAMA_SISTEMAS_ID,
    PROGRAMA_INDUSTRIAL_ID
  ]
}

// Program 1
{
  _id: PROGRAMA_SISTEMAS_ID
  // NO tiene campo resourceIds (relación unidireccional)
}
```

---

### 4. Reserva → Usuario, Recurso, Programa

```typescript
// Reservation
{
  _id: RESERVA_1_ID,
  userId: ESTUDIANTE_MARIA_ID,      // → User
  resourceId: RECURSO_AUDITORIO_ID, // → Resource
  programId: PROGRAMA_SISTEMAS_ID   // → Program (del usuario)
}
```

**Validación**:

```typescript
reservation.programId === user.programId;
```

---

### 5. Solicitud → Reserva (Opcional)

```typescript
// ApprovalRequest
{
  _id: REQUEST_1_ID,
  status: APPROVED
  // ...
}

// Reservation (creada tras aprobación)
{
  _id: RESERVA_1_ID,
  approvalRequestId: REQUEST_1_ID,        // ← ApprovalRequest
  userId: ESTUDIANTE_MARIA_ID,            // Usuario beneficiario
  audit: {
    createdBy: COORDINADOR_SISTEMAS_ID    // Quien aprobó
  }
}
```

---

## 📊 Resumen de IDs por Servicio

| Servicio         | Entidades                                                       | IDs Definidos                           |
| ---------------- | --------------------------------------------------------------- | --------------------------------------- |
| **Auth**         | Users, Roles, Permissions                                       | 8 usuarios + 5 roles                    |
| **Resources**    | Programs, Categories, Resources, Maintenances                   | 3 programas + 4 categorías + 4 recursos |
| **Availability** | Availabilities, Reservations, WaitingList                       | 2 reservas + 4 availabilities           |
| **Stockpile**    | ApprovalFlows, ApprovalRequests, Notifications                  | 3 flows + 2 requests                    |
| **Reports**      | UserFeedback, UserEvaluation, UsageStatistic, UnsatisfiedDemand | Referencias a IDs anteriores            |

**Total de ObjectIds Únicos**: ~35 IDs documentados

---

## 🎯 Casos de Uso - Flujos Completos

### Caso 1: Coordinador crea Categoría

```typescript
// 1. Usuario
{
  _id: COORDINADOR_SISTEMAS_ID,
  name: "Juan Docente",
  roles: [ROLE_COORDINADOR_ID],
  programId: PROGRAMA_SISTEMAS_ID
}

// 2. Categoría creada
{
  _id: new ObjectId("..."),
  name: "Laboratorio de Redes",
  code: "LAB-REDES",
  audit: {
    createdBy: COORDINADOR_SISTEMAS_ID  // ← Quien la creó
  }
}
```

### Caso 2: Estudiante solicita, Coordinador aprueba

```typescript
// 1. Solicitud (Estudiante)
{
  _id: REQUEST_1_ID,
  requesterId: ESTUDIANTE_MARIA_ID,
  programId: PROGRAMA_SISTEMAS_ID,
  status: PENDING,
  audit: {
    createdBy: ESTUDIANTE_MARIA_ID
  }
}

// 2. Aprobación (Coordinador)
{
  _id: REQUEST_1_ID,
  status: APPROVED,
  approvalHistory: [{
    approverId: COORDINADOR_SISTEMAS_ID  // ← Quien aprobó
  }],
  audit: {
    createdBy: ESTUDIANTE_MARIA_ID,
    updatedBy: COORDINADOR_SISTEMAS_ID   // ← Quien actualizó
  }
}

// 3. Reserva creada (Sistema, en nombre del Coordinador)
{
  _id: RESERVA_1_ID,
  userId: ESTUDIANTE_MARIA_ID,           // Beneficiario
  approvalRequestId: REQUEST_1_ID,
  audit: {
    createdBy: COORDINADOR_SISTEMAS_ID   // ← Quien la creó (aprobó)
  }
}
```

---

**Última actualización**: Noviembre 23, 2025  
**Mantenido por**: Equipo de Desarrollo Bookly  
**Uso**: Referencia obligatoria al crear/modificar seeds
