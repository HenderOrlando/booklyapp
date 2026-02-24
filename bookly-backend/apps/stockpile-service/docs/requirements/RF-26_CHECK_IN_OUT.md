# RF-26: Check-in/Check-out Digital

**Estado**: ✅ Completado

**Prioridad**: Media

**Fecha de Implementación**: Noviembre 10, 2025

---

## 📋 Descripción

Sistema completo de check-in y check-out digital para recursos físicos (salas, equipos, vehículos, etc.) con múltiples métodos de registro (QR, manual, automático por proximidad), validación de identidad, registro de condición de recursos, geolocalización, firma digital opcional y trazabilidad completa del ciclo de vida de uso de recursos.

**Nota**: Este RF es independiente de [RF-23: Pantalla de Vigilancia](./RF-23_PANTALLA_VIGILANCIA.md), aunque comparten funcionalidad. RF-26 se enfoca en la lógica de check-in/out, mientras RF-23 en el dashboard de monitoreo.

---

## ✅ Criterios de Aceptación

- [x] **Múltiples tipos de check-in**:
  - [x] Manual (usuario desde app)
  - [x] QR Code (escaneo automático)
  - [x] Automático por proximidad (geolocalización)
  - [x] RFID (opcional, futuro)

- [x] **Check-in completo**:
  - [x] Validación de reserva activa
  - [x] Validación de horario (no antes de tiempo)
  - [x] Registro de ubicación (lat/lng)
  - [x] Notas opcionales
  - [x] Metadata extensible (qrCode, rfidTag, deviceInfo, ipAddress)

- [x] **Check-out completo**:
  - [x] Verificación de check-in previo
  - [x] Registro de condición de recurso (GOOD, FAIR, POOR, DAMAGED)
  - [x] Reporte de daños con descripción
  - [x] Firma digital del usuario (opcional)
  - [x] Cálculo automático de tiempo de uso
  - [x] Detección de retrasos/vencimientos

- [x] **Trazabilidad**:
  - [x] Historial completo por usuario
  - [x] Historial por recurso
  - [x] Historial por reserva
  - [x] Detección automática de check-ins vencidos

- [x] **Seguridad**:
  - [x] Solo usuario de la reserva puede hacer check-in
  - [x] Solo quien hizo check-in puede hacer check-out (o admin)
  - [x] Validación de QR tokens con expiración
  - [x] Geolocalización para prevenir fraude

- [x] **Notificaciones automáticas**:
  - [x] Confirmación de check-in
  - [x] Recordatorio de check-out
  - [x] Alerta de vencimiento
  - [x] Notificación de daños reportados

---

## 🏗️ Implementación

### Componentes Principales

**Entities (Domain)**:

- `CheckInOutEntity` - Entidad de dominio con lógica de negocio
  - Métodos: `isCheckedIn()`, `isOverdue()`, `hasDamageReported()`, `getDelayMinutes()`
  - Estados: `PENDING`, `CHECKED_IN`, `CHECKED_OUT`, `OVERDUE`, `CANCELLED`

**Services**:

- `CheckInOutService` - CRUD y consultas de check-in/out
- `QRCodeService` - Generación y validación de códigos QR
- `DigitalSignatureService` - Registro y verificación de firmas digitales
- `GeolocationService` - Validación de ubicación
- `ProximityNotificationService` - Check-in automático por proximidad

**Controllers**:

- `CheckInOutController` - Endpoints REST

**Commands**:

- `CheckInCommand` - Realizar check-in
- `CheckOutCommand` - Realizar check-out

**Schemas (Mongoose)**:

- `CheckInOutSchema` - Persistencia en MongoDB

---

## 📦 Tipos de Check-in

### 1. Check-in Manual (desde App)

**Descripción**: Usuario realiza check-in manualmente desde la aplicación móvil o web.

**Flujo**:

```
1. Usuario llega al recurso
2. Abre la app, selecciona reserva activa
3. Click en "Check-In"
4. Sistema valida:
   - Reserva existe y está activa
   - Horario de inicio <= ahora <= horario fin
   - Usuario es el dueño de la reserva
5. Registra check-in con timestamp y ubicación
6. Envía notificación de confirmación
```

