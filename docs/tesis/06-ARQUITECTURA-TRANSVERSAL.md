# Arquitectura Transversal y Plataforma

## Análisis para Tesis de Grado — API Gateway, Infraestructura y Observabilidad

---

## 1. Contexto

La arquitectura transversal de Bookly comprende los componentes que orquestan, protegen, observan y despliegan el sistema completo. Incluye el API Gateway como punto de entrada unificado, las librerías compartidas como columna vertebral técnica, el bus de eventos como sistema nervioso, y la observabilidad como capacidad de introspección del sistema.

---

## 2. API Gateway (Puerto 3000)

### 2.1 Funcionalidades

| Capacidad | Implementación |
|-----------|---------------|
| **Routing centralizado** | Proxy transparente a 5 microservicios |
| **Rate Limiting** | Por IP, usuario y tenant |
| **Circuit Breaker** | Protección contra cascada de fallos |
| **WebSocket Server** | Socket.IO para comunicación en tiempo real |
| **Health Checks** | Sonda de salud para todos los servicios |
| **DLQ Admin** | Gestión de Dead Letter Queue |
| **Cache Metrics** | Agregación de métricas de cache de todos los servicios |
| **Event Dashboard** | Visualización de eventos y métricas |
| **Notifications** | Centro de notificaciones con REST y WebSocket |
| **File Manager** | Gestión de archivos y uploads |
| **Webhook Dashboard** | Configuración de webhooks |

### 2.2 WebSocket en Tiempo Real

Canales implementados:

- **Events**: Eventos del Event Store en tiempo real (`event:created`, `event:failed`, `event:replayed`)
- **DLQ**: Monitoreo de Dead Letter Queue (`dlq:event:added`, `dlq:stats:updated`)
- **Dashboard**: Métricas del sistema (`dashboard:metrics:updated`, `service:status:changed`)
- **Notifications**: Notificaciones in-app (`notification:created`, `notification:read`)
- **Logs**: Streaming de logs con filtros (`log:entry`, `log:error`, `log:warning`)

Intervalos de actualización:

- Métricas Dashboard: cada 5 segundos
- Estadísticas DLQ: cada 10 segundos
- Logs y Notificaciones: tiempo real inmediato

### 2.3 Notificaciones In-App

6 categorías: `event`, `user`, `resource`, `reservation`, `limit`, `error`
5 tipos: `info`, `success`, `warning`, `error`, `action_required`

---

## 3. Librerías Compartidas (libs/)

Las librerías compartidas son el contrato técnico que unifica todos los microservicios:

| Librería | Propósito | Componentes Clave |
|----------|-----------|-------------------|
| **@libs/common** | Base compartida | ResponseUtil, constantes, enums, decoradores, interfaces |
| **@libs/event-bus** | Eventos distribuidos | EventBusService, EventStoreService, DLQService, RabbitMQ adapter |
| **@libs/redis** | Cache distribuida | RedisModule, RedisService, CacheMetricsService |
| **@libs/database** | Persistencia | DatabaseModule (Mongoose), ReferenceDataModule |
| **@libs/security** | Seguridad centralizada | AuthClientModule, AuthClientService (introspect, evaluate) |
| **@libs/guards** | Protección de endpoints | JwtAuthGuard, RolesGuard, PermissionsGuard |
| **@libs/decorators** | Metadatos declarativos | @Roles, @Permissions, @CurrentUser, @RequirePermissions |
| **@libs/idempotency** | Anti-duplicación | IdempotencyService, CorrelationService, middleware |
| **@libs/notifications** | Multicanal | Email, SMS, WhatsApp, Push, Webhooks |
| **@libs/storage** | Almacenamiento | StorageModule (Local/S3/GCS) |

---

## 4. Event-Driven Architecture (EDA)

### 4.1 Bus de Eventos con RabbitMQ

- **Exchange**: `bookly-events` (topic type, durable)
- **VHost**: `/bookly`
- **Protocolo**: AMQP con reconexión automática
- **Total de canales**: 78 AsyncAPI channels documentados

### 4.2 Event Store (ADR-002)

Todos los eventos del dominio se persisten en MongoDB con:

- `correlationId` (indexado) — Traza un request a través de servicios
- `causationId` (indexado) — Vincula evento con su causa
- `idempotencyKey` (índice único sparse) — Previene almacenamiento duplicado

Capacidades: persistencia, consulta, replay, trazabilidad completa.

### 4.3 Dead Letter Queue (ADR-003)

Política de manejo de mensajes fallidos:

- **Reintentos**: 3 máximo con tracking via `x-death` headers
- **DLX per queue**: Cada cola tiene su companion DLQ (`{queue}.dlq`)
- **Auto-retry**: Procesador cada 30 segundos para eventos pendientes
- **Admin API**: CRUD completo en `/dlq/*` para gestión manual
- **Estadísticas**: Por estado, topic y servicio

### 4.4 Distributed Tracing e Idempotencia

Campos de contexto propagados en cada evento:

```typescript
interface ResponseContext {
  correlationId?: string;    // Traza cross-service
  messageId?: string;        // ID único del evento
  causationId?: string;      // Evento causa
  idempotencyKey?: string;   // Clave anti-duplicación
  retryCount?: number;       // Intentos realizados
  maxRetries?: number;       // Máximo de reintentos
  ttl?: number;              // Time to live
  expiresAt?: Date;          // Expiración
  version?: string;          // Schema version
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}
```

Patrones implementados:

- **Idempotency Store**: Redis NX + TTL para operaciones atómicas
- **Correlation Chain**: Lista encadenada en Redis para reconstruir flujos
- **Causal Tree**: Reconstrucción del árbol de causalidad entre eventos
- **TTL Validation**: Descarte de eventos expirados antes de procesar

