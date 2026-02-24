# RF-20: Validar Solicitudes de Reserva

**Estado**: ✅ Completado

**Prioridad**: Alta

**Fecha de Implementación**: Noviembre 7, 2025

---

## 📋 Descripción

Sistema de validación de solicitudes de reserva con flujos de aprobación multi-nivel configurables por tipo de recurso, permitiendo asignación de aprobadores por rol, notificaciones automáticas y trazabilidad completa.

---

## ✅ Criterios de Aceptación

- [x] Múltiples pasos de aprobación configurables
- [x] Flujos diferenciados por tipo de recurso
- [x] Notificaciones automáticas en cada paso
- [x] Aprobadores asignables por rol o usuario específico
- [x] Aprobación/rechazo con comentarios
- [x] Escalamiento automático si no hay respuesta
- [x] SLA por paso de aprobación
- [x] Dashboard para aprobadores

---

## 🏗️ Implementación

### Componentes Desarrollados

**Controllers**:

- `ApprovalController` - Gestión de aprobaciones
- `ApprovalFlowController` - Configuración de flujos

**Services**:

- `ApprovalFlowService` - Lógica de flujos
- `ApprovalProcessorService` - Procesamiento de solicitudes
- `EscalationService` - Escalamiento automático

**Repositories**:

- `PrismaApprovalRequestRepository` - Solicitudes
- `PrismaApprovalFlowRepository` - Configuración de flujos

**Commands**:

- `SubmitApprovalRequestCommand` - Enviar solicitud
- `ApproveRequestCommand` - Aprobar
- `RejectRequestCommand` - Rechazar
- `ConfigureFlowCommand` - Configurar flujo

**Queries**:

- `GetPendingApprovalsQuery` - Aprobaciones pendientes
- `GetApprovalHistoryQuery` - Historial

---

### Endpoints Creados

```http
POST   /api/approvals/request         # Enviar solicitud
POST   /api/approvals/:id/approve     # Aprobar
POST   /api/approvals/:id/reject      # Rechazar
GET    /api/approvals/pending         # Pendientes
GET    /api/approvals/history/:id     # Historial

# Configuración de flujos
GET    /api/approval-flows            # Listar flujos
POST   /api/approval-flows            # Crear flujo
PATCH  /api/approval-flows/:id        # Actualizar
```

**Permisos**: `approvals:manage`, `approvals:configure`

---

### Eventos Publicados

- `ApprovalRequestedEvent` - Solicitud enviada
- `ApprovalGrantedEvent` - Aprobación otorgada
- `ApprovalRejectedEvent` - Solicitud rechazada
- `ApprovalEscalatedEvent` - Escalamiento

**Routing Keys**:

- `stockpile.approval.requested`
- `stockpile.approval.granted`
- `stockpile.approval.rejected`

---

## 🗄️ Base de Datos

```prisma
model ApprovalRequest {
  id              String   @id @default(auto()) @map("_id") @db.ObjectId
  reservationId   String   @db.ObjectId
  
  flowId          String   @db.ObjectId
  currentStep     Int      @default(0)
  totalSteps      Int
  
  status          String   @default("PENDING") // PENDING, APPROVED, REJECTED, ESCALATED
  
  approvalHistory Json[]   // Historial de aprobaciones
  
  requestedBy     String   @db.ObjectId
  requestedAt     DateTime @default(now())
  completedAt     DateTime?
  
  @@index([status])
  @@index([requestedBy])
  @@map("approval_requests")
}

model ApprovalFlow {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  name        String
  resourceType String
  
  steps       Json[]   // [{ order, approverRole, approverUserId?, slaHours }]
  
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  
  @@index([resourceType])
  @@map("approval_flows")
}
```

---

## ⚡ Performance

- Índices en status para queries rápidas
- Jobs para escalamiento automático
- Cache de flujos activos

---

## 📚 Documentación Relacionada

- [Arquitectura](../ARCHITECTURE.md)
- [Base de Datos](../DATABASE.md#1-approvalrequest)
- [Event Bus](../EVENT_BUS.md)

---

**Mantenedor**: Bookly Development Team
