# 🔍 Análisis de Integridad Referencial de Seeds

**Fecha**: Noviembre 23, 2025 - 9:40 PM  
**Fase**: Verificación de Estado Actual (Fase 2.1)  
**Objetivo**: Identificar gaps de integridad referencial en schemas y seeds

---

## 📊 Resumen Ejecutivo

| Servicio         | Schema            | Seed              | Estado            | Prioridad |
| ---------------- | ----------------- | ----------------- | ----------------- | --------- |
| **Auth**         | ✅ **COMPLETADO** | ✅ **COMPLETADO** | ✅ **COMPLETADO** | 🟢 DONE   |
| **Resources**    | ✅ **COMPLETADO** | ✅ **COMPLETADO** | ✅ **COMPLETADO** | 🟢 DONE   |
| **Availability** | ✅ **COMPLETADO** | ✅ **COMPLETADO** | ✅ **COMPLETADO** | 🟢 DONE   |
| **Stockpile**    | ✅ **COMPLETADO** | ✅ **COMPLETADO** | ✅ **COMPLETADO** | 🟢 DONE   |
| **Reports**      | ℹ️ Por verificar  | ℹ️ Por verificar  | **OPCIONAL**      | 🔵 BAJA   |

**Progreso**: **🎉 80% COMPLETADO** (4 de 5 servicios) | **Fecha**: Noviembre 23, 2025 - 10:00 PM

---

## ✅ **COMPLETADO: Auth Service**

### ✅ **Implementación Realizada** (Noviembre 23, 2025 - 9:45 PM)

#### 1. Schema Incompleto

**Archivo**: `apps/auth-service/src/infrastructure/schemas/user.schema.ts`

**Campos Faltantes**:

```typescript
// ❌ NO EXISTE en el schema
programId?: string;                    // ID del programa al que pertenece
coordinatedProgramId?: string;         // ID del programa que coordina
documentType?: string;                 // CC, TI, CE
documentNumber?: string;               // Número de documento
phone?: string;                        // Teléfono de contacto
```

**Campos que SÍ existen**:

```typescript
// ✅ EXISTE
email: string;
firstName: string;
lastName: string;
roles: UserRole[];
isActive: boolean;
audit?: { createdBy, updatedBy, deletedBy };
```

#### 2. Seed con Datos Inconsistentes

**Archivo**: `apps/auth-service/src/database/seed.ts`

**Problema**: El seed usa campos que no existen en el schema:

```typescript
// Línea 130, 143, 156 - Campo `program` (string)
{
  email: "admin.sistemas@ufps.edu.co",
  // ...
  program: "Ingeniería de Sistemas",  // ❌ NO existe en schema
}

// Línea 112-114, etc - Campos de documento
{
  documentType: "CC",                  // ❌ NO existe en schema
  documentNumber: "1000000001",        // ❌ NO existe en schema
  phone: "+573001234567",              // ❌ NO existe en schema
}
```

**Resultado**: Los campos `program`, `documentType`, `documentNumber` y `phone` se ignoran silenciosamente al crear usuarios.

---

### ✅ **Solución Propuesta**

#### Schema User Actualizado

```typescript
@Schema({ timestamps: true, collection: "users" })
export class User {
  // ... campos existentes ...

  // 🆕 AGREGAR: Información de documento
  @Prop({ type: String, enum: ["CC", "TI", "CE", "PASSPORT"] })
  documentType?: string;

  @Prop({ type: String, trim: true })
  documentNumber?: string;

  @Prop({ type: String, trim: true })
  phone?: string;

  // 🆕 AGREGAR: Relación con programa académico
  @Prop({ type: String })
  programId?: string; // ObjectId como string

  // 🆕 AGREGAR: Programa que coordina (solo para coordinadores)
  @Prop({ type: String })
  coordinatedProgramId?: string; // ObjectId como string

  // ... resto de campos ...
}

// 🆕 AGREGAR: Índices
UserSchema.index({ programId: 1 });
UserSchema.index({ coordinatedProgramId: 1 });
UserSchema.index(
  { documentType: 1, documentNumber: 1 },
  { sparse: true, unique: true }
);
```

#### Seed User Actualizado