**Request**:

```typescript
POST /api/v1/check-in-out/check-in

{
  "reservationId": "507f1f77bcf86cd799439011",
  "type": "MANUAL",
  "notes": "Todo en orden, sala limpia",
  "metadata": {
    "deviceInfo": "iPhone 13 Pro - iOS 16",
    "ipAddress": "192.168.1.100"
  }
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439020",
    "reservationId": "507f1f77bcf86cd799439011",
    "resourceId": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439013",
    "status": "CHECKED_IN",
    "checkInTime": "2025-11-15T14:05:00Z",
    "checkInType": "MANUAL"
  }
}
```

---

### 2. Check-in con QR Code

**Descripción**: Usuario escanea código QR en el recurso físico para check-in automático.

**Flujo**:

```
1. Al confirmar reserva, sistema genera QR único
2. QR se envía por email/WhatsApp/in-app
3. QR también se muestra en pantalla del recurso (opcional)
4. Usuario escanea QR con app móvil
5. App decodifica QR y extrae token
6. Envía request de check-in con token
7. Sistema valida token (expiración, unicidad)
8. Registra check-in automáticamente
```

**Generar QR**:

```typescript
POST /api/v1/qr-code/generate-check-in

{
  "reservationId": "507f1f77bcf86cd799439011",
  "resourceId": "507f1f77bcf86cd799439012",
  "userId": "507f1f77bcf86cd799439013",
  "expirationMinutes": 30
}
```

**Response**:

```json
{
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANS...",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresAt": "2025-11-15T14:30:00Z"
}
```

**Check-in con QR**:

```typescript
POST /api/v1/check-in-out/check-in

{
  "reservationId": "507f1f77bcf86cd799439011",
  "type": "QR_CODE",
  "qrToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 3. Check-in Automático por Proximidad

**Descripción**: Sistema detecta cuando usuario está cerca del recurso y ofrece check-in automático.

**Flujo**:

```
1. App móvil envía ubicación en tiempo real
2. Sistema calcula distancia al recurso
3. Si distancia < 20m:
   - Envía notificación push "¿Hacer check-in?"
   - Usuario confirma
   - Sistema registra check-in con geolocalización
```

**Ubicación del Usuario** (WebSocket):

```typescript
// Cliente emite ubicación
socket.emit("user-location-update", {
  userId: "507f1f77bcf86cd799439013",
  latitude: 7.8938,
  longitude: -72.5078,
  accuracy: 10, // metros
});

// Servidor responde con proximidad
socket.on("proximity-alert", {
  reservationId: "507f1f77bcf86cd799439011",
  distance: 15, // metros
  message: "Estás cerca del Auditorio Principal. ¿Hacer check-in?",
});
```

**Check-in Automático**:

```typescript
POST /api/v1/check-in-out/check-in

{
  "reservationId": "507f1f77bcf86cd799439011",
  "type": "AUTOMATIC_PROXIMITY",
  "coordinates": {
    "latitude": 7.8938,
    "longitude": -72.5078
  }
}
```

---

## 🔚 Tipos de Check-out

### 1. Check-out Manual

**Descripción**: Usuario realiza check-out manualmente al finalizar uso del recurso.

**Request**:

```typescript
POST /api/v1/check-in-out/check-out

{
  "checkInId": "507f1f77bcf86cd799439020",
  "type": "MANUAL",
  "notes": "Recurso entregado en buen estado",
  "resourceCondition": "GOOD",
  "damageReported": false
}
```

---

### 2. Check-out con Reporte de Daños

**Descripción**: Usuario reporta daños al hacer check-out.

**Request**:

```typescript
POST /api/v1/check-in-out/check-out

