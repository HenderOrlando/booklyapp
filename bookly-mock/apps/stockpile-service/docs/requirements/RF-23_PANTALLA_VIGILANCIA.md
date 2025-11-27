# RF-23: Pantalla de Control - Vigilancia

**Estado**: ✅ Completado

**Prioridad**: Media

**Fecha de Implementación**: Noviembre 10, 2025

---

## 📋 Descripción

Dashboard en tiempo real para personal de vigilancia con visualización de reservas activas, check-in/check-out digital, verificación de identidad, geolocalización y actualizaciones instantáneas vía WebSockets.

---

## ✅ Criterios de Aceptación

- [x] Visualización de reservas activas en tiempo real
- [x] Check-in y check-out digital con código QR
- [x] Verificación de identidad (documento + foto)
- [x] Geolocalización de usuarios en campus
- [x] WebSockets para actualizaciones instantáneas
- [x] Alertas de anomalías (no-show, retrasos)
- [x] Registro de incidencias
- [x] Historial de accesos por recurso
- [x] Dashboard responsivo (tablet/desktop)

---

## 🏗️ Implementación

### Componentes Desarrollados

**Controllers**:

- `CheckInOutController` - Gestión de entradas/salidas
- `MonitoringController` - Dashboard de vigilancia

**Services**:

- `CheckInOutService` - Lógica de check-in/out
- `MonitoringService` - Datos de dashboard
- `QRVerificationService` - Verificación de QR

**WebSocket Gateways**:

- `MonitoringGateway` - Actualizaciones en tiempo real

**Repositories**:

- `PrismaCheckInOutRepository` - Registros de acceso

**Commands**:

- `PerformCheckInCommand` - Registrar entrada
- `PerformCheckOutCommand` - Registrar salida
- `ReportIncidentCommand` - Reportar incidencia

---

### Endpoints Creados

```http
POST /api/checkin                     # Check-in
POST /api/checkout                    # Check-out
GET  /api/monitoring/active           # Reservas activas
GET  /api/monitoring/history/:resourceId
POST /api/monitoring/incident         # Reportar incidencia
```

**WebSocket Events**:

```typescript
// Cliente escucha
'reservation:checkin'     // Nuevo check-in
'reservation:checkout'    // Nuevo check-out
'reservation:alert'       // Alerta de anomalía
'monitoring:update'       // Actualización general
```

---

### Eventos Publicados

- `CheckInRecordedEvent` - Check-in registrado
- `CheckOutRecordedEvent` - Check-out registrado
- `IncidentReportedEvent` - Incidencia reportada

---

## 🗄️ Base de Datos

```prisma
model CheckInOut {
  id              String   @id @default(auto()) @map("_id") @db.ObjectId
  reservationId   String   @db.ObjectId
  
  checkInTime     DateTime?
  checkOutTime    DateTime?
  
  checkInBy       String?  @db.ObjectId // Usuario que registró
  checkOutBy      String?  @db.ObjectId
  
  location        Json?    // { lat, lng }
  verificationMethod String // QR, MANUAL, BIOMETRIC
  
  incidents       Json[]   // Incidencias registradas
  
  createdAt       DateTime @default(now())
  
  @@index([reservationId])
  @@index([checkInTime])
  @@map("check_in_out")
}
```

---

## ⚡ Performance

- WebSockets para actualizaciones en tiempo real
- Cache de reservas activas
- Índices optimizados para queries frecuentes

---

## 📚 Documentación Relacionada

- [Base de Datos](../DATABASE.md#4-checkinout)

---

**Mantenedor**: Bookly Development Team
