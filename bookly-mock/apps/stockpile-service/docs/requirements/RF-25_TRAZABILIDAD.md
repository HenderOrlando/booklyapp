# RF-25: Registro y Trazabilidad de Aprobaciones

**Estado**: ✅ Completado

**Prioridad**: Alta

**Fecha de Implementación**: Noviembre 8, 2025

---

## 📋 Descripción

Sistema completo de auditoría y trazabilidad para todas las acciones relacionadas con solicitudes de aprobación, garantizando un historial inmutable de decisiones, cambios y eventos críticos que cumple con requerimientos de compliance y regulaciones institucionales.

---

## ✅ Criterios de Aceptación

- [x] Registro automático de todas las acciones en solicitudes de aprobación
- [x] 11 tipos de acciones rastreadas con granularidad detallada
- [x] Historial inmutable ordenado cronológicamente
- [x] Metadatos extensibles por tipo de acción
- [x] Consultas avanzadas por múltiples criterios
- [x] Verificación de integridad del trail de auditoría
- [x] Estadísticas agregadas de auditoría
- [x] Exportación de logs para reportes de compliance
- [x] Eventos publicados para acciones críticas
- [x] Índices optimizados para consultas frecuentes
- [x] TTL automático para logs antiguos (2 años)

---

## 🏗️ Implementación

### Componentes Desarrollados

**Entities (Domain)**:

- `ApprovalAuditLogEntity` - Entidad de dominio con lógica de negocio
  - Métodos de clasificación: `isApprovalAction()`, `isRejectionAction()`, `isCriticalAction()`
  - Factory methods: `createRequestLog()`, `createStepApprovalLog()`, `createStepRejectionLog()`
  - Utilidades: `getActionDescription()`, `toObject()`, `fromObject()`

**Services**:

- `ApprovalAuditService` - Orquestador de auditoría
  - Registro de acciones con publicación de eventos EDA
  - Consultas especializadas por criterio
  - Verificación de integridad del trail
  - Estadísticas agregadas
  - Exportación para compliance

**Repositories**:

- `IApprovalAuditLogRepository` - Interface de persistencia
- `ApprovalAuditLogRepository` - Implementación Mongoose

**Schemas (Mongoose)**:

- `ApprovalAuditLogSchema` - Schema MongoDB con índices optimizados
- `ChangeItem` - Sub-esquema para tracking de cambios field-level

---

### Tipos de Acciones Rastreadas

El sistema rastrea **11 tipos de acciones** definidas en `ApprovalAuditLogActionType`:

| Acción               | Código               | Descripción                   | Crítica |
| -------------------- | -------------------- | ----------------------------- | ------- |
| `REQUEST_CREATED`    | `REQUEST_CREATED`    | Solicitud creada              | No      |
| `STEP_APPROVED`      | `STEP_APPROVED`      | Paso de aprobación completado | No      |
| `STEP_REJECTED`      | `STEP_REJECTED`      | Paso rechazado                | No      |
| `REQUEST_APPROVED`   | `REQUEST_APPROVED`   | Solicitud aprobada finalmente | ✅ Sí   |
| `REQUEST_REJECTED`   | `REQUEST_REJECTED`   | Solicitud rechazada           | ✅ Sí   |
| `REQUEST_CANCELLED`  | `REQUEST_CANCELLED`  | Solicitud cancelada           | ✅ Sí   |
| `DOCUMENT_GENERATED` | `DOCUMENT_GENERATED` | Documento PDF generado        | No      |
| `NOTIFICATION_SENT`  | `NOTIFICATION_SENT`  | Notificación enviada          | No      |
| `FLOW_ASSIGNED`      | `FLOW_ASSIGNED`      | Flujo de aprobación asignado  | No      |
| `DEADLINE_EXTENDED`  | `DEADLINE_EXTENDED`  | Plazo extendido               | No      |
| `COMMENT_ADDED`      | `COMMENT_ADDED`      | Comentario agregado           | No      |

**Acciones críticas** (3): Publican eventos automáticamente vía Event Bus para alertas y notificaciones.

---

### Endpoints Creados

Aunque no hay controller dedicado, el `ApprovalRequestController` expone indirectamente auditoría vía:

```http
# Historial de una solicitud (incluye audit trail)
GET /api/v1/approval-requests/:id/history

# Estadísticas de aprobaciones (usa audit logs)
GET /api/v1/approval-requests/statistics
```

**Endpoints potenciales para agregar**:

```http
GET  /api/v1/audit-logs/request/:requestId    # Logs de una solicitud
GET  /api/v1/audit-logs/actor/:actorId        # Logs de un aprobador
GET  /api/v1/audit-logs/statistics            # Estadísticas de auditoría
POST /api/v1/audit-logs/export                # Exportar logs
GET  /api/v1/audit-logs/verify/:requestId     # Verificar integridad
```

---

### Métodos del Service

#### Registro de Acciones

