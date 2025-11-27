# 🌱 Stockpile Service - Seeds

**Fecha**: Noviembre 23, 2025  
**Versión**: 2.0 (Refactorizado para idempotencia)

---

## 📖 Descripción

Seeds del Stockpile Service para poblar datos iniciales de aprobaciones y notificaciones:

- **Approval Flows** (3): Flujos de aprobación configurables
- **Document Templates** (3): Plantillas para generación de documentos
- **Approval Requests** (2): Solicitudes de aprobación de ejemplo
- **Notifications** (2): Notificaciones asociadas a solicitudes

---

## 🚀 Ejecución

```bash
# Ejecutar seeds (idempotente)
npm run seed:stockpile

# Limpiar DB antes (destructivo)
npm run seed:stockpile -- --clean
```

### ⚠️ Idempotencia

Los seeds son **100% idempotentes**:

- Usa `findOneAndUpdate` con `upsert: true`
- Filtros únicos por `name` o `reservationId`
- Seguro ejecutar múltiples veces

---

## 🌾 Datos Creados

### Approval Flows

| Nombre                   | Tipos de Recursos | Steps | Auto-aprobación |
| ------------------------ | ----------------- | ----- | --------------- |
| Aprobación de Auditorio  | AUDITORIUM        | 2     | No              |
| Aprobación de Equipo     | EQUIPMENT         | 1     | No              |
| Auto-aprobación de Salas | MEETING_ROOM      | 1     | Sí              |

**Estructura v2.0**:

```typescript
{
  name: string,
  resourceTypes: string[],              // Array de enums
  steps: [{
    name: string,
    approverRoles: string[],            // Array de roles
    order: number,
    isRequired: boolean,
    allowParallel: boolean
  }],
  isActive: boolean,
  createdBy: Types.ObjectId,
  updatedBy: Types.ObjectId
}
```

### Document Templates

| Nombre              | Tipo        | Formato |
| ------------------- | ----------- | ------- |
| Carta de Aprobación | APPROVAL    | PDF     |
| Carta de Rechazo    | REJECTION   | PDF     |
| Certificado de Uso  | CERTIFICATE | PDF     |

**Estructura v2.0**:

```typescript
{
  name: string,
  type: DocumentTemplateType,           // Enum
  description: string,
  template: string,                     // HTML template
  variables: string[],
  isActive: boolean,
  format: DocumentTemplateFormat,       // Enum
  audit: {
    createdBy: Types.ObjectId,
    updatedBy: Types.ObjectId
  }
}
```

### Approval Requests

| Status   | Reservation ID | Requester  | Current Step  |
| -------- | -------------- | ---------- | ------------- |
| APPROVED | ...031         | Docente    | 2 (Completed) |
| PENDING  | ...032         | Estudiante | 0 (Pending)   |

**Estructura v2.0**:

```typescript
{
  reservationId: Types.ObjectId,        // ObjectId fijo
  requesterId: Types.ObjectId,
  approvalFlowId: Types.ObjectId,
  status: ApprovalRequestStatus,        // Enum
  currentStepIndex: number,
  submittedAt: Date,
  completedAt?: Date,
  approvalHistory: [{
    stepName: string,
    approverId: Types.ObjectId,
    decision: ApprovalHistoryDecision,  // Enum
    comment?: string,
    approvedAt: Date
  }],
  createdBy: Types.ObjectId,
  updatedBy?: Types.ObjectId
}
```

### Notifications

| Recipient  | Type             | Channel | Status |
| ---------- | ---------------- | ------- | ------ |
| Docente    | APPROVAL         | EMAIL   | SENT   |
| Estudiante | PENDING_APPROVAL | EMAIL   | SENT   |

**Estructura v2.0**:

```typescript
{
  recipientId: Types.ObjectId,
  recipientName: string,
  type: NotificationType,               // Enum
  channel: NotificationChannel,         // Enum
  subject: string,
  message: string,
  status: NotificationStatus,           // Enum
  relatedEntity: string,
  relatedEntityId: Types.ObjectId,
  sentAt?: Date,
  audit: {
    createdBy: Types.ObjectId
  }
}
```

---

## 🔑 Cambios Clave v2.0

### ✅ Implementado

- Schemas correctos en lugar de Entities
- ObjectIds fijos para consistencia
- Enums correctos en todos los campos
- Estructura `audit` completa
- Lógica idempotente con `findOneAndUpdate`
- Flag `--clean` para limpieza controlada
- Verificado: ejecutado 2 veces sin errores

### 🎯 ObjectIds Fijos

```typescript
// Sistema
const systemUserId = "507f1f77bcf86cd799439000";

// Reservas
const reservation1Id = "507f1f77bcf86cd799439031";
const reservation2Id = "507f1f77bcf86cd799439032";

// Usuarios
const userDocenteId = "507f1f77bcf86cd799439021";
const userEstudianteId = "507f1f77bcf86cd799439023";
const userAdminId = "507f1f77bcf86cd799439022";
```

---

**Última actualización**: Noviembre 23, 2025  
**Estado**: Refactor completado y verificado ✅
