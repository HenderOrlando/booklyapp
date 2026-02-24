# RF-14: Lista de Espera

**Estado**: ✅ Completado

**Prioridad**: Media

**Fecha de Implementación**: Noviembre 6, 2025

---

## 📋 Descripción

Sistema de lista de espera automática para recursos ocupados con notificaciones cuando se liberan, priorización FIFO, expiración de solicitudes y procesamiento asíncrono.

---

## ✅ Criterios de Aceptación

- [x] Agregar usuario a lista de espera
- [x] Prioridad FIFO (First In, First Out)
- [x] Notificación automática cuando se libera recurso
- [x] Expiración automática de solicitudes (24 horas)
- [x] Usuario puede aceptar/rechazar notificación
- [x] Procesamiento automático al cancelarse reserva
- [x] Múltiples usuarios en espera simultáneos
- [x] Posición en cola visible

---

## 🏗️ Implementación

### Componentes Desarrollados

**Controllers**:

- `WaitlistController` - Gestión de lista de espera

**Services**:

- `WaitlistService` - Lógica de cola
- `WaitlistProcessorService` - Procesamiento automático

**Commands**:

- `AddToWaitlistCommand` - Agregar a cola
- `RemoveFromWaitlistCommand` - Remover
- `ProcessWaitlistCommand` - Procesar cuando se libera

**Jobs**:

- `WaitlistExpirationJob` - Expiración automática

---

### Endpoints Creados

```http
POST   /api/waitlist                  # Agregar a espera
GET    /api/waitlist/user/:userId     # Ver posición
DELETE /api/waitlist/:id              # Salir de espera
POST   /api/waitlist/:id/accept       # Aceptar oferta
```

---

## 🗄️ Base de Datos

```prisma
model Waitlist {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId

  userId        String   @db.ObjectId
  resourceId    String   @db.ObjectId

  desiredDate   DateTime
  desiredStart  String
  desiredEnd    String

  status        String   @default("WAITING") // WAITING, NOTIFIED, ACCEPTED, EXPIRED
  position      Int

  notifiedAt    DateTime?
  expiresAt     DateTime

  createdAt     DateTime @default(now())

  @@index([resourceId, status])
  @@index([userId])
  @@map("waitlist")
}
```

---

## ⚡ Performance

- Cola ordenada con índice en position
- Procesamiento asíncrono con jobs
- Notificaciones en batch

---

## 📚 Documentación Relacionada

- [Base de Datos](../DATABASE.md#4-waitlist)

---

**Mantenedor**: Bookly Development Team
