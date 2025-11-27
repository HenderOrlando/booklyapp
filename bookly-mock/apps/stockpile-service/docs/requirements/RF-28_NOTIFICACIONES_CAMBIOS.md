# RF-28: Notificaciones Automáticas de Cambios en Reservas

**Estado**: ✅ Completado

**Prioridad**: Media

**Fecha de Implementación**: Noviembre 11, 2025

---

## 📋 Descripción

Sistema automatizado de notificaciones que reacciona en tiempo real a cambios en reservas mediante Event-Driven Architecture (EDA), consumiendo eventos de `availability-service` y enviando notificaciones multi-canal personalizadas por usuario. Incluye recordatorios programados, confirmaciones automáticas y alertas de cambios de estado.

---

## ✅ Criterios de Aceptación

- [x] **Eventos Consumidos** (desde `availability-service`):
  - [x] `ReservationCreatedEvent` → Confirmación de reserva
  - [x] `ReservationUpdatedEvent` → Notificar modificaciones
  - [x] `ReservationCancelledEvent` → Notificar cancelación
  - [x] `ReservationApprovedEvent` → Notificar aprobación
  - [x] `ReservationRejectedEvent` → Notificar rechazo

- [x] **Recordatorios Automáticos**:
  - [x] 24 horas antes de la reserva
  - [x] 1 hora antes de la reserva
  - [x] Check-out próximo (15 minutos antes)
  - [x] Check-out vencido (pasado el horario)

- [x] **Personalización**:
  - [x] Plantillas dinámicas por tipo de evento
  - [x] Preferencias de notificación por usuario (EMAIL, SMS, WhatsApp, PUSH)
  - [x] Prioridad por tipo de evento (URGENT, NORMAL, LOW)
  - [x] Variables dinámicas (userName, resourceName, date, time, etc.)

- [x] **Configuración**:
  - [x] Habilitar/deshabilitar recordatorios por tipo
  - [x] Configurar frecuencia de recordatorios
  - [x] Configurar canales por tipo de notificación
  - [x] Templates customizables

- [x] **Persistencia y Tracking**:
  - [x] Logs de notificaciones enviadas
  - [x] Estado de entrega (sent, delivered, read, failed)
  - [x] Reintentos automáticos si falla

---

## 🏗️ Implementación

### Arquitectura Event-Driven (EDA)

**Flujo de Comunicación**:

```
availability-service                stockpile-service
       │                                    │
       │  PublishEvent                      │
       │  ─────────────────────────────────>│
       │  "reservation.created"             │
       │                                    │
       │                                    │  Event Handler
       │                                    │  ├─ NotificationEventHandler
       │                                    │  └─ ReminderService
       │                                    │
       │                                    │  ┌──────────────────────┐
       │                                    │  │NotificationService   │
       │                                    │  │(@libs/notifications) │
       │                                    │  └──────────────────────┘
       │                                    │       │
       │                                    │       ▼
       │                                    │  [EMAIL|SMS|WhatsApp|PUSH]
```

### Componentes Principales

**Event Handlers**:

- `NotificationEventHandler` - Procesa eventos de availability-service

**Services**:

- `ReminderService` - Gestión de recordatorios programados
- `NotificationService` (de `@libs/notifications`) - Envío multi-canal

**Entities**:

- `ReminderConfigurationEntity` - Configuración de recordatorios

**Schemas**:

- `ReminderConfigurationSchema` - Persistencia de configuraciones

**Cron Jobs**:

- Recordatorios 24h antes (cada hora a las :00)
- Recordatorios 1h antes (cada 15 minutos)
- Check-out vencidos (cada 5 minutos)

---

## 📡 Eventos Consumidos

### 1. ReservationCreatedEvent

**Evento publicado por**: `availability-service`

**Payload**:

```typescript
{
  eventId: "evt_123",
  eventType: "RESERVATION_CREATED",
  service: "availability-service",
  timestamp: "2025-11-15T10:00:00Z",
  data: {
    reservationId: "507f1f77bcf86cd799439011",
    userId: "507f1f77bcf86cd799439013",
    resourceId: "507f1f77bcf86cd799439012",
    startDate: "2025-11-20T14:00:00Z",
    endDate: "2025-11-20T18:00:00Z",
    status: "CONFIRMED"
  }
}
```