```typescript
// IDs fijos según SEED_IDS_REFERENCE.md
const PROGRAMA_SISTEMAS_ID = "507f1f77bcf86cd799439041";
const PROGRAMA_INDUSTRIAL_ID = "507f1f77bcf86cd799439042";

const users = [
  // Admin General - SIN programa
  {
    email: "admin@ufps.edu.co",
    // ...
    documentType: "CC",
    documentNumber: "1000000001",
    phone: "+573001234567",
    roles: [UserRole.GENERAL_ADMIN],
    programId: undefined, // Admin general no tiene programa
    coordinatedProgramId: undefined, // No coordina programa
  },
  // Coordinador de Sistemas
  {
    email: "docente@ufps.edu.co",
    // ...
    documentType: "CC",
    documentNumber: "1000000003",
    phone: "+573001234569",
    roles: [UserRole.TEACHER, UserRole.PROGRAM_ADMIN],
    programId: PROGRAMA_SISTEMAS_ID, // ✅ Pertenece a Sistemas
    coordinatedProgramId: PROGRAMA_SISTEMAS_ID, // ✅ Coordina Sistemas
  },
  // Estudiante de Sistemas
  {
    email: "estudiante@ufps.edu.co",
    // ...
    documentType: "TI",
    documentNumber: "1000000004",
    phone: "+573001234570",
    roles: [UserRole.STUDENT],
    programId: PROGRAMA_SISTEMAS_ID, // ✅ Pertenece a Sistemas
    coordinatedProgramId: undefined, // No coordina
  },
];
```

---

## ✅ **COMPLETADO: Resources Service**

### ✅ **Implementación Realizada** (Noviembre 23, 2025 - 9:45 PM)

#### 1. Schema Program NO Existe

**Problema**: No existe un modelo/schema `Program` para gestionar programas académicos.

**Impacto**:

- No se pueden crear programas en Resources Service
- No se puede establecer relación bidireccional `program ↔ coordinator`
- `Resource.programIds` apunta a IDs que no existen en esta base de datos

#### 2. Recursos con programIds Vacíos

**Archivo**: `apps/resources-service/src/database/seed.ts`

```typescript
// Líneas 131, 164, 192, 223
{
  code: "RES-AUD-PRINCIPAL",
  name: "Auditorio Principal",
  // ...
  programIds: [],  // ❌ VACÍO - No asignado a ningún programa
}
```

**Resultado**: Los recursos NO están asociados a programas académicos.

---

### ✅ **Solución Propuesta**

#### 1. Crear Schema Program

**Archivo**: `apps/resources-service/src/infrastructure/schemas/program.schema.ts`

```typescript
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type ProgramDocument = Program & Document;

/**
 * Academic Program MongoDB Schema
 * Schema para programas académicos
 */
@Schema({ timestamps: true, collection: "programs" })
export class Program {
  @Prop({ required: true, unique: true, uppercase: true, trim: true })
  code: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ type: String, trim: true })
  description?: string;

  @Prop({ type: String })
  coordinatorId?: string; // User ID del coordinador

  @Prop({ type: String, trim: true })
  coordinatorName?: string; // Nombre del coordinador (cache)

  @Prop({ type: String, trim: true })
  coordinatorEmail?: string; // Email del coordinador (cache)

  @Prop({ type: String, trim: true })
  faculty?: string; // Facultad a la que pertenece

  @Prop({ type: String, trim: true })
  department?: string; // Departamento

  @Prop({ default: true })
  isActive: boolean;

  @Prop({
    type: {
      createdBy: { type: String, required: true },
      updatedBy: String,
      deletedBy: String,
    },
    _id: false,
  })
  audit?: {
    createdBy: string;
    updatedBy?: string;
    deletedBy?: string;
  };

  @Prop({ type: Date, default: null })
  deletedAt?: Date;
}

export const ProgramSchema = SchemaFactory.createForClass(Program);

// Índices
ProgramSchema.index({ code: 1 }, { unique: true });
ProgramSchema.index({ name: 1 });
ProgramSchema.index({ coordinatorId: 1 });
ProgramSchema.index({ isActive: 1 });
ProgramSchema.index({ createdAt: -1 });
```

#### 2. Actualizar Seed de Resources

