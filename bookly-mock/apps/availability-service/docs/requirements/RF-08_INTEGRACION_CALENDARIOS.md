# RF-08: Integración con Calendarios Externos

**Estado**: ✅ Completado

**Prioridad**: Media

**Fecha de Implementación**: Octubre 31, 2025

---

## 📋 Descripción

Integración bidireccional con calendarios externos (Google Calendar, Outlook, iCal) para sincronizar automáticamente reservas de recursos, permitiendo a usuarios visualizar y gestionar sus reservas desde sus calendarios personales.

---

## ✅ Criterios de Aceptación

- [x] Autenticación OAuth2 con Google Calendar
- [x] Sincronización bidireccional (Bookly ↔ Calendario)
- [x] Manejo automático de conflictos
- [x] Actualización en tiempo real de cambios
- [x] Soporte para múltiples proveedores (Google, Outlook, iCal)
- [x] Desconexión segura de calendarios
- [x] Sincronización selectiva por tipo de reserva

---

## 🏗️ Implementación

### Componentes Desarrollados

**Controllers**:

- `CalendarIntegrationController` - Gestión de integraciones

**Services**:

- `CalendarSyncService` - Lógica de sincronización
- `GoogleCalendarService` - Integración Google
- `OutlookCalendarService` - Integración Outlook
- `ICalService` - Integración iCal

**Repositories**:

- `PrismaCalendarIntegrationRepository` - Persistencia de configuración

**Commands**:

- `ConnectCalendarCommand` - Conectar calendario
- `SyncReservationCommand` - Sincronizar reserva
- `DisconnectCalendarCommand` - Desconectar

---

### Endpoints Creados

```http
GET  /api/calendar/connect/:provider      # Iniciar OAuth
POST /api/calendar/callback/:provider     # Callback OAuth
GET  /api/calendar/integrations           # Listar integraciones
DELETE /api/calendar/integrations/:id     # Desconectar
```

---

## 🗄️ Base de Datos

```prisma
model CalendarIntegration {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  userId        String   @db.ObjectId
  provider      String   // GOOGLE, OUTLOOK, ICAL
  accessToken   String
  refreshToken  String?
  expiresAt     DateTime?
  syncEnabled   Boolean  @default(true)
  calendarId    String
  lastSync      DateTime?

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([userId])
  @@index([provider])
  @@map("calendar_integrations")
}
```

---

## 📚 Documentación Relacionada

- [Base de Datos](../DATABASE.md#6-calendarintegration)

---

**Mantenedor**: Bookly Development Team