{
  "checkInId": "507f1f77bcf86cd799439020",
  "type": "MANUAL",
  "resourceCondition": "DAMAGED",
  "damageReported": true,
  "damageDescription": "Proyector no enciende. Posible problema eléctrico.",
  "notes": "Intenté reiniciar varias veces sin éxito"
}
```

**Evento Publicado**:

```typescript
Event: "check-in-out.damage-reported"
Payload: {
  checkInId: "507f1f77bcf86cd799439020",
  resourceId: "507f1f77bcf86cd799439012",
  userId: "507f1f77bcf86cd799439013",
  damageDescription: "Proyector no enciende...",
  reportedAt: "2025-11-15T16:55:00Z"
}
```

**Consumidores**:

- `resources-service` - Marca recurso como "En mantenimiento"
- `stockpile-service` - Notifica a staff de mantenimiento
- `reports-service` - Registra en reporte de incidencias

---

### 3. Check-out con Firma Digital

**Descripción**: Usuario firma digitalmente al entregar recurso (especialmente para equipos costosos).

**Flujo**:

```
1. Usuario completa check-out
2. App muestra canvas de firma
3. Usuario firma con dedo/stylus
4. App captura firma como imagen base64
5. Envía firma junto con check-out
6. Sistema genera hash de firma para verificación
7. Almacena firma encriptada
8. Genera PDF con firma digital incluida
```

**Request**:

```typescript
POST /api/v1/check-in-out/check-out

{
  "checkInId": "507f1f77bcf86cd799439020",
  "type": "MANUAL",
  "resourceCondition": "GOOD",
  "damageReported": false,
  "digitalSignature": {
    "signatureData": "data:image/png;base64,iVBORw0KGgoAAAANS...",
    "metadata": {
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0...",
      "deviceInfo": "iPhone 13 Pro"
    }
  }
}
```

**Response** (incluye PDF generado):

```json
{
  "success": true,
  "data": {
    "checkInId": "507f1f77bcf86cd799439020",
    "status": "CHECKED_OUT",
    "checkOutTime": "2025-11-15T16:55:00Z",
    "digitalSignaturePdf": "https://cdn.bookly.com/signatures/507f1f77bcf86cd799439020.pdf",
    "signatureHash": "a3f5e8d9b2c1..."
  }
}
```

---

## 📊 Estados de Check-in/out

| Estado        | Descripción                             | Transiciones Permitidas                 |
| ------------- | --------------------------------------- | --------------------------------------- |
| `PENDING`     | Check-in pendiente (reserva confirmada) | → `CHECKED_IN`, `CANCELLED`             |
| `CHECKED_IN`  | Usuario ha hecho check-in               | → `CHECKED_OUT`, `OVERDUE`, `CANCELLED` |
| `CHECKED_OUT` | Check-out completado                    | → (final)                               |
| `OVERDUE`     | No hizo check-out a tiempo              | → `CHECKED_OUT`                         |
| `CANCELLED`   | Reserva cancelada                       | → (final)                               |

**Transiciones Automáticas**:

- `CHECKED_IN` → `OVERDUE`: Job cron cada 5 minutos revisa si `expectedReturnTime < now`
- `OVERDUE` → Notificación automática al usuario y vigilancia

---

## 🔍 Consultas y Trazabilidad

### Historial por Usuario

```http
GET /api/v1/check-in-out/user/me

Response:
[
  {
    "id": "507f1f77bcf86cd799439020",
    "reservationId": "507f1f77bcf86cd799439011",
    "resourceName": "Auditorio Principal",
    "checkInTime": "2025-11-15T14:05:00Z",
    "checkOutTime": "2025-11-15T16:55:00Z",
    "duration": "2h 50m",
    "status": "CHECKED_OUT",
    "damageReported": false
  },
  // ...
]
```

### Historial por Recurso

```http
GET /api/v1/check-in-out/resource/:resourceId?startDate=2025-11-01&endDate=2025-11-30

Response:
{
  "resourceId": "507f1f77bcf86cd799439012",
  "resourceName": "Auditorio Principal",
  "totalCheckIns": 45,
  "avgUsageDuration": "2h 15m",
  "damageReports": 2,
  "checkIns": [...]
}
```

### Check-ins Activos (En Curso)

```http
GET /api/v1/check-in-out/active

