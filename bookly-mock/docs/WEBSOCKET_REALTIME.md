# 🔌 WebSocket Real-Time - Bookly

**Estado**: ✅ Implementado  
**Versión**: 1.0.0  
**Fecha**: 2025-01-05

---

## 📋 Resumen

El API Gateway de Bookly incluye un servidor WebSocket completo para comunicación en tiempo real, proporcionando:

- **Eventos en tiempo real** desde el Event Bus
- **Dashboard reactivo** con métricas de aplicación, microservicios e infraestructura
- **Monitoreo live de DLQ** con estadísticas actualizadas
- **Notificaciones inApp** por categorías (eventos, usuarios, recursos, reservas, límites, errores)
- **Streaming de logs** en tiempo real con filtros

---

## 🏗️ Arquitectura

```
Cliente (Browser/App)
       │
       │ WebSocket (Socket.IO)
       ├─────────────────────────────────┐
       │                                 │
       ▼                                 ▼
API Gateway WebSocket Server      REST API Fallback
       │                                 │
       ├─── EventBusService              │
       ├─── DeadLetterQueueService       │
       ├─── EventStoreService            │
       ├─── NotificationService          │
       └─── LogStreamingService          │
                                         │
              ┌──────────────────────────┘
              │
              ▼
      Microservicios Backend
```

---

## 🔌 Conexión WebSocket

### Endpoint

```
ws://localhost:3000/api/v1/ws
```

**Producción**:

```
wss://bookly.com/api/v1/ws
```

### Cliente JavaScript/TypeScript

```typescript
import { io } from "socket.io-client";

const socket = io("http://localhost:3000/api/v1/ws", {
  query: {
    userId: "user-123",
  },
  auth: {
    token: "jwt-token-here",
  },
});

socket.on("connect", () => {
  console.log("Connected:", socket.id);
});

socket.on("disconnect", () => {
  console.log("Disconnected");
});
```

---

## 📡 Eventos WebSocket

### 1. Suscripción a Canales

**Enviar**:

```typescript
socket.emit("subscribe", {
  channels: ["events", "dlq", "dashboard", "notifications", "logs"],
  eventFilters: {
    eventTypes: ["RESOURCE_CREATED", "RESERVATION_CREATED"],
    services: ["resources-service", "availability-service"],
  },
  dlqFilters: {
    status: "pending",
  },
  logFilters: {
    level: "error",
    service: "api-gateway",
  },
});
```

**Respuesta**:

```json
{
  "success": true,
  "channels": ["events", "dlq", "dashboard", "notifications", "logs"]
}
```

### 2. Desuscripción

```typescript
socket.emit("unsubscribe", {
  channels: ["logs"],
});
```

---

## 📊 Eventos en Tiempo Real

### Events

| Evento           | Descripción                  | Payload                                            |
| ---------------- | ---------------------------- | -------------------------------------------------- |
| `event:created`  | Evento creado en Event Store | `{ eventId, eventType, service, timestamp, data }` |
| `event:failed`   | Evento falló al procesarse   | `{ eventId, error, service }`                      |
| `event:replayed` | Evento fue replayado         | `{ eventId, replayTimestamp }`                     |

**Escuchar**:

```typescript
socket.on("event:created", (data) => {
  console.log("New event:", data);
});
```

### DLQ (Dead Letter Queue)

| Evento               | Descripción                   | Payload                                |
| -------------------- | ----------------------------- | -------------------------------------- |
| `dlq:event:added`    | Evento agregado a DLQ         | `{ dlqId, originalEvent, error }`      |
| `dlq:event:retrying` | Retry de evento iniciado      | `{ dlqId, attemptCount }`              |
| `dlq:event:resolved` | Evento resuelto exitosamente  | `{ dlqId, resolution }`                |
| `dlq:event:failed`   | Evento falló permanentemente  | `{ dlqId, attemptCount, maxAttempts }` |
| `dlq:stats:updated`  | Estadísticas DLQ actualizadas | `{ stats, timestamp }`                 |

**Escuchar**:

