# 🌐 API Gateway - Plan de Frontend

**Microservicio**: API Gateway (Puerto 3000)  
**Funcionalidad**: WebSocket, Eventos en Tiempo Real, Notificaciones, Monitoreo  
**Endpoints Base**: `/api/v1/ws`, `/events/*`, `/notifications/*`, `/dlq/*`

---

## 📋 Funcionalidades del API Gateway

### Características Principales

- **WebSocket Gateway**: Conexiones en tiempo real para notificaciones y eventos
- **Event Streaming**: Streaming de eventos del sistema
- **Notificaciones en Vivo**: Sistema de notificaciones push
- **Dead Letter Queue (DLQ)**: Monitoreo de mensajes fallidos
- **Métricas de Cache**: Visualización de performance
- **Health Aggregation**: Estado consolidado de todos los servicios

---

## 🌐 Endpoints HTTP Disponibles

### Health Checks

```typescript
GET / health; // Health check general
GET / health / services; // Estado de todos los servicios
GET / health / detailed; // Health detallado con métricas
```

### Eventos

```typescript
GET    /events                                  // Listar eventos
GET    /events/:id                              // Obtener evento específico
GET    /events/metrics                          // Métricas de eventos
GET    /events/dashboard                        // Dashboard de eventos
POST   /events/replay                           // Reproducir eventos
GET    /events/stream                           // Stream de eventos (SSE)
```

### Dead Letter Queue (DLQ)

```typescript
GET    /dlq                                     // Listar mensajes en DLQ
GET    /dlq/:id                                 // Obtener mensaje DLQ
POST   /dlq/:id/retry                           // Reintentar mensaje
DELETE /dlq/:id                                 // Eliminar mensaje DLQ
POST   /dlq/retry-all                           // Reintentar todos
DELETE /dlq/clear                               // Limpiar DLQ
GET    /dlq/stats                               // Estadísticas DLQ
```

### Notificaciones

```typescript
GET    /notifications                           // Listar notificaciones
GET    /notifications/:id                       // Obtener notificación
POST   /notifications/:id/read                  // Marcar como leída
POST   /notifications/:id/unread                // Marcar como no leída
DELETE /notifications/:id                       // Eliminar notificación
POST   /notifications/read-all                  // Marcar todas como leídas
DELETE /notifications/clear-all                 // Eliminar todas
GET    /notifications/unread/count              // Contador de no leídas
```

### Métricas de Cache

```typescript
GET / api / v1 / metrics / cache; // Métricas generales
GET / api / v1 / metrics / cache / prometheus; // Formato Prometheus
GET / api / v1 / metrics / cache / hit - rate; // Tasa de aciertos
GET / api / v1 / metrics / cache / keys; // Claves activas
POST / api / v1 / metrics / cache / clear; // Limpiar cache
```

---

## 🔌 WebSocket

### Conexión WebSocket

```typescript
// Namespace: /api/v1/ws
const socket = io("http://localhost:3000", {
  path: "/api/v1/ws",
  auth: {
    token: accessToken,
  },
  query: {
    userId: currentUser.id,
  },
});
```

### Eventos WebSocket Disponibles

#### Client → Server

```typescript
// Suscribirse a canales
socket.emit("subscribe", {
  channels: ["dashboard", "notifications", "events", "dlq"],
  eventFilters: {
    types: ["reservation.created", "resource.updated"],
  },
  dlqFilters: {
    minRetries: 3,
  },
});

// Desuscribirse
socket.emit("unsubscribe", {
  channels: ["events"],
});

// Obtener notificaciones
socket.emit("notifications:get");

// Marcar notificación como leída
socket.emit("notifications:read", {
  notificationId: "notif_123",
});
```

#### Server → Client

```typescript
// Estado inicial al conectar
socket.on("connect", () => {
  console.log("Connected to WebSocket");
});

// Métricas del dashboard actualizadas
socket.on("dashboard:metrics:updated", (data) => {
  // data: { metrics, dashboard, timestamp }
});

// Estadísticas DLQ actualizadas
socket.on("dlq:stats:updated", (data) => {
  // data: { stats, timestamp }
});

// Nueva notificación
socket.on("notification:new", (notification) => {
  // Mostrar toast o badge
});

// Notificación marcada como leída
socket.on("notification:read", (data) => {
  // data: { notificationId }
});

// Notificaciones iniciales
socket.on("notifications:initial", (notifications) => {
  // Array de notificaciones no leídas
});

// Evento del sistema
socket.on("event:published", (event) => {
  // Evento en tiempo real
});

// Desconexión
socket.on("disconnect", () => {
  console.log("Disconnected from WebSocket");
});
```

---

## 📄 Páginas a Implementar

### 1. Monitoreo del Sistema

#### `/dashboard/system/monitoring` - Monitoreo en Tiempo Real

