# Estándar de Respuesta API - Bookly (Unificado)

## Descripción General

Este documento define el **estándar unificado de respuestas** para todos los microservicios de Bookly. El estándar soporta múltiples protocolos de comunicación:

- ✅ **HTTP/REST** - APIs RESTful
- ✅ **WebSocket** - Comunicación en tiempo real
- ✅ **Events** - Event-Driven Architecture (RabbitMQ/Kafka)
- ✅ **RPC** - Remote Procedure Calls

## Estructura Estándar: `ApiResponseBookly<T>`

```typescript
interface ApiResponseBookly<T = any> {
  // Core (obligatorio)
  success: boolean;

  // Data (opcional)
  data?: T;
  message?: string;

  // Errores granulares por campo (opcional)
  errors?: Record<string, string[]>;

  // Metadata (opcional)
  meta?: PaginationMeta | AdvancedSearchPaginationMeta;

  // Context HTTP (opcional)
  timestamp?: string;
  path?: string;
  method?: string;
  statusCode?: number;

  // Context extendido (opcional)
  context?: ResponseContext;
}
```

### ResponseContext

```typescript
interface ResponseContext {
  type: "http" | "websocket" | "event" | "rpc";
  timestamp: string | Date;
  path?: string; // HTTP/WebSocket
  method?: string; // HTTP
  statusCode?: number; // HTTP
  eventType?: string; // Events
  service?: string; // Events
  correlationId?: string; // RPC/Events
}
```

## Tipos de Respuesta

### 1. HTTP - Respuesta Exitosa Individual

```json
{
  "success": true,
  "data": {
    "id": "123",
    "name": "Sala A-101"
  },
  "message": "Resource retrieved successfully",
  "timestamp": "2025-01-01T12:00:00.000Z",
  "path": "/api/v1/resources/123",
  "method": "GET",
  "statusCode": 200
}
```

**Uso en código:**

```typescript
return ResponseUtil.success(resource, "Resource retrieved successfully");
```

### 2. HTTP - Respuesta Paginada

```json
{
  "success": true,
  "data": [
    { "id": "1", "name": "Sala A-101" },
    { "id": "2", "name": "Sala A-102" }
  ],
  "message": "Resources retrieved successfully",
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  },
  "timestamp": "2025-01-01T12:00:00.000Z",
  "path": "/api/v1/resources",
  "method": "GET",
  "statusCode": 200
}
```

**Uso en código:**

```typescript
return ResponseUtil.paginated(
  resources,
  total,
  page,
  limit,
  "Resources retrieved successfully"
);
```

### 3. HTTP - Respuesta de Error con Validaciones

```json
{
  "success": false,
  "data": null,
  "message": "Validation failed",
  "errors": {
    "name": ["Name is required", "Name must be at least 3 characters"],
    "capacity": ["Capacity must be greater than 0"]
  },
  "timestamp": "2025-01-01T12:00:00.000Z",
  "path": "/api/v1/resources",
  "method": "POST",
  "statusCode": 400
}
```

**Uso en código:**

```typescript
return ResponseUtil.validationError({
  name: ["Name is required"],
  capacity: ["Capacity must be greater than 0"],
});
```

### 4. WebSocket - Notificación en Tiempo Real

```json
{
  "success": true,
  "data": {
    "id": "notif-123",
    "type": "reservation_confirmed",
    "title": "Reservation Confirmed",
    "message": "Your reservation for Sala A-101 has been confirmed"
  },
  "message": "Notification sent",
  "timestamp": "2025-01-01T12:00:00.000Z",
  "context": {
    "type": "websocket",
    "timestamp": "2025-01-01T12:00:00.000Z",
    "path": "/ws/notifications"
  }
}
```

**Uso en código:**

```typescript
return ResponseUtil.websocket(
  notification,
  "Notification sent",
  "/ws/notifications"
);
```

### 5. Event - Evento de Dominio

```json
{
  "success": true,
  "data": {
    "resourceId": "123",
    "name": "Sala A-101",
    "changes": {
      "status": "available"
    }
  },
  "message": "Resource updated event",
  "timestamp": "2025-01-01T12:00:00.000Z",
  "context": {
    "type": "event",
    "timestamp": "2025-01-01T12:00:00.000Z",
    "eventType": "RESOURCE_UPDATED",
    "service": "resources-service",
    "correlationId": "evt-789"
  }
}
```

**Uso en código:**

```typescript
return ResponseUtil.event(
  resourceData,
  "RESOURCE_UPDATED",
  "resources-service",
  "Resource updated event",
  "evt-789"
);
```

### 6. RPC - Request-Reply Pattern

```json
{
  "success": true,
  "data": {
    "resourceId": "123",
    "available": true
  },
  "message": "Availability checked",
  "timestamp": "2025-01-01T12:00:00.000Z",
  "context": {
    "type": "rpc",
    "timestamp": "2025-01-01T12:00:00.000Z",
    "correlationId": "rpc-456"
  }
}
```

**Uso en código:**

```typescript
return ResponseUtil.rpc(availabilityData, "rpc-456", "Availability checked");
```

## API del ResponseUtil

### Métodos Principales

#### `success<T>(data, message?, meta?, context?)`

Crea una respuesta exitosa genérica.

#### `paginated<T>(data, total, page, limit, message?, context?)`

Crea una respuesta paginada con metadata.

#### `advancedSearchPaginated<T>(data, pagination, startTime, filters, message?, context?)`

Crea una respuesta de búsqueda avanzada con métricas de ejecución.

#### `error(message, errors?, data?, context?)`