Response:
[
  {
    "id": "507f1f77bcf86cd799439025",
    "userName": "Juan Pérez",
    "resourceName": "Sala de Juntas 3",
    "checkInTime": "2025-11-15T15:00:00Z",
    "expectedReturnTime": "2025-11-15T17:00:00Z",
    "remainingTime": "45m",
    "status": "CHECKED_IN"
  }
]
```

### Check-ins Vencidos

```http
GET /api/v1/check-in-out/overdue

Response:
[
  {
    "id": "507f1f77bcf86cd799439028",
    "userName": "María García",
    "resourceName": "Laboratorio de Física",
    "checkInTime": "2025-11-15T08:00:00Z",
    "expectedReturnTime": "2025-11-15T12:00:00Z",
    "overdueBy": "3h 15m",
    "status": "OVERDUE"
  }
]
```

---

## 🔔 Notificaciones Automáticas

### 1. Confirmación de Check-in

**Trigger**: Check-in exitoso

**Canales**: EMAIL + PUSH + IN_APP

**Template**:

```
Subject: ✅ Check-in Confirmado

Hola {{userName}},

Has realizado check-in exitoso para:

📍 Recurso: {{resourceName}}
🕐 Hora de entrada: {{checkInTime}}
🕐 Hora esperada de salida: {{expectedReturnTime}}

Recuerda hacer check-out al finalizar.

Bookly UFPS
```

---

### 2. Recordatorio de Check-out

**Trigger**: 15 minutos antes de `expectedReturnTime`

**Canales**: PUSH + IN_APP

**Template**:

```
🔔 Recordatorio de Check-out

Tu reserva de {{resourceName}} termina en 15 minutos.

Por favor, haz check-out al finalizar.
```

---

### 3. Alerta de Vencimiento

**Trigger**: Check-in pasa a `OVERDUE`

**Canales**: EMAIL + SMS + PUSH

**Template**:

```
⚠️ Check-out Vencido

{{userName}}, no has hecho check-out de {{resourceName}}.

Hora esperada de salida: {{expectedReturnTime}}
Tiempo vencido: {{overdueTime}}

Por favor, realiza check-out inmediatamente o contacta a vigilancia.
```

---

### 4. Notificación de Daños

**Trigger**: Check-out con `damageReported = true`

**Canales**: EMAIL (staff de mantenimiento) + EVENT (resources-service)

**Template**:

```
🔧 Reporte de Daño - Acción Requerida

Recurso: {{resourceName}}
Reportado por: {{userName}}
Fecha: {{reportedAt}}

Descripción del daño:
{{damageDescription}}

Por favor, revisar y programar mantenimiento.
```

---

## 🗄️ Base de Datos

### Schema MongoDB

```prisma
model CheckInOut {
  id                  String   @id @default(auto()) @map("_id") @db.ObjectId

  // Relaciones
  reservationId       String   @db.ObjectId
  resourceId          String   @db.ObjectId
  userId              String   @db.ObjectId

  // Estado
  status              String   // PENDING, CHECKED_IN, CHECKED_OUT, OVERDUE, CANCELLED

  // Check-in
  checkInTime         DateTime?
  checkInBy           String?  @db.ObjectId
  checkInType         String?  // MANUAL, QR_CODE, AUTOMATIC_PROXIMITY, RFID
  checkInNotes        String?
  checkInLocation     Json?    // { lat, lng }

  // Check-out
  checkOutTime        DateTime?
  checkOutBy          String?  @db.ObjectId
  checkOutType        String?  // MANUAL, AUTOMATIC
  checkOutNotes       String?
  checkOutLocation    Json?    // { lat, lng }

  // Tiempos
  expectedReturnTime  DateTime?
  actualReturnTime    DateTime?

  // Condición del recurso
  resourceCondition   Json?    // { beforeCheckIn, afterCheckOut, damageReported, damageDescription }

  // Metadata extensible
  metadata            Json?    // { qrCode, rfidTag, digitalSignature, deviceInfo, ipAddress }

  // Auditoría
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  @@index([reservationId])
  @@index([resourceId, checkInTime])
  @@index([userId, checkInTime])
  @@index([status])
  @@index([checkInTime])
  @@map("check_in_out")
}
```

---

## 🎯 Casos de Uso

### Caso 1: Estudiante reserva auditorio para evento

```
1. Estudiante crea reserva para 2025-11-20 de 14:00 a 18:00
2. Sistema genera QR y lo envía por email
3. Día del evento, estudiante llega a las 13:55
4. Escanea QR en puerta del auditorio
5. Sistema valida QR y hace check-in automático
6. Al finalizar evento (18:10), estudiante hace check-out manual
7. Sistema detecta retraso de 10 minutos (no crítico)
8. Genera reporte de uso exitoso
```

### Caso 2: Profesor solicita equipo de laboratorio

```
1. Profesor reserva microscopio para clase de 08:00 a 10:00
2. Al llegar al laboratorio, hace check-in manual
3. Durante clase, estudiante daña lente del microscopio
4. Al hacer check-out, profesor reporta daño
5. Sube foto del lente dañado y describe incidente
6. Firma digitalmente el reporte
7. Sistema:
   - Marca microscopio como "En mantenimiento"
   - Notifica a staff de laboratorio
   - Genera PDF con firma digital
   - Publica evento para resources-service