```typescript
// app/(dashboard)/system/monitoring/page.tsx
"use client";

export default function SystemMonitoringPage() {
  return (
    <DashboardTemplate>
      <PageHeader title="Monitoreo del Sistema" />
      <Grid cols={3}>
        <ServiceHealthCard service="auth" />
        <ServiceHealthCard service="resources" />
        <ServiceHealthCard service="availability" />
        <ServiceHealthCard service="stockpile" />
        <ServiceHealthCard service="reports" />
        <ServiceHealthCard service="api-gateway" />
      </Grid>
      <LiveMetricsChart />
      <SystemAlertsPanel />
    </DashboardTemplate>
  );
}
```

### 2. Event Dashboard

#### `/dashboard/system/events` - Dashboard de Eventos

```typescript
// app/(dashboard)/system/events/page.tsx
"use client";

export default function EventsDashboardPage() {
  return (
    <DashboardTemplate>
      <PageHeader title="Dashboard de Eventos" />
      <EventMetrics />
      <EventFilters />
      <LiveEventStream />
      <EventReplayButton />
    </DashboardTemplate>
  );
}
```

### 3. Dead Letter Queue

#### `/dashboard/system/dlq` - Gestión de DLQ

```typescript
// app/(dashboard)/system/dlq/page.tsx
"use client";

export default function DLQPage() {
  return (
    <DashboardTemplate>
      <PageHeader
        title="Dead Letter Queue"
        actions={
          <>
            <RetryAllButton />
            <ClearDLQButton />
          </>
        }
      />
      <DLQStats />
      <DLQTable />
    </DashboardTemplate>
  );
}
```

### 4. Notificaciones

#### `/dashboard/notifications` - Centro de Notificaciones

```typescript
// app/(dashboard)/notifications/page.tsx
"use client";

export default function NotificationsPage() {
  return (
    <DashboardTemplate>
      <PageHeader
        title="Notificaciones"
        actions={
          <>
            <MarkAllReadButton />
            <ClearAllButton />
          </>
        }
      />
      <NotificationFilters />
      <NotificationsList />
    </DashboardTemplate>
  );
}
```

---

## 🧩 Componentes Clave

### WebSocket Provider

```typescript
// providers/WebSocketProvider.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface WebSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  subscribe: (channels: string[]) => void;
  unsubscribe: (channels: string[]) => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { accessToken, user } = useAuth();

  useEffect(() => {
    if (!accessToken || !user) return;

    const socketInstance = io(process.env.NEXT_PUBLIC_API_GATEWAY_URL!, {
      path: "/api/v1/ws",
      auth: { token: accessToken },
      query: { userId: user.id },
    });

    socketInstance.on("connect", () => {
      setIsConnected(true);
      console.log("WebSocket connected");
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
      console.log("WebSocket disconnected");
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [accessToken, user]);

  const subscribe = (channels: string[]) => {
    socket?.emit("subscribe", { channels });
  };

  const unsubscribe = (channels: string[]) => {
    socket?.emit("unsubscribe", { channels });
  };

  return (
    <WebSocketContext.Provider
      value={{ socket, isConnected, subscribe, unsubscribe }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context)
    throw new Error("useWebSocket must be used within WebSocketProvider");
  return context;
};
```

### Notifications Hook

```typescript
// hooks/useNotifications.ts
export const useNotifications = () => {
  const { socket } = useWebSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!socket) return;

    // Suscribirse al canal de notificaciones
    socket.emit("subscribe", { channels: ["notifications"] });

    // Listener para nuevas notificaciones
    socket.on("notification:new", (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Mostrar toast
      toast.info(notification.message);
    });

    // Listener para notificaciones iniciales
    socket.on("notifications:initial", (initial: Notification[]) => {
      setNotifications(initial);
      setUnreadCount(initial.filter((n) => !n.isRead).length);
    });

    // Listener para lectura
    socket.on("notification:read", ({ notificationId }) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    });

    return () => {
      socket.off("notification:new");
      socket.off("notifications:initial");
      socket.off("notification:read");
    };
  }, [socket]);

  const markAsRead = (notificationId: string) => {
    socket?.emit("notifications:read", { notificationId });
  };

  const markAllAsRead = () => {
    notifications.forEach((n) => {
      if (!n.isRead) markAsRead(n.id);
    });
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  };
};
```

### Live Dashboard Hook