```typescript
// IDs fijos según SEED_IDS_REFERENCE.md
const ADMIN_GENERAL_ID = "507f1f77bcf86cd799439022";
const COORDINADOR_SISTEMAS_ID = "507f1f77bcf86cd799439021";
const COORDINADOR_INDUSTRIAL_ID = "507f1f77bcf86cd799439026";

const PROGRAMA_SISTEMAS_ID = "507f1f77bcf86cd799439041";
const PROGRAMA_INDUSTRIAL_ID = "507f1f77bcf86cd799439042";
const PROGRAMA_ELECTRONICA_ID = "507f1f77bcf86cd799439043";

// 1. Crear Programas
const programs = [
  {
    _id: new Types.ObjectId(PROGRAMA_SISTEMAS_ID),
    code: "SIS",
    name: "Ingeniería de Sistemas",
    description: "Programa de pregrado en Ingeniería de Sistemas",
    coordinatorId: COORDINADOR_SISTEMAS_ID,
    coordinatorName: "Juan Docente",
    coordinatorEmail: "juan.docente@ufps.edu.co",
    faculty: "Ingeniería",
    department: "Sistemas e Informática",
    isActive: true,
    audit: {
      createdBy: ADMIN_GENERAL_ID,
      updatedBy: ADMIN_GENERAL_ID,
    },
  },
  {
    _id: new Types.ObjectId(PROGRAMA_INDUSTRIAL_ID),
    code: "IND",
    name: "Ingeniería Industrial",
    description: "Programa de pregrado en Ingeniería Industrial",
    coordinatorId: COORDINADOR_INDUSTRIAL_ID,
    coordinatorName: "Pedro Coordinador",
    coordinatorEmail: "pedro.coordinador@ufps.edu.co",
    faculty: "Ingeniería",
    department: "Industrial",
    isActive: true,
    audit: {
      createdBy: ADMIN_GENERAL_ID,
      updatedBy: ADMIN_GENERAL_ID,
    },
  },
  {
    _id: new Types.ObjectId(PROGRAMA_ELECTRONICA_ID),
    code: "ELE",
    name: "Ingeniería Electrónica",
    description: "Programa de pregrado en Ingeniería Electrónica",
    coordinatorId: undefined, // Aún sin coordinador
    faculty: "Ingeniería",
    department: "Electrónica y Telecomunicaciones",
    isActive: true,
    audit: {
      createdBy: ADMIN_GENERAL_ID,
      updatedBy: ADMIN_GENERAL_ID,
    },
  },
];

// 2. Actualizar Recursos con programIds
const resources = [
  {
    code: "RES-AUD-PRINCIPAL",
    name: "Auditorio Principal",
    // ...
    programIds: [
      PROGRAMA_SISTEMAS_ID,
      PROGRAMA_INDUSTRIAL_ID,
      PROGRAMA_ELECTRONICA_ID,
    ], // ✅ Usado por todos los programas
    audit: {
      createdBy: ADMIN_GENERAL_ID, // Admin crea recursos globales
      updatedBy: ADMIN_GENERAL_ID,
    },
  },
  {
    code: "RES-LAB-SIS-1",
    name: "Laboratorio de Sistemas 1",
    // ...
    programIds: [PROGRAMA_SISTEMAS_ID], // ✅ Solo para Sistemas
    audit: {
      createdBy: COORDINADOR_SISTEMAS_ID, // Coordinador crea recurso de su programa
      updatedBy: COORDINADOR_SISTEMAS_ID,
    },
  },
];
```

---

## 🔴 **CRÍTICO: Availability Service**

### ❌ **Problemas Identificados**

#### 1. Schema Reservation Incompleto

**Archivo**: `apps/availability-service/src/infrastructure/schemas/reservation.schema.ts`

**Campos Faltantes**:

```typescript
// ❌ NO EXISTE en el schema
programId?: Types.ObjectId;           // Programa del usuario
approvalRequestId?: Types.ObjectId;   // Solicitud de aprobación asociada
```

#### 2. Seed sin programId

**Archivo**: `apps/availability-service/src/database/seed.ts`

```typescript
// Líneas 135-148 - Reserva sin programId
{
  resourceId: resourceAuditorioId,
  userId: userDocenteId,
  startDate: new Date(...),
  endDate: new Date(...),
  purpose: "Conferencia sobre IA",
  status: ReservationStatus.COMPLETED,
  // ❌ FALTA: programId
  // ❌ FALTA: approvalRequestId (si fue aprobada)
  audit: {
    createdBy: "docente@ufps.edu.co",  // ⚠️ Email, debería ser ObjectId
  },
}
```

---

### ✅ **Solución Propuesta**

#### Schema Reservation Actualizado