**Acción en stockpile-service**:

1. Consume evento vía Event Bus
2. Enriquece datos (obtiene nombre de usuario y recurso)
3. Envía notificación de confirmación
4. Programa recordatorios (24h y 1h antes)

**Notificación Enviada**:

```
Canal: EMAIL + PUSH + IN_APP
Template: reservation_confirmed

Subject: ✅ Reserva Confirmada - {resourceName}

Hola {userName},

Tu reserva ha sido confirmada exitosamente:

📍 Recurso: {resourceName}
📅 Fecha: {date}
🕐 Hora: {startTime} - {endTime}

Recibirás recordatorios automáticos antes de tu reserva.

[Ver detalles] [Modificar] [Cancelar]
```

---

### 2. ReservationUpdatedEvent

**Evento publicado por**: `availability-service`

**Payload**:

```typescript
{
  eventId: "evt_124",
  eventType: "RESERVATION_UPDATED",
  service: "availability-service",
  timestamp: "2025-11-16T12:00:00Z",
  data: {
    reservationId: "507f1f77bcf86cd799439011",
    userId: "507f1f77bcf86cd799439013",
    changes: {
      startDate: {
        old: "2025-11-20T14:00:00Z",
        new: "2025-11-20T15:00:00Z"
      },
      resourceId: {
        old: "507f1f77bcf86cd799439012",
        new: "507f1f77bcf86cd799439015"
      }
    }
  }
}
```

**Acción**:

1. Detecta cambios significativos (horario, recurso, fecha)
2. Cancela recordatorios antiguos
3. Programa nuevos recordatorios
4. Envía notificación de cambio

**Notificación Enviada**:

```
Canal: EMAIL + SMS + PUSH

Subject: 📝 Cambios en tu Reserva

{userName}, tu reserva ha sido modificada:

Cambios realizados:
• Horario: 14:00-18:00 → 15:00-19:00
• Recurso: Auditorio Principal → Sala de Conferencias B

Nueva información:
📍 Recurso: Sala de Conferencias B
📅 Fecha: 20 Nov 2025
🕐 Hora: 15:00 - 19:00

Si no realizaste estos cambios, contacta soporte.
```

---

### 3. ReservationCancelledEvent

**Evento publicado por**: `availability-service`

**Payload**:

```typescript
{
  eventId: "evt_125",
  eventType: "RESERVATION_CANCELLED",
  service: "availability-service",
  timestamp: "2025-11-17T10:30:00Z",
  data: {
    reservationId: "507f1f77bcf86cd799439011",
    userId: "507f1f77bcf86cd799439013",
    resourceId: "507f1f77bcf86cd799439012",
    cancelledBy: "507f1f77bcf86cd799439013",
    reason: "Cambio de planes"
  }
}
```

**Acción**:

1. Cancela todos los recordatorios programados
2. Envía confirmación de cancelación
3. Libera check-in si existía

**Notificación Enviada**:

```
Canal: EMAIL + IN_APP

Subject: ❌ Reserva Cancelada

{userName}, tu reserva ha sido cancelada:

📍 Recurso: {resourceName}
📅 Fecha: {date}
🕐 Hora: {startTime} - {endTime}

Motivo: {reason}

Puedes crear una nueva reserva en cualquier momento.

[Nueva Reserva] [Ver Historial]
```

---

### 4. ReservationApprovedEvent

**Evento publicado por**: `stockpile-service` (approval flow)

**Payload**:

```typescript
{
  eventId: "evt_126",
  eventType: "RESERVATION_APPROVED",
  service: "stockpile-service",
  timestamp: "2025-11-18T09:00:00Z",
  data: {
    approvalId: "507f1f77bcf86cd799439020",
    reservationId: "507f1f77bcf86cd799439011",
    userId: "507f1f77bcf86cd799439013",
    approvedBy: "507f1f77bcf86cd799439050",
    approverRole: "COORDINATOR",
    documentId: "507f1f77bcf86cd799439060" // PDF generado
  }
}
```

**Acción**:

1. Envía notificación de aprobación con documento PDF adjunto
2. Genera QR code para check-in
3. Programa recordatorios

**Notificación Enviada**:

```
Canal: EMAIL + WhatsApp

Subject: ✅ Solicitud Aprobada - {resourceName}

¡Buenas noticias {userName}!

Tu solicitud ha sido APROBADA por {approverName} ({approverRole}).

📍 Recurso: {resourceName}
📅 Fecha: {date}
🕐 Hora: {startTime} - {endTime}

📎 Adjuntos:
• Carta de aprobación oficial (PDF)
• Código QR para check-in

[Descargar PDF] [Ver QR] [Agregar al Calendario]
```

---

### 5. ReservationRejectedEvent

**Evento publicado por**: `stockpile-service` (approval flow)

**Payload**:

```typescript
{
  eventId: "evt_127",
  eventType: "RESERVATION_REJECTED",
  service: "stockpile-service",
  timestamp: "2025-11-18T10:00:00Z",
  data: {
    approvalId: "507f1f77bcf86cd799439020",
    reservationId: "507f1f77bcf86cd799439011",
    userId: "507f1f77bcf86cd799439013",
    rejectedBy: "507f1f77bcf86cd799439050",
    rejectorRole: "COORDINATOR",
    reason: "Conflicto de horarios con evento institucional",
    suggestions: "Intenta reservar el día 21 de noviembre"
  }
}
```

**Acción**:

1. Envía notificación de rechazo con razón
2. Sugiere alternativas si están disponibles

**Notificación Enviada**:

```
Canal: EMAIL + IN_APP

Subject: ❌ Solicitud Rechazada - {resourceName}

{userName}, lamentamos informarte que tu solicitud fue rechazada.

📍 Recurso solicitado: {resourceName}
📅 Fecha solicitada: {date}
🕐 Hora solicitada: {startTime} - {endTime}

Rechazado por: {rejectorName} ({rejectorRole})

Motivo:
{reason}

Sugerencias:
{suggestions}

[Ver Alternativas] [Nueva Solicitud] [Contactar Soporte]
```

---

## ⏰ Recordatorios Programados

### Configuración de Recordatorios

**Tipos de Recordatorios**:

```typescript
enum ReminderType {
  RESERVATION_24H_BEFORE = "RESERVATION_24H_BEFORE",
  RESERVATION_1H_BEFORE = "RESERVATION_1H_BEFORE",
  CHECKOUT_15M_BEFORE = "CHECKOUT_15M_BEFORE",
  CHECKOUT_OVERDUE = "CHECKOUT_OVERDUE",
  APPROVAL_PENDING = "APPROVAL_PENDING",
}
```

**Configuración**:

```typescript
{
  type: "RESERVATION_24H_BEFORE",
  enabled: true,
  frequency: "ONCE", // ONCE, DAILY, WEEKLY
  channels: ["EMAIL", "PUSH"],
  messageTemplate: "Tu reserva de {resourceName} es mañana a las {startTime}.",
  leadTime: 24 * 60 * 60 * 1000, // 24 horas en ms
  priority: "NORMAL"
}
```

### Cron Jobs

#### 1. Recordatorio 24h antes

**Cron**: Cada hora a las :00 (`0 * * * *`)

**Lógica**:

```typescript
@Cron('0 * * * *') // Cada hora
async sendDailyReminders() {
  const now = new Date();
  const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  // Buscar reservas que inician en ~24h
  const reservations = await this.findReservationsBetween(
    in24Hours,
    new Date(in24Hours.getTime() + 60 * 60 * 1000) // +1h window
  );

  for (const reservation of reservations) {
    await this.sendReminder(
      ReminderType.RESERVATION_24H_BEFORE,
      reservation
    );
  }
}
```

**Notificación**:

```
Canal: EMAIL + PUSH

Subject: 🔔 Recordatorio - Reserva Mañana

{userName}, tienes una reserva programada para mañana:

📍 {resourceName}
📅 {date}
🕐 {startTime} - {endTime}

Te enviaremos otro recordatorio 1 hora antes.

[Ver Detalles] [Modificar] [Cancelar]
```

---

#### 2. Recordatorio 1h antes

**Cron**: Cada 15 minutos (`*/15 * * * *`)

**Lógica**:

```typescript
@Cron('*/15 * * * *') // Cada 15 minutos
async sendHourlyReminders() {
  const now = new Date();
  const in1Hour = new Date(now.getTime() + 60 * 60 * 1000);

  // Buscar reservas que inician en ~1h
  const reservations = await this.findReservationsBetween(
    in1Hour,
    new Date(in1Hour.getTime() + 15 * 60 * 1000) // +15min window
  );

  for (const reservation of reservations) {
    await this.sendReminder(
      ReminderType.RESERVATION_1H_BEFORE,
      reservation
    );
  }
}
```

**Notificación**:

```
Canal: SMS + PUSH

🔔 Tu reserva de {resourceName} inicia en 1 hora ({startTime}).

Prepárate para hacer check-in.

[Check-In Rápido]
```

---

#### 3. Recordatorio Check-out próximo

**Cron**: Cada 5 minutos (`*/5 * * * *`)

**Lógica**:

```typescript
@Cron('*/5 * * * *')
async sendCheckoutReminders() {
  const now = new Date();
  const in15Minutes = new Date(now.getTime() + 15 * 60 * 1000);

  // Buscar check-ins activos que terminan en ~15min
  const checkIns = await this.checkInOutService.findEndingSoon(in15Minutes);

  for (const checkIn of checkIns) {
    await this.sendReminder(
      ReminderType.CHECKOUT_15M_BEFORE,
      checkIn
    );
  }
}
```

**Notificación**:

```
Canal: PUSH

⚠️ Tu reserva de {resourceName} termina en 15 minutos.

Por favor, prepárate para hacer check-out.

[Check-Out Ahora]
```

---

#### 4. Alerta Check-out vencido

**Cron**: Cada 5 minutos (`*/5 * * * *`)

**Lógica**:

```typescript
@Cron('*/5 * * * *')
async sendOverdueAlerts() {
  // Buscar check-ins vencidos
  const overdueCheckIns = await this.checkInOutService.findOverdue();

  for (const checkIn of overdueCheckIns) {
    // Cambiar estado a OVERDUE
    await this.checkInOutService.update(checkIn.id, {
      status: CheckInOutStatus.OVERDUE
    });

    // Notificar usuario
    await this.sendReminder(
      ReminderType.CHECKOUT_OVERDUE,
      checkIn
    );

    // Notificar vigilancia
    await this.notifySecurityStaff(checkIn);
  }
}
```

**Notificación al Usuario**:

```
Canal: EMAIL + SMS + PUSH

⚠️ CHECK-OUT VENCIDO

{userName}, no has hecho check-out de {resourceName}.

Hora esperada de salida: {expectedReturnTime}
Tiempo vencido: {overdueTime}

Por favor, realiza check-out INMEDIATAMENTE o contacta vigilancia.

PENALIZACIONES: Retrasos frecuentes pueden resultar en suspensión de privilegios.

[Check-Out Ahora] [Contactar Vigilancia]
```

**Notificación a Vigilancia**:

```
Canal: IN_APP (Dashboard)

🚨 Check-out Vencido

Usuario: {userName} ({userEmail})
Recurso: {resourceName}
Vencido hace: {overdueTime}

[Llamar Usuario] [Verificar en Sitio] [Check-out Forzado]
```

---

## 🔧 Configuración de Recordatorios

### API Endpoints

```http
# Obtener configuraciones activas
GET /api/v1/reminders/configurations

# Obtener configuración específica
GET /api/v1/reminders/configurations/:type

# Actualizar configuración
PATCH /api/v1/reminders/configurations/:type
{
  "enabled": true,
  "channels": ["EMAIL", "PUSH"],
  "messageTemplate": "Nuevo mensaje...",
  "priority": "HIGH"
}

# Habilitar/Deshabilitar
POST /api/v1/reminders/configurations/:type/toggle
{
  "enabled": false
}
```

### Preferencias de Usuario

**Endpoint**:

```http
GET /api/v1/notifications/preferences/:userId
PUT /api/v1/notifications/preferences/:userId

{
  "channels": {
    "reservationConfirmation": ["EMAIL", "PUSH"],
    "reminders24h": ["EMAIL"],
    "reminders1h": ["SMS", "PUSH"],
    "approvalNotifications": ["EMAIL", "WHATSAPP"],
    "overdueAlerts": ["EMAIL", "SMS", "PUSH"]
  },
  "doNotDisturb": {
    "enabled": false,
    "start": "22:00",
    "end": "08:00"
  }
}
```