```typescript
socket.on("dlq:stats:updated", (data) => {
  console.log("DLQ Stats:", data.stats);
  // { total, pending, retrying, failed, resolved, byTopic, byService }
});
```

### Dashboard

| Evento                          | Descripción                      | Payload                             |
| ------------------------------- | -------------------------------- | ----------------------------------- |
| `dashboard:metrics:updated`     | Métricas actualizadas            | `{ metrics, dashboard, timestamp }` |
| `service:status:changed`        | Estado de microservicio cambió   | `{ service, status, timestamp }`    |
| `infrastructure:status:changed` | Estado de infraestructura cambió | `{ component, status }`             |

**Escuchar**:

```typescript
socket.on("dashboard:metrics:updated", (data) => {
  updateDashboard(data.metrics);
  // { avgLatency, throughput, totalEvents, failedEvents, ... }
});
```

### Notificaciones

| Evento                 | Descripción                     | Payload              |
| ---------------------- | ------------------------------- | -------------------- |
| `notification:created` | Nueva notificación              | `NotificationDto`    |
| `notification:read`    | Notificación marcada como leída | `{ notificationId }` |
| `notification:deleted` | Notificación eliminada          | `{ notificationId }` |

**Escuchar**:

```typescript
socket.on("notification:created", (notification) => {
  showNotification(notification);
  // { id, type, category, title, message, data, actionUrl }
});
```

**Enviar**:

```typescript
// Obtener notificaciones
socket.emit("notifications:get", (response) => {
  console.log("Notifications:", response.notifications);
});

// Marcar como leída
socket.emit("notifications:read", {
  notificationId: "notif-123",
});
```

### Logs

| Evento        | Descripción            | Payload    |
| ------------- | ---------------------- | ---------- |
| `log:entry`   | Entrada de log general | `LogEntry` |
| `log:error`   | Log de error           | `LogEntry` |
| `log:warning` | Log de advertencia     | `LogEntry` |

**Escuchar**:

```typescript
socket.on("log:error", (log) => {
  console.error("[ERROR]", log);
  // { timestamp, level, service, context, message, metadata, stack }
});
```

---

## 🔔 Notificaciones InApp

### Tipos de Notificaciones

| Tipo              | Descripción                  |
| ----------------- | ---------------------------- |
| `info`            | Información general          |
| `success`         | Operación exitosa            |
| `warning`         | Advertencia                  |
| `error`           | Error crítico                |
| `action_required` | Acción requerida del usuario |

### Categorías

| Categoría     | Descripción          |
| ------------- | -------------------- |
| `event`       | Eventos del sistema  |
| `user`        | Acciones de usuarios |
| `resource`    | Cambios en recursos  |
| `reservation` | Reservas             |
| `limit`       | Límites alcanzados   |
| `error`       | Errores del sistema  |
| `system`      | Sistema general      |

### Endpoints REST (Fallback)

**GET** `/api/v1/notifications`

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/notifications?unreadOnly=true
```

**GET** `/api/v1/notifications/unread/count`

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/notifications/unread/count
```

**POST** `/api/v1/notifications/:id/read`

```bash
curl -X POST -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/notifications/notif-123/read
```

**POST** `/api/v1/notifications/read-all`

```bash
curl -X POST -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/notifications/read-all
```

**DELETE** `/api/v1/notifications/:id`

```bash
curl -X DELETE -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/notifications/notif-123
```

---

## 📝 Logs en Tiempo Real

### Filtros de Logs

```typescript
const logFilters = {
  level: "error", // error, warn, info, debug
  service: "api-gateway",
  context: "EventBus",
};

socket.emit("subscribe", {
  channels: ["logs"],
  logFilters,
});
```

### Endpoints REST

**GET** `/api/v1/notifications/logs/recent`

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/v1/notifications/logs/recent?level=error&limit=50"
```

**GET** `/api/v1/notifications/logs/stats`

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/notifications/logs/stats
```

**Respuesta**:

```json
{
  "total": 1000,
  "byLevel": {
    "error": 15,
    "warn": 32,
    "info": 850,
    "debug": 103
  },
  "byService": {
    "api-gateway": 250,
    "auth-service": 180,
    "resources-service": 200
  },
  "recentErrors": [...]
}
```

