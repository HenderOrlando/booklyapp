# 📋 Plan de Próximos Pasos - Post Stack HTTP

**Fecha**: 20 de Noviembre 2025, 23:10  
**Estado Actual**: Fase 4 al 90%  
**Objetivo**: Completar Fase 4 al 100% y avanzar features adicionales

---

## 🎯 Visión General

Con el **Stack HTTP Enterprise completado al 100%**, ahora podemos enfocarnos en:

1. **Completar Fase 4** → CalendarView organism (90% → 100%)
2. **Mejorar Observabilidad** → Tests unitarios para interceptors
3. **Extender Capacidades** → Clientes adicionales (Reports, Notifications)
4. **Real-Time** → WebSocket integration

---

## 📊 Priorización

### 🔴 Alta Prioridad (Completar Fase 4)

#### 1. CalendarView Organism

**Objetivo**: Visualización de disponibilidad en formato calendario mensual/semanal

**Componentes a crear**:

- `CalendarGrid` (molecule) - Grid del calendario con días
- `CalendarHeader` (molecule) - Navegación mes/semana
- `CalendarDayCell` (atom) - Celda individual de día
- `CalendarEventBadge` (atom) - Badge de evento/reserva
- `CalendarView` (organism) - Calendario completo con eventos

**Funcionalidad**:

- ✅ Navegación por meses/semanas
- ✅ Visualización de reservas por día
- ✅ Click en día para crear reserva
- ✅ Drag & drop para cambiar fechas (opcional)
- ✅ Vista mensual y semanal
- ✅ Indicadores de disponibilidad
- ✅ Integración con React Query (useReservations)

**Tiempo estimado**: 4-6 horas  
**Prioridad**: 🔴 Alta  
**Impacto**: Completa Fase 4 al 100%

**Archivos a crear**:

```
src/components/
  atoms/
    CalendarDayCell.tsx          (50 líneas)
    CalendarEventBadge.tsx       (40 líneas)
  molecules/
    CalendarGrid.tsx             (150 líneas)
    CalendarHeader.tsx           (80 líneas)
  organisms/
    CalendarView.tsx             (300 líneas)
```

**Dependencias**:

```bash
npm install date-fns  # Manejo de fechas
```

---

### 🟡 Media Prioridad (Calidad y Observabilidad)

#### 2. Tests Unitarios para Interceptors

**Objetivo**: Asegurar calidad y prevenir regresiones

**Tests a crear**:

- `authInterceptor.test.ts` - Verificar token se agrega
- `retryInterceptor.test.ts` - Verificar reintentos y backoff
- `analyticsInterceptor.test.ts` - Verificar eventos GA
- `timingInterceptor.test.ts` - Verificar medición
- `refreshTokenInterceptor.test.ts` - Verificar auto-refresh

**Framework**: Jest + Testing Library

**Cobertura objetivo**: >80%

**Archivos a crear**:

```
src/infrastructure/api/__tests__/
  base-client.test.ts            (200 líneas)
  interceptors/
    auth.test.ts                 (100 líneas)
    retry.test.ts                (150 líneas)
    analytics.test.ts            (80 líneas)
    timing.test.ts               (80 líneas)
    refresh-token.test.ts        (120 líneas)
```

**Tiempo estimado**: 6-8 horas  
**Prioridad**: 🟡 Media  
**Impacto**: Calidad y mantenibilidad

---

### 🟢 Baja Prioridad (Extensiones)

#### 3. Clientes Adicionales HTTP

##### 3.1 ReportsClient

**Objetivo**: Cliente para generación de reportes

**Métodos** (10 métodos):