```typescript
// Registro genérico
logAction(data: Omit<ApprovalAuditLogEntity, 'id' | 'createdAt'>): Promise<ApprovalAuditLogEntity>

// Métodos especializados
logRequestCreation(requestId, actorId, actorRole, metadata?): Promise<ApprovalAuditLogEntity>
logStepApproval(requestId, actorId, actorRole, stepName, comment?, metadata?): Promise<ApprovalAuditLogEntity>
logStepRejection(requestId, actorId, actorRole, stepName, comment?, metadata?): Promise<ApprovalAuditLogEntity>
logRequestApproval(requestId, actorId, actorRole, metadata?): Promise<ApprovalAuditLogEntity>
logRequestRejection(requestId, actorId, actorRole, metadata?): Promise<ApprovalAuditLogEntity>
logRequestCancellation(requestId, actorId, actorRole, metadata?): Promise<ApprovalAuditLogEntity>
logDocumentGeneration(requestId, actorId, actorRole, documentId, metadata?): Promise<ApprovalAuditLogEntity>
logNotificationSent(requestId, actorId, actorRole, notificationId, metadata?): Promise<ApprovalAuditLogEntity>
```

#### Consultas

```typescript
// Por solicitud
getRequestLogs(requestId: string): Promise<ApprovalAuditLogEntity[]>

// Por actor (aprobador)
getActorLogs(actorId: string): Promise<ApprovalAuditLogEntity[]>

// Consulta avanzada con filtros
getLogsWithFilters(filters: {
  requestId?: string;
  actorId?: string;
  actions?: ApprovalAuditLogActionType[];
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}): Promise<{ logs: ApprovalAuditLogEntity[]; total: number }>

// Estadísticas agregadas
getStatistics(filters?: { startDate?: Date; endDate?: Date }): Promise<{
  totalLogs: number;
  byAction: Record<ApprovalAuditLogActionType, number>;
  byActor: Record<string, number>;
  criticalActions: number;
}>

// Exportación para compliance
exportLogs(filters: { requestId?: string; startDate?: Date; endDate?: Date }): Promise<any[]>

// Verificación de integridad
verifyAuditTrail(requestId: string): Promise<{
  isValid: boolean;
  issues: string[];
  logs: ApprovalAuditLogEntity[];
}>
```

---

### Eventos Publicados

Para **acciones críticas** (`REQUEST_APPROVED`, `REQUEST_REJECTED`, `REQUEST_CANCELLED`):

```typescript
Event: "approval-request.audit";
Payload: {
  eventId: string; // ID del log
  eventType: "APPROVAL_AUDIT_CRITICAL_ACTION";
  service: "stockpile-service";
  timestamp: Date;
  data: ApprovalAuditLogEntity;
  metadata: {
    approvalRequestId: string;
    action: ApprovalAuditLogActionType;
  }
}
```

**Consumidores potenciales**:

- `reports-service` - Generar alertas de compliance
- `auth-service` - Notificar administradores
- `api-gateway` - Dashboard de auditoría en tiempo real

---

## 🗄️ Base de Datos

### Schema MongoDB

```prisma
model ApprovalAuditLog {
  id                  String   @id @default(auto()) @map("_id") @db.ObjectId
  approvalRequestId   String   @db.ObjectId
  action              String   // Enum: ApprovalAuditLogActionType
  actorId             String   @db.ObjectId
  actorRole           String
  timestamp           DateTime
  metadata            Json?
  changes             Json[]   // Array de { field, oldValue, newValue }

  createdAt           DateTime @default(now())

  @@index([approvalRequestId, timestamp(sort: Desc)])
  @@index([actorId, timestamp(sort: Desc)])
  @@index([action, timestamp(sort: Desc)])
  @@index([timestamp(sort: Desc)])
  @@index([createdAt], { expireAfterSeconds: 63072000 }) // TTL 2 años
  @@map("approval_audit_logs")
}
```

### Índices Compuestos

- `approvalRequestId + timestamp` - Historial de solicitud (consulta más frecuente)
- `actorId + timestamp` - Acciones de un aprobador
- `action + timestamp` - Filtrar por tipo de acción
- `metadata.stepName` - Buscar por paso específico
- `createdAt` - TTL index (auto-eliminar logs > 2 años)

---

## 🔒 Seguridad y Compliance

### Inmutabilidad

- ✅ **No hay endpoints de DELETE** - Los logs son inmutables
- ✅ **No hay endpoints de UPDATE** - Solo INSERT permitido
- ✅ **Timestamps automáticos** - MongoDB genera `createdAt`
- ✅ **Hash de verificación** - Opcional para validar integridad

### Regulaciones Cubiertas

1. **GDPR** - Trazabilidad de quién accedió/modificó datos de usuarios
2. **SOX** - Auditoría de decisiones financieras (recursos costosos)
3. **ISO 27001** - Control de accesos y cambios
4. **FERPA** (Educación) - Registro de acceso a información estudiantil

### Retención de Datos