```typescript
// hooks/useLiveDashboard.ts
export const useLiveDashboard = () => {
  const { socket } = useWebSocket();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [dlqStats, setDlqStats] = useState<DLQStats | null>(null);

  useEffect(() => {
    if (!socket) return;

    // Suscribirse al dashboard
    socket.emit("subscribe", { channels: ["dashboard", "dlq"] });

    // Actualización de métricas cada 5 segundos
    socket.on("dashboard:metrics:updated", (data) => {
      setMetrics(data.metrics);
    });

    // Actualización de DLQ cada 10 segundos
    socket.on("dlq:stats:updated", (data) => {
      setDlqStats(data.stats);
    });

    return () => {
      socket.off("dashboard:metrics:updated");
      socket.off("dlq:stats:updated");
    };
  }, [socket]);

  return { metrics, dlqStats };
};
```

### Service Health Card

```typescript
// components/organisms/ServiceHealthCard/ServiceHealthCard.tsx
interface ServiceHealthCardProps {
  service:
    | "auth"
    | "resources"
    | "availability"
    | "stockpile"
    | "reports"
    | "api-gateway";
}

export function ServiceHealthCard({ service }: ServiceHealthCardProps) {
  const { data, isLoading } = useGetServiceHealthQuery(service);

  return (
    <Card>
      <CardHeader>
        <ServiceIcon service={service} />
        <ServiceName service={service} />
      </CardHeader>
      <CardContent>
        <HealthStatus status={data?.status} />
        <MetricsGrid>
          <Metric label="Uptime" value={data?.uptime} />
          <Metric label="Response Time" value={data?.responseTime} />
          <Metric label="Memory" value={data?.memory} />
          <Metric label="CPU" value={data?.cpu} />
        </MetricsGrid>
      </CardContent>
    </Card>
  );
}
```

### Live Event Stream

```typescript
// components/organisms/LiveEventStream/LiveEventStream.tsx
export function LiveEventStream() {
  const { socket } = useWebSocket();
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    if (!socket) return;

    socket.emit("subscribe", { channels: ["events"] });

    socket.on("event:published", (event: Event) => {
      setEvents((prev) => [event, ...prev.slice(0, 99)]); // Mantener últimos 100
    });

    return () => {
      socket.off("event:published");
    };
  }, [socket]);

  return (
    <Card>
      <CardHeader>
        <h3>Eventos en Tiempo Real</h3>
        <Badge>{events.length}</Badge>
      </CardHeader>
      <CardContent>
        <EventsList events={events} maxHeight={400} />
      </CardContent>
    </Card>
  );
}
```

---

## 📐 Tipos TypeScript

```typescript
// types/websocket.ts

export interface WebSocketEvent {
  type: string;
  payload: any;
  timestamp: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
}

export enum NotificationType {
  RESERVATION_CREATED = "RESERVATION_CREATED",
  RESERVATION_CANCELLED = "RESERVATION_CANCELLED",
  RESERVATION_MODIFIED = "RESERVATION_MODIFIED",
  APPROVAL_REQUIRED = "APPROVAL_REQUIRED",
  APPROVAL_APPROVED = "APPROVAL_APPROVED",
  APPROVAL_REJECTED = "APPROVAL_REJECTED",
  MAINTENANCE_SCHEDULED = "MAINTENANCE_SCHEDULED",
  RESOURCE_AVAILABLE = "RESOURCE_AVAILABLE",
  SYSTEM_ALERT = "SYSTEM_ALERT",
}

export interface DashboardMetrics {
  totalReservations: number;
  activeReservations: number;
  totalResources: number;
  availableResources: number;
  occupancyRate: number;
  totalUsers: number;
  activeUsers: number;
}

export interface DLQStats {
  totalMessages: number;
  byService: Record<string, number>;
  avgRetries: number;
  oldestMessage?: string;
}

export interface ServiceHealth {
  service: string;
  status: "healthy" | "degraded" | "down";
  uptime: number;
  responseTime: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu: {
    percentage: number;
  };
  lastCheck: string;
}
```

---

## 🎯 Casos de Uso

### 1. Conectar a WebSocket al Login

```typescript
// hooks/useAutoConnectWebSocket.ts
export const useAutoConnectWebSocket = () => {
  const { isAuthenticated, accessToken, user } = useAuth();
  const { socket } = useWebSocket();

  useEffect(() => {
    if (isAuthenticated && socket && !socket.connected) {
      socket.connect();
    }

    if (!isAuthenticated && socket && socket.connected) {
      socket.disconnect();
    }
  }, [isAuthenticated, socket]);
};
```

### 2. Sistema de Notificaciones Toast

```typescript
// hooks/useNotificationToasts.ts
export const useNotificationToasts = () => {
  const { socket } = useWebSocket();

  useEffect(() => {
    if (!socket) return;

    socket.on("notification:new", (notification: Notification) => {
      const toastConfig = getToastConfig(notification.type);

      toast[toastConfig.variant](notification.message, {
        action: {
          label: "Ver",
          onClick: () =>
            router.push(notification.data?.url || "/notifications"),
        },
      });
    });

    return () => {
      socket.off("notification:new");
    };
  }, [socket]);
};

function getToastConfig(type: NotificationType) {
  const configs = {
    [NotificationType.RESERVATION_CREATED]: { variant: "success" },
    [NotificationType.APPROVAL_REQUIRED]: { variant: "info" },
    [NotificationType.APPROVAL_REJECTED]: { variant: "warning" },
    [NotificationType.SYSTEM_ALERT]: { variant: "error" },
  };
  return configs[type] || { variant: "default" };
}
```