Crea una respuesta de error genérica.

#### `validationError(errors, message?, context?)`

Crea una respuesta de error de validación.

#### `notFound(resource?, message?, context?)`

Crea una respuesta de recurso no encontrado (404).

#### `unauthorized(message?, context?)`

Crea una respuesta de no autorizado (401).

#### `forbidden(message?, context?)`

Crea una respuesta de acceso prohibido (403).

### Métodos Especializados

#### `event<T>(data, eventType, service, message?, correlationId?)`

Crea una respuesta para eventos de dominio (Event-Driven Architecture).

#### `websocket<T>(data, message?, path?)`

Crea una respuesta para comunicación WebSocket.

#### `rpc<T>(data, correlationId, message?)`

Crea una respuesta para llamadas RPC con correlación.

#### `http<T>(data, statusCode, path?, method?, message?)`

Crea una respuesta HTTP explícita con contexto completo.

#### `fromServiceResponse<T>(serviceResponse)`

Transforma respuestas de servicios al formato estándar.

#### `list<T>(items, message?)`

Crea una respuesta de lista simple.

## Ejemplos de Uso en Controllers

### HTTP REST Controller

```typescript
import { Controller, Get, Post, Body, Param, Query } from "@nestjs/common";
import { ResponseUtil } from "@libs/common";

@Controller("resources")
export class ResourcesController {
  @Get()
  async findAll(@Query("page") page?: number, @Query("limit") limit?: number) {
    const { resources, total } = await this.service.findAll(page, limit);
    return ResponseUtil.paginated(
      resources,
      total,
      page || 1,
      limit || 20,
      "Resources retrieved successfully"
    );
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    const resource = await this.service.findById(id);
    if (!resource) {
      return ResponseUtil.notFound("Resource");
    }
    return ResponseUtil.success(resource, "Resource found");
  }

  @Post()
  async create(@Body() dto: CreateResourceDto) {
    try {
      const resource = await this.service.create(dto);
      return ResponseUtil.success(resource, "Resource created successfully");
    } catch (error) {
      if (error.name === "ValidationError") {
        return ResponseUtil.validationError(error.errors);
      }
      throw error;
    }
  }
}
```

### WebSocket Gateway

```typescript
import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "socket.io";
import { ResponseUtil } from "@libs/common";

@WebSocketGateway()
export class NotificationsGateway {
  @WebSocketServer()
  server: Server;

  sendNotification(userId: string, notification: Notification) {
    const response = ResponseUtil.websocket(
      notification,
      "New notification",
      "/ws/notifications"
    );

    this.server.to(userId).emit("notification:created", response);
  }
}
```

### Event Publisher

```typescript
import { Injectable } from "@nestjs/common";
import { EventBus } from "@libs/event-bus";
import { ResponseUtil } from "@libs/common";

@Injectable()
export class ResourceEventPublisher {
  constructor(private eventBus: EventBus) {}

  async publishResourceCreated(resource: Resource) {
    const eventData = ResponseUtil.event(
      { resourceId: resource.id, name: resource.name },
      "RESOURCE_CREATED",
      "resources-service",
      "Resource created event"
    );

    await this.eventBus.publish("resources.created", eventData);
  }
}
```

## TransformInterceptor

El `TransformInterceptor` se aplica automáticamente en todos los controllers y:

- ✅ Detecta respuestas que ya están en formato `ApiResponseBookly`
- ✅ Agrega contexto HTTP automáticamente (path, method, statusCode)
- ✅ Transforma respuestas simples al formato estándar
- ✅ Agrega timestamp si no existe

```typescript
@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}
```

## Migración desde formato antiguo

### Antes (ApiResponse con ApiError[])

```typescript
// ❌ Formato antiguo
return {
  success: false,
  message: "Validation failed",
  errors: [
    { code: "INVALID_NAME", message: "Name is required", field: "name" },
    {
      code: "INVALID_CAPACITY",
      message: "Invalid capacity",
      field: "capacity",
    },
  ],
  timestamp: new Date(),
};
```

### Después (ApiResponseBookly con Record<string, string[]>)

```typescript
// ✅ Formato nuevo
return ResponseUtil.validationError({
  name: ["Name is required"],
  capacity: ["Invalid capacity"],
});
```

## Beneficios del Estándar Unificado

1. **Consistencia Total** - Mismo formato en HTTP, WebSocket, Events y RPC
2. **Type Safety** - TypeScript tipado completo en toda la aplicación
3. **Frontend Predictible** - El frontend siempre sabe qué esperar
4. **Debugging Mejorado** - Context completo para troubleshooting
5. **Errores Granulares** - Validaciones específicas por campo
6. **Paginación Estándar** - Meta información consistente
7. **Event Sourcing Ready** - Soporte nativo para correlationId
8. **WebSocket Compatible** - Formato optimizado para real-time
9. **Backward Compatible** - Mantiene compatibilidad con código legacy

## Compatibilidad con bookly-backend

Este estándar es **100% compatible** con el `ApiResponseBookly` de bookly-backend, permitiendo:

- ✅ Reutilización de DTOs entre proyectos
- ✅ Consistencia en respuestas de microservicios
- ✅ Integración transparente entre servicios
- ✅ Documentación Swagger unificada

## Notas Importantes

- **timestamp** siempre en formato ISO 8601 string
- **errors** siempre como `Record<string, string[]>` para errores de validación
- **context** es opcional y se usa para información adicional según el protocolo
- Las funciones legacy (`createSuccessResponse`, etc.) están disponibles pero deprecated
