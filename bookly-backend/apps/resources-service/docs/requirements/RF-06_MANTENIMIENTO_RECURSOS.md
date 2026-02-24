# RF-06: Gestión de Mantenimiento de Recursos

**Estado**: ✅ Completado

**Prioridad**: Media

**Fecha de Implementación**: Octubre 29, 2025

---

## 📋 Descripción

Implementar sistema de gestión de mantenimiento preventivo, correctivo y de emergencia para recursos, con registro histórico, bloqueo automático de disponibilidad durante mantenimiento y notificaciones a usuarios con reservas afectadas.

---

## ✅ Criterios de Aceptación

- [x] Crear y programar registros de mantenimiento
- [x] Tipos: PREVENTIVE, CORRECTIVE, EMERGENCY, CLEANING
- [x] Estados: SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
- [x] Bloqueo automático de recurso durante mantenimiento
- [x] Historial completo de mantenimientos por recurso
- [x] Notificaciones a usuarios con reservas afectadas
- [x] Marcar recurso como no disponible automáticamente

---

## 🏗️ Implementación

### Componentes Desarrollados

**Controllers**:

- `MaintenanceController` - CRUD de mantenimientos

**Services**:

- `MaintenanceService` - Lógica de gestión de mantenimiento
- `ResourceService` - Actualización de estado del recurso

**Repositories**:

- `PrismaMaintenanceRecordRepository` - Persistencia

**Commands**:

- `ScheduleMaintenanceCommand` - Programar mantenimiento
- `StartMaintenanceCommand` - Iniciar mantenimiento
- `CompleteMaintenanceCommand` - Finalizar mantenimiento

**Queries**:

- `GetMaintenanceHistoryQuery` - Historial por recurso
- `GetScheduledMaintenanceQuery` - Mantenimientos programados

---

### Endpoints Creados

```http
POST   /api/maintenance              # Crear registro
GET    /api/maintenance/resource/:id # Historial por recurso
PATCH  /api/maintenance/:id/status   # Actualizar estado
GET    /api/maintenance/scheduled    # Mantenimientos programados
```

---

## 🗄️ Base de Datos

```prisma
model MaintenanceRecord {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  resourceId  String   @db.ObjectId
  type        String   // PREVENTIVE, CORRECTIVE, EMERGENCY, CLEANING
  status      String   // SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED

  scheduledDate  DateTime
  startDate      DateTime?
  completedDate  DateTime?

  description    String
  performedBy    String?
  notes          String?

  createdAt   DateTime @default(now())

  @@index([resourceId])
  @@index([status])
  @@map("maintenance_records")
}

model Resource {
  maintenanceStatus String @default("OPERATIONAL") // OPERATIONAL, MAINTENANCE, OUT_OF_SERVICE
}
```

---

## 📚 Documentación Relacionada

- [Base de Datos](../DATABASE.md#3-maintenancerecord)
- [Endpoints](../ENDPOINTS.md#mantenimiento-maintenance)

---

**Mantenedor**: Bookly Development Team