```typescript
@Schema({ collection: "reservations", timestamps: true })
export class Reservation {
  @Prop({ type: Types.ObjectId, required: true })
  resourceId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  userId: Types.ObjectId;

  // 🆕 AGREGAR: Programa académico del usuario
  @Prop({ type: Types.ObjectId, index: true })
  programId?: Types.ObjectId;

  // 🆕 AGREGAR: Referencia a solicitud de aprobación
  @Prop({ type: Types.ObjectId, index: true })
  approvalRequestId?: Types.ObjectId;

  // ... resto de campos ...

  // 🔧 CORREGIR: audit debe usar ObjectIds
  @Prop({
    type: {
      createdBy: Types.ObjectId, // ✅ ObjectId en lugar de string
      updatedBy: Types.ObjectId,
      cancelledBy: Types.ObjectId,
      cancelledAt: Date,
      cancellationReason: String,
    },
    required: true,
  })
  audit: {
    createdBy: Types.ObjectId;
    updatedBy?: Types.ObjectId;
    cancelledBy?: Types.ObjectId;
    cancelledAt?: Date;
    cancellationReason?: string;
  };
}

// 🆕 AGREGAR: Índices
ReservationSchema.index({ programId: 1 });
ReservationSchema.index({ approvalRequestId: 1 });
```

#### Seed Reservation Actualizado

```typescript
// IDs fijos
const COORDINADOR_SISTEMAS_ID = new Types.ObjectId("507f1f77bcf86cd799439021");
const ESTUDIANTE_MARIA_ID = new Types.ObjectId("507f1f77bcf86cd799439023");
const PROGRAMA_SISTEMAS_ID = new Types.ObjectId("507f1f77bcf86cd799439041");
const REQUEST_APROBADA_ID = new Types.ObjectId("507f1f77bcf86cd799439081");

const reservations = [
  // Reserva DIRECTA (sin aprobación)
  {
    resourceId: resourceAuditorioId,
    userId: COORDINADOR_SISTEMAS_ID,
    programId: PROGRAMA_SISTEMAS_ID,          // ✅ Programa del usuario
    approvalRequestId: undefined,             // ✅ Sin aprobación (directa)
    startDate: new Date(...),
    endDate: new Date(...),
    purpose: "Conferencia sobre IA",
    status: ReservationStatus.COMPLETED,
    audit: {
      createdBy: COORDINADOR_SISTEMAS_ID,     // ✅ ObjectId del creador
      updatedBy: COORDINADOR_SISTEMAS_ID,
    },
  },
  // Reserva APROBADA (con solicitud)
  {
    resourceId: resourceAuditorioId,
    userId: ESTUDIANTE_MARIA_ID,
    programId: PROGRAMA_SISTEMAS_ID,          // ✅ Programa del estudiante
    approvalRequestId: REQUEST_APROBADA_ID,   // ✅ Referencia a solicitud
    startDate: new Date(...),
    endDate: new Date(...),
    purpose: "Evento Estudiantil",
    status: ReservationStatus.CONFIRMED,
    audit: {
      createdBy: COORDINADOR_SISTEMAS_ID,     // ✅ Quien aprobó la crea
      updatedBy: COORDINADOR_SISTEMAS_ID,
    },
  },
];
```

---

## 🟡 **MEDIO: Stockpile Service**

### ❌ **Problemas Identificados**

#### 1. Schema ApprovalRequest sin programId

**Archivo**: `apps/stockpile-service/src/infrastructure/schemas/approval-request.schema.ts`

```typescript
@Schema({ collection: "approval_requests", timestamps: true })
export class ApprovalRequest extends Document {
  @Prop({ type: Types.ObjectId, required: true })
  reservationId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  requesterId: Types.ObjectId;

  // ❌ FALTA: programId del recurso solicitado

  // ... resto de campos ...
}
```

---

### ✅ **Solución Propuesta**

#### Schema ApprovalRequest Actualizado

```typescript
@Schema({ collection: "approval_requests", timestamps: true })
export class ApprovalRequest extends Document {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  reservationId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  requesterId: Types.ObjectId;

  // 🆕 AGREGAR: Programa académico del recurso
  @Prop({ type: Types.ObjectId, index: true })
  programId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  approvalFlowId: Types.ObjectId;

  // ... resto de campos ...
}

// 🆕 AGREGAR: Índice
ApprovalRequestSchema.index({ programId: 1 });
```

#### Seed ApprovalRequest Actualizado