---

## 📊 Plantillas de Notificaciones

### Variables Disponibles

```typescript
{
  // Usuario
  userName: string;
  userEmail: string;
  userPhone: string;

  // Recurso
  resourceName: string;
  resourceType: string;
  resourceLocation: string;

  // Reserva
  reservationId: string;
  date: string; // "20 de Noviembre de 2025"
  startTime: string; // "14:00"
  endTime: string; // "18:00"
  duration: string; // "4 horas"
  status: string;

  // Aprobación (si aplica)
  approverName: string;
  approverRole: string;
  approvalDate: string;
  documentUrl: string; // PDF
  qrCodeUrl: string;

  // Check-in/out (si aplica)
  checkInTime: string;
  checkOutTime: string;
  expectedReturnTime: string;
  overdueTime: string; // "2 horas 15 minutos"

  // Cambios (si aplica)
  changes: Array<{
    field: string;
    oldValue: string;
    newValue: string;
  }>;
}
```

### Ejemplo de Template

```html
<!DOCTYPE html>
<html>
  <head>
    <style>
      .card {
        border: 1px solid #ddd;
        padding: 20px;
      }
      .header {
        color: #007bff;
      }
    </style>
  </head>
  <body>
    <div class="card">
      <h2 class="header">{{eventTitle}}</h2>
      <p>Hola <strong>{{userName}}</strong>,</p>
      <p>{{eventMessage}}</p>

      <div class="details">
        <p>📍 Recurso: {{resourceName}}</p>
        <p>📅 Fecha: {{date}}</p>
        <p>🕐 Hora: {{startTime}} - {{endTime}}</p>
      </div>

      {{#if qrCodeUrl}}
      <img src="{{qrCodeUrl}}" alt="QR Check-in" width="200" />
      {{/if}}

      <div class="actions">
        <a href="{{viewDetailsUrl}}">Ver Detalles</a>
        <a href="{{modifyUrl}}">Modificar</a>
        <a href="{{cancelUrl}}">Cancelar</a>
      </div>
    </div>
  </body>
</html>
```

---

## 🔗 Integración con Otros Servicios

### Con availability-service (EDA)

```
availability-service publica:
- reservation.created
- reservation.updated
- reservation.cancelled

stockpile-service consume vía Event Bus:
- NotificationEventHandler procesa eventos
- Enriquece datos (user info, resource info)
- Envía notificaciones multi-canal
```

### Con auth-service (Enriquecimiento de Datos)

```typescript
// Obtener información de usuario
const user = await this.authClient.getUserById(userId);

// Usar en notificación
{
  userName: user.fullName,
  userEmail: user.email,
  userPhone: user.phone
}
```

### Con resources-service (Enriquecimiento de Datos)

```typescript
// Obtener información de recurso vía Event Bus (Request-Response)
const resource = await this.eventBus.request('resource.get', { resourceId });

// Usar en notificación
{
  resourceName: resource.name,
  resourceLocation: resource.location
}
```

---

## 📚 Documentación Relacionada

- [RF-22: Notificaciones Automáticas](./RF-22_NOTIFICACIONES_AUTOMATICAS.md) - Sistema de notificaciones
- [RF-27: Mensajería](./RF-27_MENSAJERIA.md) - Proveedores de mensajería
- [Event Bus](../EVENT_BUS.md) - Comunicación EDA
- [ARCHITECTURE](../ARCHITECTURE.md) - Arquitectura general

---

## 🚀 Roadmap

### Corto Plazo

- [ ] Webhooks para notificaciones de estado
- [ ] Dashboard de métricas de notificaciones

### Mediano Plazo

- [ ] ML para optimal send time (mejor hora para cada usuario)
- [ ] A/B testing de plantillas
- [ ] Notificaciones por contexto (ubicación, dispositivo)

### Largo Plazo

- [ ] Asistente conversacional (chatbot)
- [ ] Notificaciones predictivas (anticipar necesidades)
- [ ] Integración con calendarios externos (Google, Outlook)

---

**Mantenedor**: Bookly Development Team  
**Última Actualización**: Noviembre 12, 2025
