# 🔄 Event Bus - Stockpile Service

## 📋 Información General

**Servicio**: `stockpile-service`  
**Responsabilidad**: Flujos de aprobación, validaciones, check-in/check-out y generación de documentos  
**Versión**: 1.0.0

---

## 📤 Eventos Publicados (6 eventos)

### 1. APPROVAL_REQUESTED
**Cuándo**: Al solicitar aprobación para una reserva

**Payload**:
```typescript
interface ApprovalRequestedPayload {
  approvalId: string;
  reservationId: string;
  resourceId: string;
  userId: string;
  requestedBy: string;
  priority: 'low' | 'medium' | 'high';
}
```

**Consumidores**: notificaciones (a aprobadores), `reports-service`

---

### 2. APPROVAL_GRANTED
**Cuándo**: Al aprobar una solicitud de reserva

**Payload**:
```typescript
interface ApprovalGrantedPayload {
  approvalId: string;
  reservationId: string;
  resourceId: string;
  userId: string;
  approvedBy: string;
  comments?: string;
}
```

**Consumidores**: `availability-service` (confirmar reserva), notificaciones, `reports-service`

---

### 3. APPROVAL_REJECTED
**Cuándo**: Al rechazar una solicitud de reserva

**Payload**:
```typescript
interface ApprovalRejectedPayload {
  approvalId: string;
  reservationId: string;
  resourceId: string;
  userId: string;
  rejectedBy: string;
  reason: string;
}
```

**Consumidores**: `availability-service` (rechazar reserva), notificaciones, `reports-service`

---

### 4. DOCUMENT_GENERATED
**Cuándo**: Al generar documento (carta de aprobación, rechazo, etc.)

**Payload**:
```typescript
interface DocumentGeneratedPayload {
  documentId: string;
  documentType: 'approval_letter' | 'rejection_letter' | 'confirmation' | 'report';
  relatedEntityId: string;
  relatedEntityType: 'approval' | 'reservation' | 'user';
  fileUrl: string;
  generatedBy: string;
}
```

**Consumidores**: notificaciones (enviar documento), `reports-service`

---

### 5. CHECK_IN_COMPLETED
**Cuándo**: Al completar check-in de una reserva

**Payload**:
```typescript
interface CheckInCompletedPayload {
  checkInId: string;
  reservationId: string;
  resourceId: string;
  userId: string;
  checkInTime: Date;
  location?: string;
  verifiedBy?: string;
}
```

**Consumidores**: `resources-service`, `reports-service`, vigilancia

---

### 6. CHECK_OUT_COMPLETED
**Cuándo**: Al completar check-out de una reserva

**Payload**:
```typescript
interface CheckOutCompletedPayload {
  checkOutId: string;
  reservationId: string;
  resourceId: string;
  userId: string;
  checkOutTime: Date;
  resourceCondition?: 'good' | 'damaged' | 'needs_maintenance';
  notes?: string;
  verifiedBy?: string;
}
```

**Consumidores**: `resources-service` (actualizar estado), `reports-service`, vigilancia

---

## 📥 Eventos Consumidos

### De `availability-service`:
- **RESERVATION_CREATED**: Iniciar flujo de aprobación si es necesario
- **RESERVATION_CONFIRMED**: Preparar check-in

### De `auth-service`:
- **ROLE_ASSIGNED**: Actualizar permisos de aprobación
- **PERMISSION_GRANTED**: Actualizar capacidades de aprobación

---

## 🔧 Configuración del Event Bus

**Exchange**: `bookly.events`  
**Prefijo de routing keys**: `stockpile.*`

### Routing Keys

| Evento | Routing Key |
|--------|-------------|
| APPROVAL_REQUESTED | `stockpile.approval.requested` |
| APPROVAL_GRANTED | `stockpile.approval.granted` |
| APPROVAL_REJECTED | `stockpile.approval.rejected` |
| DOCUMENT_GENERATED | `stockpile.document.generated` |
| CHECK_IN_COMPLETED | `stockpile.checkin.completed` |
| CHECK_OUT_COMPLETED | `stockpile.checkout.completed` |

---

## 📊 Métricas y Monitoreo

### Alertas Recomendadas
- ⚠️ `APPROVAL_REQUESTED` con prioridad `high` sin respuesta en 2 horas
- ⚠️ `CHECK_OUT_COMPLETED` con `resourceCondition: damaged`
- ⚠️ Reservas sin `CHECK_IN_COMPLETED` después de hora de inicio

---

**Última actualización**: 1 de diciembre de 2024