```typescript
class ReportsClient {
  // Reportes de uso
  static async getUsageReport(
    filters: UsageFilters
  ): Promise<ApiResponse<UsageReport>>;
  static async getResourceReport(
    resourceId: string
  ): Promise<ApiResponse<ResourceReport>>;
  static async getUserReport(userId: string): Promise<ApiResponse<UserReport>>;

  // Reportes de demanda
  static async getDemandReport(
    filters: DemandFilters
  ): Promise<ApiResponse<DemandReport>>;
  static async getOccupancyReport(
    filters: OccupancyFilters
  ): Promise<ApiResponse<OccupancyReport>>;

  // Exportación
  static async exportToCSV(reportId: string): Promise<ApiResponse<Blob>>;
  static async exportToPDF(reportId: string): Promise<ApiResponse<Blob>>;

  // Dashboards
  static async getDashboardData(
    dashboardId: string
  ): Promise<ApiResponse<DashboardData>>;
  static async getKPIs(): Promise<ApiResponse<KPIs>>;
  static async getAnalytics(period: string): Promise<ApiResponse<Analytics>>;
}
```

##### 3.2 NotificationsClient

**Objetivo**: Cliente para notificaciones

**Métodos** (8 métodos):

```typescript
class NotificationsClient {
  // Notificaciones
  static async getAll(): Promise<ApiResponse<PaginatedResponse<Notification>>>;
  static async getById(id: string): Promise<ApiResponse<Notification>>;
  static async markAsRead(id: string): Promise<ApiResponse<Notification>>;
  static async markAllAsRead(): Promise<ApiResponse<void>>;
  static async delete(id: string): Promise<ApiResponse<void>>;

  // Preferencias
  static async getPreferences(): Promise<ApiResponse<NotificationPreferences>>;
  static async updatePreferences(
    data: UpdatePreferencesDto
  ): Promise<ApiResponse<NotificationPreferences>>;

  // Suscripciones
  static async subscribe(channelId: string): Promise<ApiResponse<Subscription>>;
}
```

**React Query Hooks** (12 hooks):

```typescript
// Reports
useUsageReport();
useResourceReport();
useUserReport();
useDemandReport();
useOccupancyReport();
useDashboardData();
useKPIs();

// Notifications
useNotifications();
useNotification();
useMarkAsRead();
useNotificationPreferences();
useUpdatePreferences();
```

**Archivos a crear**:

```
src/infrastructure/api/
  reports-client.ts              (250 líneas)
  notifications-client.ts        (200 líneas)

src/types/entities/
  report.ts                      (100 líneas)
  notification.ts                (80 líneas)

src/hooks/
  useReports.ts                  (200 líneas)
  useNotifications.ts            (150 líneas)
```

**Tiempo estimado**: 8-10 horas  
**Prioridad**: 🟢 Baja  
**Impacto**: Extensión de funcionalidad

---

#### 4. WebSocket Integration

**Objetivo**: Notificaciones en tiempo real

**Funcionalidad**:

- Conexión WebSocket persistente
- Reconexión automática
- Heartbeat para mantener conexión
- Eventos en tiempo real:
  - Nueva reserva creada
  - Reserva actualizada/cancelada
  - Recurso actualizado
  - Notificación nueva
  - Mensaje del sistema

**Implementación**:

```typescript
// src/infrastructure/websocket/ws-client.ts
class WebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(url: string, token: string): void;
  disconnect(): void;
  send(event: string, data: any): void;
  on(event: string, handler: (data: any) => void): void;
  off(event: string, handler: (data: any) => void): void;

  private handleMessage(message: MessageEvent): void;
  private handleError(error: Event): void;
  private handleClose(event: CloseEvent): void;
  private reconnect(): void;
  private startHeartbeat(): void;
}
```

**React Hook**:

```typescript
// src/hooks/useWebSocket.ts
function useWebSocket(url: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);

  useEffect(() => {
    const ws = new WebSocketClient();
    ws.connect(url, getToken());

    ws.on("reservation:created", (data) => {
      // Invalidar cache de React Query
      queryClient.invalidateQueries(["reservations"]);
    });

    return () => ws.disconnect();
  }, [url]);

  return { isConnected, lastMessage };
}
```

**Archivos a crear**:

```
src/infrastructure/websocket/
  ws-client.ts                   (300 líneas)
  ws-events.ts                   (100 líneas)

src/hooks/
  useWebSocket.ts                (150 líneas)

src/providers/
  WebSocketProvider.tsx          (100 líneas)
```

**Dependencias**:

```bash
# Native WebSocket API (ya incluido en navegadores)
# No requiere dependencias adicionales
```