- **TTL configurado**: 2 años (63,072,000 segundos)
- **Exportación antes de expiración**: Método `exportLogs()` para archivar
- **Configurable**: TTL puede ajustarse por institución

---

## ⚡ Performance

### Optimizaciones Implementadas

1. **Índices Compuestos** - Consultas rápidas por criterios frecuentes
2. **Proyecciones** - Solo campos necesarios en consultas
3. **Paginación** - `limit` y `offset` en consultas masivas
4. **Cache** - Estadísticas agregadas cacheadas en Redis
5. **Bulk Inserts** - Logs en lote para operaciones masivas
6. **TTL Index** - Auto-limpieza de logs antiguos

### Métricas Esperadas

- **Inserción**: < 10ms (promedio)
- **Consulta por requestId**: < 50ms (índice compuesto)
- **Consulta avanzada**: < 200ms (con filtros y paginación)
- **Verificación de integridad**: < 500ms (1 solicitud con ~50 logs)

---

## 📊 Casos de Uso

### 1. Auditoría de Decisión

**Escenario**: Revisar quién aprobó/rechazó una solicitud de auditorio

```typescript
const logs = await auditService.getRequestLogs(requestId);
const approvalLog = logs.find((log) => log.action === "REQUEST_APPROVED");

console.log(`Aprobado por: ${approvalLog.actorId}`);
console.log(`Rol: ${approvalLog.actorRole}`);
console.log(`Fecha: ${approvalLog.timestamp}`);
```

### 2. Compliance Report

**Escenario**: Exportar todas las aprobaciones del último trimestre

```typescript
const startDate = new Date("2025-08-01");
const endDate = new Date("2025-10-31");

const logs = await auditService.exportLogs({ startDate, endDate });
// Generar PDF/Excel con logs para auditoría externa
```

### 3. Detección de Anomalías

**Escenario**: Verificar integridad de una solicitud sospechosa

```typescript
const { isValid, issues, logs } =
  await auditService.verifyAuditTrail(requestId);

if (!isValid) {
  console.warn("Trail de auditoría corrupto:", issues);
  // Alertar a administradores
}
```

### 4. Dashboard de Actividad

**Escenario**: Mostrar actividad de aprobadores en tiempo real

```typescript
const stats = await auditService.getStatistics({
  startDate: new Date("2025-11-01"),
  endDate: new Date(),
});

console.log(`Total acciones: ${stats.totalLogs}`);
console.log(`Aprobaciones: ${stats.byAction.REQUEST_APPROVED}`);
console.log(`Aprobador más activo: ${Object.entries(stats.byActor)[0]}`);
```

---

## 🔗 Integración con Otros Componentes

### Con ApprovalRequestService

El `ApprovalRequestService` invoca automáticamente `ApprovalAuditService` en cada acción:

```typescript
// En ApprovalRequestService
async approveRequest(requestId, actorId, actorRole) {
  // ... lógica de aprobación ...

  // Registrar en auditoría
  await this.auditService.logRequestApproval(requestId, actorId, actorRole, {
    timestamp: new Date(),
    metadata: { /* ... */ }
  });

  // ... continuar ...
}
```

### Con NotificationService

Cuando se envía notificación, se registra:

```typescript
await this.auditService.logNotificationSent(
  requestId,
  "system",
  "SYSTEM",
  notificationId,
  { channel: "EMAIL", recipient: userEmail }
);
```

### Con Event Bus (EDA)

Acciones críticas publican eventos:

```typescript
// Publicado automáticamente por ApprovalAuditService
await eventBus.publish("approval-request.audit", {
  eventType: "APPROVAL_AUDIT_CRITICAL_ACTION",
  data: {
    /* ... */
  },
});
```

---

## 📚 Documentación Relacionada

- [RF-20: Validar Solicitudes](./RF-20_VALIDAR_SOLICITUDES.md)
- [RF-24: Flujos Diferenciados](./RF-24_FLUJOS_DIFERENCIADOS.md)
- [Base de Datos](../DATABASE.md#5-approvalauditlog)
- [Event Bus](../EVENT_BUS.md)
- [ARCHITECTURE](../ARCHITECTURE.md#domain-entities)

---

## 🎯 Mejoras Futuras

### Corto Plazo

- [ ] Controller dedicado para consultas de auditoría
- [ ] Dashboard visual de auditoría en api-gateway
- [ ] Webhooks para acciones críticas

### Mediano Plazo

- [ ] Machine Learning para detección de patrones anómalos
- [ ] Integración con SIEM (Security Information and Event Management)
- [ ] Firma criptográfica de logs para inmutabilidad garantizada
- [ ] Blockchain para trail de auditoría distribuido

### Largo Plazo

- [ ] Auditoría predictiva (alertas antes de problemas)
- [ ] Cumplimiento automatizado de regulaciones
- [ ] Exportación automática a sistemas gubernamentales

---

**Mantenedor**: Bookly Development Team  
**Última Actualización**: Noviembre 12, 2025