```

### Caso 3: Vigilancia monitorea check-ins activos

```
1. Vigilante accede a dashboard (RF-23)
2. Ve lista de check-ins activos en tiempo real
3. Detecta que Sala 305 tiene check-in vencido por 2 horas
4. Verifica físicamente la sala (está vacía)
5. Hace check-out forzado desde dashboard
6. Sistema envía penalización automática al usuario
```

---

## 🔗 Integración con Otros Componentes

### Con QRCodeService

```typescript
// Generar QR al confirmar reserva
const qrData = await qrCodeService.generateCheckInQR(
  reservationId,
  resourceId,
  userId,
  30 // expira en 30 minutos
);

// Validar QR en check-in
const isValid = await qrCodeService.validateToken(qrToken);
```

### Con GeolocationService

```typescript
// Validar ubicación en check-in
const distance = await geolocationService.calculateDistance(
  userLocation,
  resourceLocation
);

if (distance > 100) {
  throw new Error("Debes estar cerca del recurso para hacer check-in");
}
```

### Con DigitalSignatureService

```typescript
// Registrar firma en check-out
const signature = await digitalSignatureService.registerSignature(
  checkOutId,
  signatureData,
  userId,
  metadata
);

// Generar PDF con firma
const pdf = await digitalSignatureService.generateSignedPDF(checkOutId);
```

### Con NotificationService

```typescript
// Notificar check-in exitoso
await notificationService.sendMultiChannel({
  userId,
  channels: ["EMAIL", "PUSH", "IN_APP"],
  template: "check_in_confirmed",
  data: { resourceName, checkInTime },
});
```

---

## 📚 Documentación Relacionada

- [RF-23: Pantalla de Vigilancia](./RF-23_PANTALLA_VIGILANCIA.md) - Dashboard de monitoreo
- [RF-25: Trazabilidad](./RF-25_TRAZABILIDAD.md) - Auditoría de acciones
- [RF-27: Mensajería](./RF-27_MENSAJERIA.md) - Notificaciones automáticas
- [Base de Datos](../DATABASE.md#3-checkinout)
- [Event Bus](../EVENT_BUS.md)
- [ARCHITECTURE](../ARCHITECTURE.md)

---

## 🚀 Roadmap

### Corto Plazo

- [ ] RFID tags para check-in sin contacto
- [ ] Reconocimiento facial para validación de identidad
- [ ] Check-out automático al detectar salida del usuario

### Mediano Plazo

- [ ] Integración con IoT (cerraduras inteligentes)
- [ ] ML para predecir duración real vs estimada
- [ ] Penalizaciones automáticas por retrasos frecuentes

### Largo Plazo

- [ ] Blockchain para registro inmutable de check-ins
- [ ] AR (Realidad Aumentada) para guiar al usuario al recurso
- [ ] Asistente de voz para check-in manos libres

---

**Mantenedor**: Bookly Development Team  
**Última Actualización**: Noviembre 12, 2025