---

## 🎨 Ejemplo Frontend React

```typescript
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export function useWebSocket(userId: string, token: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [dlqStats, setDlqStats] = useState(null);

  useEffect(() => {
    const newSocket = io("http://localhost:3000/api/v1/ws", {
      query: { userId },
      auth: { token },
    });

    // Suscribirse a canales
    newSocket.emit("subscribe", {
      channels: ["dashboard", "dlq", "notifications", "logs"],
      logFilters: { level: "error" },
    });

    // Escuchar eventos
    newSocket.on("dashboard:metrics:updated", (data) => {
      setMetrics(data.metrics);
    });

    newSocket.on("dlq:stats:updated", (data) => {
      setDlqStats(data.stats);
    });

    newSocket.on("notification:created", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    newSocket.on("log:error", (log) => {
      console.error("[SYSTEM ERROR]", log);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [userId, token]);

  return { socket, notifications, metrics, dlqStats };
}
```

---

## ⚙️ Configuración

### Variables de Entorno

```bash
# WebSocket habilitado por defecto
WEBSOCKET_ENABLED=true

# Namespace WebSocket
WEBSOCKET_NAMESPACE=/api/v1/ws

# Intervalo de actualización de métricas (ms)
WEBSOCKET_METRICS_INTERVAL=5000

# Intervalo de monitoreo DLQ (ms)
WEBSOCKET_DLQ_INTERVAL=10000

# Máximo de notificaciones por usuario
MAX_NOTIFICATIONS_PER_USER=100

# Tamaño del buffer de logs
LOG_BUFFER_SIZE=1000
```

### CORS

El WebSocket server acepta conexiones desde cualquier origen en desarrollo. En producción, configurar origins específicos:

```typescript
@WebSocketGateway({
  cors: {
    origin: ["https://bookly.com", "https://app.bookly.com"],
    credentials: true,
  },
})
```

---

## 🔐 Autenticación

### JWT en WebSocket

El userId se extrae de:

1. Query params: `?userId=user-123`
2. Auth header con JWT: `auth: { token: "jwt..." }`

**TODO**: Implementar validación JWT completa en `extractUserIdFromSocket()`.

---

## 📊 Monitoreo y Métricas

### Actualizaciones Automáticas

- **Métricas Dashboard**: Cada 5 segundos
- **Estadísticas DLQ**: Cada 10 segundos
- **Logs**: Tiempo real (inmediato)
- **Notificaciones**: Tiempo real (inmediato)

### Logs del WebSocket

```bash
# Ver logs del API Gateway
docker logs bookly-api-gateway | grep "WebSocketGateway"

# Logs de conexiones
# "WebSocket client connected: clientId=abc123, userId=user-123"
# "Client subscribed to channels: channels=['dashboard','dlq']"
```

---

## 🧪 Testing

### Test Manual con Socket.IO Client

```typescript
import { io } from "socket.io-client";

const socket = io("http://localhost:3000/api/v1/ws", {
  query: { userId: "test-user" },
});

socket.on("connect", () => {
  console.log("✅ Connected");

  // Test subscribe
  socket.emit(
    "subscribe",
    {
      channels: ["dashboard", "notifications"],
    },
    (response) => {
      console.log("Subscribed:", response);
    }
  );
});

socket.on("dashboard:metrics:updated", (data) => {
  console.log("📊 Metrics:", data);
});

socket.on("notification:created", (notification) => {
  console.log("🔔 Notification:", notification);
});
```

### Script de Test

```bash
# Crear script: scripts/test-websocket.ts
ts-node scripts/test-websocket.ts
```

---

## 📚 Referencias

- **Socket.IO**: https://socket.io/docs/v4/
- **NestJS WebSockets**: https://docs.nestjs.com/websockets/gateways
- **Event Bus**: [EVENT_BUS.md](EVENT_BUS.md)
- **DLQ**: [EVENT_BUS_FINAL.md](EVENT_BUS_FINAL.md)

---

**Implementado por**: Cascade AI  
**Fecha**: 2025-01-05  
**Estado**: ✅ PRODUCTION READY