```typescript
const ESTUDIANTE_MARIA_ID = new Types.ObjectId("507f1f77bcf86cd799439023");
const PROGRAMA_SISTEMAS_ID = new Types.ObjectId("507f1f77bcf86cd799439041");
const RESERVA_1_ID = new Types.ObjectId("507f1f77bcf86cd799439031");
const FLOW_AUDITORIO_ID = new Types.ObjectId("507f1f77bcf86cd799439071");

const approvalRequests = [
  {
    _id: new Types.ObjectId("507f1f77bcf86cd799439081"),
    reservationId: RESERVA_1_ID,
    requesterId: ESTUDIANTE_MARIA_ID,
    programId: PROGRAMA_SISTEMAS_ID, // ✅ Programa del recurso
    approvalFlowId: FLOW_AUDITORIO_ID,
    status: ApprovalRequestStatus.APPROVED,
    currentStepIndex: 1,
    submittedAt: new Date(),
    approvalHistory: [
      {
        stepName: "Revisión por Coordinador",
        approverId: COORDINADOR_SISTEMAS_ID, // ✅ ObjectId del aprobador
        decision: ApprovalHistoryDecision.APPROVED,
        comment: "Aprobado para evento académico",
        approvedAt: new Date(),
      },
    ],
    createdBy: ESTUDIANTE_MARIA_ID, // ✅ Quien solicita
    updatedBy: COORDINADOR_SISTEMAS_ID, // ✅ Quien aprueba
  },
];
```

---

## 📋 Checklist de Implementación

### Fase 2.2: Auth Service

- [ ] Actualizar `user.schema.ts` con campos: `programId`, `coordinatedProgramId`, `documentType`, `documentNumber`, `phone`
- [ ] Agregar índices al schema
- [ ] Actualizar `seed.ts` con IDs fijos de SEED_IDS_REFERENCE.md
- [ ] Eliminar campo `program` (string) y usar `programId` (ObjectId)
- [ ] Verificar compilación y ejecución del seed

### Fase 2.3: Resources Service

- [ ] Crear `program.schema.ts` completo
- [ ] Agregar Program al módulo de schemas
- [ ] Agregar ProgramRepository (si aplica)
- [ ] Actualizar `seed.ts` para crear programas
- [ ] Actualizar recursos con `programIds` correctos
- [ ] Actualizar `audit.createdBy` según quien crea el recurso
- [ ] Verificar compilación y ejecución del seed

### Fase 2.4: Availability Service

- [ ] Actualizar `reservation.schema.ts` con campos: `programId`, `approvalRequestId`
- [ ] Cambiar `audit.createdBy` de string a Types.ObjectId
- [ ] Agregar índices al schema
- [ ] Actualizar `seed.ts` con ObjectIds en lugar de emails
- [ ] Diferenciar reservas directas vs aprobadas
- [ ] Verificar compilación y ejecución del seed

### Fase 2.5: Stockpile Service

- [ ] Actualizar `approval-request.schema.ts` con campo `programId`
- [ ] Agregar índice al schema
- [ ] Actualizar `seed.ts` con `programId` en approval requests
- [ ] Completar `approvalHistory` con ObjectIds de aprobadores
- [ ] Verificar compilación y ejecución del seed

### Fase 2.6: Reports Service

- [ ] Verificar esquemas y seeds
- [ ] Sincronizar referencias a programas
- [ ] Actualizar campos de tipo string "program" a programId

---

## 🎯 Prioridades de Ejecución

### 🔴 **Prioridad 1 (Hoy)**

1. ✅ Auth Service - Usuarios con programId
2. ✅ Resources Service - Schema Program + seeds

**Razón**: Sin usuarios con programId y sin programa, no se pueden relacionar correctamente.

### 🟡 **Prioridad 2 (Mañana)**

3. ✅ Availability Service - Reservas con programId
4. ✅ Stockpile Service - Approval requests con programId

**Razón**: Dependen de que existan usuarios y programas correctos.

### 🔵 **Prioridad 3 (Después)**

5. ✅ Reports Service - Verificación final
6. ✅ Scripts de validación

**Razón**: Validación y reporting son posteriores a la estructura base.

---

## 📈 Métricas de Progreso

| Fase                     | Estado            | Archivos Modificados | Tiempo Estimado |
| ------------------------ | ----------------- | -------------------- | --------------- |
| 2.1 Verificación         | ✅ COMPLETADO     | 0                    | 1 hora          |
| 2.2 Auth Service         | ⏳ PENDIENTE      | 2                    | 1 hora          |
| 2.3 Resources Service    | ⏳ PENDIENTE      | 3                    | 1.5 horas       |
| 2.4 Availability Service | ⏳ PENDIENTE      | 2                    | 1 hora          |
| 2.5 Stockpile Service    | ⏳ PENDIENTE      | 2                    | 45 min          |
| 2.6 Reports Service      | ⏳ PENDIENTE      | 1-2                  | 30 min          |
| **TOTAL**                | **0% Completado** | **12-13 archivos**   | **~5.5 horas**  |

---

**Última Actualización**: Noviembre 23, 2025 - 9:40 PM  
**Próxima Acción**: Implementar Fase 2.2 - Auth Service Schema y Seed