### 3. Badge de Notificaciones No Leídas

```typescript
// components/molecules/NotificationBadge/NotificationBadge.tsx
export function NotificationBadge() {
  const { unreadCount } = useNotifications();

  return (
    <IconButton>
      <BellIcon />
      {unreadCount > 0 && (
        <Badge variant="destructive">
          {unreadCount > 99 ? "99+" : unreadCount}
        </Badge>
      )}
    </IconButton>
  );
}
```

### 4. Monitoreo de Health en Tiempo Real

```typescript
// hooks/useServiceHealthMonitoring.ts
export const useServiceHealthMonitoring = () => {
  const [healthStatus, setHealthStatus] = useState<
    Record<string, ServiceHealth>
  >({});

  useEffect(() => {
    const interval = setInterval(async () => {
      const response = await fetch("/health/services");
      const data = await response.json();
      setHealthStatus(data.services);
    }, 10000); // Cada 10 segundos

    return () => clearInterval(interval);
  }, []);

  return { healthStatus };
};
```

---

## ✅ Checklist de Implementación

### WebSocket

- [ ] Provider de WebSocket
- [ ] Auto-conexión al login
- [ ] Auto-desconexión al logout
- [ ] Reconexión automática
- [ ] Manejo de errores de conexión
- [ ] Indicador de estado de conexión

### Notificaciones

- [ ] Sistema de notificaciones en vivo
- [ ] Badge de no leídas en navbar
- [ ] Panel de notificaciones
- [ ] Marcar como leída/no leída
- [ ] Toast notifications
- [ ] Sonido de notificación (opcional)
- [ ] Permisos de navegador para notificaciones

### Dashboard en Tiempo Real

- [ ] Métricas actualizadas cada 5 seg
- [ ] Gráficos en vivo
- [ ] Alertas del sistema
- [ ] Estado de servicios
- [ ] Auto-refresh de datos

### Monitoreo del Sistema

- [ ] Health checks de servicios
- [ ] Visualización de métricas
- [ ] Alertas de servicios caídos
- [ ] Logs en tiempo real
- [ ] Performance metrics

### Dead Letter Queue

- [ ] Lista de mensajes fallidos
- [ ] Reintentar mensaje individual
- [ ] Reintentar todos
- [ ] Eliminar mensajes
- [ ] Estadísticas de DLQ
- [ ] Alertas de DLQ lleno

### Event Streaming

- [ ] Stream de eventos en vivo
- [ ] Filtros de eventos
- [ ] Replay de eventos
- [ ] Dashboard de eventos
- [ ] Métricas de eventos
- [ ] Exportación de eventos

---

## 🔒 Seguridad WebSocket

### Autenticación

```typescript
// middleware/websocket-auth.ts
socket.use((socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error("Authentication error"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.data.userId = decoded.userId;
    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
});
```

### Rate Limiting

```typescript
// Cliente debe respetar rate limits en eventos
const rateLimiter = new Map<string, number>();

function checkRateLimit(eventType: string): boolean {
  const now = Date.now();
  const lastCall = rateLimiter.get(eventType) || 0;

  if (now - lastCall < 1000) {
    // Max 1 evento por segundo
    return false;
  }

  rateLimiter.set(eventType, now);
  return true;
}
```

---

**Anterior**: [05_REPORTS_SERVICE.md](./05_REPORTS_SERVICE.md)  
**Volver**: [00_PLAN_GENERAL.md](./00_PLAN_GENERAL.md)

---

## 📝 Resumen Final

El plan completo del frontend está dividido en 7 documentos:

1. **00_PLAN_GENERAL.md** - Visión general, arquitectura y stack tecnológico
2. **01_AUTH_SERVICE.md** - Autenticación, usuarios, roles, permisos, auditoría, 2FA
3. **02_RESOURCES_SERVICE.md** - CRUD recursos, categorías, mantenimiento, importación
4. **03_AVAILABILITY_SERVICE.md** - Reservas, calendario, disponibilidad, waitlist
5. **04_STOCKPILE_SERVICE.md** - Aprobaciones, flujos, check-in/out, documentos
6. **05_REPORTS_SERVICE.md** - Reportes, dashboards, análisis, feedback
7. **06_API_GATEWAY.md** - WebSocket, notificaciones, eventos, monitoreo

Total de funcionalidades: **Más de 150 endpoints REST + WebSocket en tiempo real**