---

## 5. Estándar de Respuesta Unificado

### 5.1 ApiResponseBookly

Formato único para HTTP, WebSocket, Events y RPC:

```typescript
interface ApiResponseBookly<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
  meta?: PaginationMeta;
  timestamp?: string;
  path?: string;
  method?: string;
  statusCode?: number;
  context?: ResponseContext;
}
```

### 5.2 ResponseUtil

Métodos especializados por protocolo:

- `ResponseUtil.success()`, `ResponseUtil.paginated()`, `ResponseUtil.error()`
- `ResponseUtil.event()` — Eventos de dominio con correlación
- `ResponseUtil.websocket()` — Comunicación en tiempo real
- `ResponseUtil.rpc()` — Request-reply entre servicios
- `ResponseUtil.http()` — Contexto HTTP explícito

### 5.3 TransformInterceptor

Interceptor global que:

- Detecta respuestas ya en formato `ApiResponseBookly`
- Agrega contexto HTTP automáticamente
- Transforma respuestas simples al formato estándar
- Agrega timestamp ISO 8601

---

## 6. Architecture Decision Records (ADRs)

| ADR | Título | Estado |
|-----|--------|--------|
| ADR-001 | auth-service como Single Source of Truth para identidad y permisos | Aceptado |
| ADR-002 | Event Store con persistencia y trazabilidad | Aceptado |
| ADR-003 | Política de Dead Letter Queue para RabbitMQ | Aceptado |

Cada ADR sigue formato estándar: Context → Decision → Alternatives → Consequences → Migration Plan.

---

## 7. Observabilidad

### 7.1 Stack de Observabilidad

| Componente | Herramienta | Propósito |
|------------|-------------|-----------|
| **Logging** | Winston (JSON estructurado) | Registro de eventos con `trace_id`, `tenant_id`, `actor_id` |
| **Tracing** | OpenTelemetry | Spans distribuidos: HTTP, DB, cache, queue, external |
| **Errores** | Sentry | Captura de excepciones con alertas automáticas |
| **Métricas** | Prometheus format + OTel | RED metrics (Rate, Error, Duration) por servicio |
| **Cache** | CacheMetricsService | Hit/miss ratio por servicio con Prometheus export |

### 7.2 KPIs de Plataforma

| KPI | Fuente | Umbral |
|-----|--------|--------|
| Event store write success rate | event-bus | < 99% |
| DLQ depth | DLQ collection | > 50 |
| RabbitMQ consumer lag | RabbitMQ API | > 1000 |
| Notification delivery success rate | NotificationMetrics | < 90% |
| HTTP error rate (5xx) | OTel | > 1% en 5 min |
| Service health | /health | Any DOWN |

### 7.3 Documentación de APIs

- **OpenAPI 3.0**: 313 operaciones documentadas con Swagger UI
- **AsyncAPI 2.6.0**: 78 canales de eventos documentados
- Cada servicio expone `/api/docs` con Swagger UI interactivo

---

## 8. Aspectos Destacables para Tesis

### 8.1 Innovación Técnica

- **Estándar de respuesta multi-protocolo**: Un solo formato (`ApiResponseBookly`) para HTTP, WebSocket, Events y RPC. Esto es inusual incluso en sistemas enterprise y simplifica enormemente la integración frontend-backend.
- **Event Store con trazabilidad completa**: Combinación de `correlationId`, `causationId` e `idempotencyKey` permite reconstruir el flujo completo de cualquier operación a través de todos los microservicios.
- **Dead Letter Queue operacionalizada**: No solo se detectan mensajes fallidos, sino que se proporcionan herramientas de administración (retry manual, resolución, estadísticas) vía API REST y WebSocket en tiempo real.
- **Cache metrics con Prometheus**: Métricas de hit/miss ratio por servicio exportables en formato Prometheus, con agregación centralizada en el API Gateway.

### 8.2 Contribución Académica

- **Modelo C4 documentado**: Arquitectura documentada en 3 niveles (Context, Container, Component) con diagramas Mermaid reproducibles.
- **ADRs como práctica de gobierno**: Decisiones arquitectónicas formalizadas con trade-offs explícitos, alternativas consideradas y plan de migración.
- **78 canales AsyncAPI**: Uno de los catálogos de eventos más completos para un sistema de reservas institucional, demostrando la aplicación práctica de EDA en educación superior.
- **313 operaciones OpenAPI**: Documentación automática completa que sirve como contrato formal entre frontend y backend.

### 8.3 Impacto Institucional

- **Observabilidad como ventaja operativa**: La universidad puede monitorear en tiempo real el estado de toda su plataforma de reservas.
- **Resiliencia ante fallos**: Circuit breaker, DLQ y degradación graciosa aseguran que el sistema sigue funcionando parcialmente incluso cuando un componente falla.
- **Escalabilidad demostrada**: La arquitectura de microservicios permite escalar horizontalmente los servicios más demandados (availability) sin afectar los demás.

---

## 9. Skills y Rules Aplicadas

- **Skills**: `gobierno-de-arquitectura-diseno`, `plataforma-build-deploy-operate-observe`, `arquitectura-escalabilidad-resiliencia`, `backend`
- **Rules**: Todas las reglas transversales de arquitectura, API standards, response format

---

**Componentes**: API Gateway + 10 librerías compartidas + Event Bus + Observabilidad
**OpenAPI**: 313 operaciones totales
**AsyncAPI**: 78 canales de eventos totales
**ADRs**: 3 decisiones arquitectónicas formalizadas