**Tiempo estimado**: 6-8 horas  
**Prioridad**: 🟢 Baja  
**Impacto**: Real-time updates

---

## 📅 Roadmap Sugerido

### Semana 1 (Noviembre 21-27)

**Objetivo**: Completar Fase 4 al 100%

- [ ] Día 1-2: CalendarView organism (diseño + estructura)
- [ ] Día 3-4: CalendarView organism (implementación + integración)
- [ ] Día 5: Tests de CalendarView
- [ ] **Resultado**: Fase 4 al 100% ✅

### Semana 2 (Noviembre 28 - Diciembre 4)

**Objetivo**: Calidad y observabilidad

- [ ] Día 1-2: Tests unitarios para interceptors
- [ ] Día 3: Tests para clientes HTTP
- [ ] Día 4-5: Tests para hooks React Query
- [ ] **Resultado**: Cobertura >80% ✅

### Semana 3 (Diciembre 5-11)

**Objetivo**: Extensiones opcionales

- [ ] Día 1-2: ReportsClient + hooks
- [ ] Día 3-4: NotificationsClient + hooks
- [ ] Día 5: Documentación de nuevos clientes
- [ ] **Resultado**: 60 métodos HTTP totales ✅

### Semana 4 (Diciembre 12-18)

**Objetivo**: Real-time

- [ ] Día 1-2: WebSocket client + eventos
- [ ] Día 3-4: Integración con React Query
- [ ] Día 5: Tests y documentación
- [ ] **Resultado**: Real-time updates ✅

---

## 🎯 Decisión: ¿Por Dónde Empezar?

### Opción A: Completar Fase 4 (Recomendado)

**CalendarView organism**

- ✅ Completa Fase 4 al 100%
- ✅ Feature visible para usuarios
- ✅ Mejora UX significativamente
- ⏱️ 4-6 horas

### Opción B: Asegurar Calidad

**Tests unitarios**

- ✅ Previene regresiones
- ✅ Documenta comportamiento esperado
- ✅ Facilita refactoring futuro
- ⏱️ 6-8 horas

### Opción C: Extender Funcionalidad

**Clientes adicionales**

- ✅ Más capacidades HTTP
- ✅ Sigue patrón establecido
- ✅ Fácil de implementar
- ⏱️ 8-10 horas

### Opción D: Real-Time

**WebSocket integration**

- ✅ Feature avanzada
- ✅ Mejora UX con updates en vivo
- ❌ Más complejo
- ⏱️ 6-8 horas

---

## 💡 Recomendación

**Orden sugerido**:

1. **CalendarView** → Completa Fase 4 al 100%
2. **Tests unitarios** → Asegura calidad
3. **Clientes adicionales** → Extiende capacidades
4. **WebSocket** → Feature avanzada opcional

**Justificación**:

- CalendarView es la única pieza faltante de Fase 4
- Tests aseguran que el stack HTTP funcione correctamente
- Nuevos clientes son extensiones opcionales
- WebSocket es feature nice-to-have pero no crítica

---

## 📊 Impacto Esperado

### Después de CalendarView (Fase 4 al 100%)

- ✅ CRUD completo de reservas
- ✅ Visualización en calendario
- ✅ Stack HTTP enterprise
- ✅ UX completa

### Después de Tests (Calidad asegurada)

- ✅ Cobertura >80%
- ✅ CI/CD con tests automáticos
- ✅ Confianza en refactoring

### Después de Clientes Adicionales

- ✅ 60 métodos HTTP totales
- ✅ 28 hooks React Query
- ✅ Funcionalidad completa

### Después de WebSocket

- ✅ Updates en tiempo real
- ✅ Notificaciones instantáneas
- ✅ UX de nivel enterprise

---

## 🚀 ¿Empezamos?

**Siguiente paso inmediato**: Crear CalendarView organism

**Componentes a crear**:

1. CalendarDayCell (atom)
2. CalendarEventBadge (atom)
3. CalendarHeader (molecule)
4. CalendarGrid (molecule)
5. CalendarView (organism)

**¿Procedemos con CalendarView?** 📅
