# ResponseUtil - Ejemplos de Uso

Ejemplos prácticos de cómo usar `ResponseUtil` en diferentes contextos de Bookly.

## 📋 Tabla de Contenidos

1. [HTTP REST Controllers](#http-rest-controllers)
2. [WebSocket Gateways](#websocket-gateways)
3. [Event Publishers (EDA)](#event-publishers-eda)
4. [RPC Handlers](#rpc-handlers)
5. [Error Handling](#error-handling)
6. [Paginación](#paginación)

---

## HTTP REST Controllers

### Respuesta Simple

```typescript
import { Controller, Get, Param } from "@nestjs/common";
import { ResponseUtil } from "@libs/common";

@Controller("resources")
export class ResourcesController {
  @Get(":id")
  async findOne(@Param("id") id: string) {
    const resource = await this.service.findById(id);

    if (!resource) {
      return ResponseUtil.notFound("Resource");
    }

    return ResponseUtil.success(resource, "Resource retrieved successfully");
  }
}
```

**Respuesta HTTP:**

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

### Respuesta Paginada

```typescript
@Get()
async findAll(
  @Query('page') page = 1,
  @Query('limit') limit = 20
) {
  const { items, total } = await this.service.findAll(page, limit);

  return ResponseUtil.paginated(
    items,
    total,
    page,
    limit,
    'Resources retrieved successfully'
  );
}
```

**Respuesta HTTP:**

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

### Búsqueda Avanzada

```typescript
@Post('advanced-search')
async advancedSearch(@Body() filters: SearchFiltersDto) {
  const startTime = Date.now();
  const { items, pagination } = await this.service.advancedSearch(filters);

  return ResponseUtil.advancedSearchPaginated(
    items,
    pagination,
    startTime,
    filters,
    'Search completed successfully'
  );
}
```

**Respuesta HTTP:**

```json
{
  "success": true,
  "data": [...],
  "message": "Search completed successfully",
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3
    },
    "executionTimeMs": 127,
    "timestamp": "2025-01-01T12:00:00.000Z",
    "filters": {
      "capacity": { "min": 20 },
      "type": "CLASSROOM"
    }
  },
  "timestamp": "2025-01-01T12:00:00.000Z"
}
```

---

## WebSocket Gateways

### Enviar Notificación

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
      "New notification received",
      "/ws/notifications"
    );

    // Enviar a usuario específico
    this.server.to(userId).emit("notification:created", response);
  }

  broadcastUpdate(data: any) {
    const response = ResponseUtil.websocket(
      data,
      "System update",
      "/ws/updates"
    );

    // Broadcast a todos
    this.server.emit("system:update", response);
  }
}
```

**Mensaje WebSocket enviado:**

```json
{
  "success": true,
  "data": {
    "id": "notif-123",
    "type": "reservation_confirmed",
    "title": "Reservation Confirmed",
    "message": "Your reservation has been confirmed"
  },
  "message": "New notification received",
  "timestamp": "2025-01-01T12:00:00.000Z",
  "context": {
    "type": "websocket",
    "timestamp": "2025-01-01T12:00:00.000Z",
    "path": "/ws/notifications"
  }
}
```

### Respuesta a Evento del Cliente

```typescript
@SubscribeMessage('notifications:read')
async handleMarkAsRead(
  @MessageBody() data: { notificationId: string },
  @ConnectedSocket() client: Socket
) {
  try {
    await this.service.markAsRead(data.notificationId);

    return ResponseUtil.websocket(
      { notificationId: data.notificationId, read: true },
      'Notification marked as read'
    );
  } catch (error) {
    return ResponseUtil.websocket(
      null,
      error.message
    );
  }
}
```

---

## Event Publishers (EDA)

### Publicar Evento de Dominio

```typescript
import { Injectable } from "@nestjs/common";
import { EventBus } from "@libs/event-bus";
import { ResponseUtil } from "@libs/common";

@Injectable()
export class ResourceEventPublisher {
  constructor(private eventBus: EventBus) {}

  async publishResourceCreated(resource: Resource) {
    const eventData = ResponseUtil.event(
      {
        resourceId: resource.id,
        name: resource.name,
        type: resource.type,
        createdBy: resource.createdBy,
      },
      "RESOURCE_CREATED",
      "resources-service",
      "Resource created successfully"
    );

    await this.eventBus.publish("resources.created", eventData);
  }

  async publishResourceUpdated(resource: Resource, changes: any) {
    const eventData = ResponseUtil.event(
      {
        resourceId: resource.id,
        changes,
        updatedBy: resource.updatedBy,
        updatedAt: resource.updatedAt,
      },
      "RESOURCE_UPDATED",
      "resources-service",
      "Resource updated successfully"
    );

    await this.eventBus.publish("resources.updated", eventData);
  }
}
```

**Mensaje publicado al Event Bus:**

```json
{
  "success": true,
  "data": {
    "resourceId": "123",
    "name": "Sala A-101",
    "type": "CLASSROOM",
    "createdBy": "user-456"
  },
  "message": "Resource created successfully",
  "timestamp": "2025-01-01T12:00:00.000Z",
  "context": {
    "type": "event",
    "timestamp": "2025-01-01T12:00:00.000Z",
    "eventType": "RESOURCE_CREATED",
    "service": "resources-service"
  }
}
```

### Evento con Correlation ID

```typescript
async publishReservationApproved(
  reservation: Reservation,
  correlationId: string
) {
  const eventData = ResponseUtil.event(
    {
      reservationId: reservation.id,
      resourceId: reservation.resourceId,
      userId: reservation.userId,
      approvedBy: reservation.approvedBy,
      approvedAt: new Date()
    },
    'RESERVATION_APPROVED',
    'stockpile-service',
    'Reservation approved',
    correlationId  // Para rastrear el flujo completo
  );

  await this.eventBus.publish('reservations.approved', eventData);
}
```

---

## RPC Handlers

### Request-Reply Pattern

```typescript
import { EventPattern } from "@nestjs/microservices";
import { ResponseUtil } from "@libs/common";

@Injectable()
export class ResourceRpcHandler {
  @EventPattern("resources.query.getById")
  async handleGetResourceById(request: {
    resourceId: string;
    correlationId: string;
  }) {
    const resource = await this.service.findById(request.resourceId);

    if (!resource) {
      return ResponseUtil.rpc(
        null,
        request.correlationId,
        "Resource not found"
      );
    }

    return ResponseUtil.rpc(
      resource,
      request.correlationId,
      "Resource retrieved successfully"
    );
  }

  @EventPattern("resources.query.checkAvailability")
  async handleCheckAvailability(request: {
    resourceId: string;
    startDate: Date;
    endDate: Date;
    correlationId: string;
  }) {
    const available = await this.service.checkAvailability(
      request.resourceId,
      request.startDate,
      request.endDate
    );

    return ResponseUtil.rpc(
      { available, resourceId: request.resourceId },
      request.correlationId,
      available ? "Resource is available" : "Resource is not available"
    );
  }
}
```

**Respuesta RPC:**

```json
{
  "success": true,
  "data": {
    "available": true,
    "resourceId": "123"
  },
  "message": "Resource is available",
  "timestamp": "2025-01-01T12:00:00.000Z",
  "context": {
    "type": "rpc",
    "timestamp": "2025-01-01T12:00:00.000Z",
    "correlationId": "rpc-abc-123"
  }
}
```

---

## Error Handling

### Errores de Validación

```typescript
@Post()
async create(@Body() dto: CreateResourceDto) {
  try {
    const resource = await this.service.create(dto);
    return ResponseUtil.success(resource, 'Resource created successfully');
  } catch (error) {
    if (error.name === 'ValidationError') {
      return ResponseUtil.validationError({
        name: ['Name is required', 'Name must be at least 3 characters'],
        capacity: ['Capacity must be greater than 0']
      });
    }
    throw error;
  }
}
```

**Respuesta de Error:**

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

### Errores HTTP Comunes

```typescript
// 404 Not Found
if (!resource) {
  return ResponseUtil.notFound('Resource');
}

// 401 Unauthorized
if (!isAuthenticated) {
  return ResponseUtil.unauthorized('Authentication required');
}

// 403 Forbidden
if (!hasPermission) {
  return ResponseUtil.forbidden('Insufficient permissions');
}

// Error genérico
catch (error) {
  return ResponseUtil.error(
    'Internal server error',
    { server: [error.message] }
  );
}
```

---

## Paginación

### Respuesta con Lista Simple

```typescript
@Get('categories')
async getCategories() {
  const categories = await this.service.getAllCategories();

  return ResponseUtil.list(
    categories,
    'Categories retrieved successfully'
  );
}
```

### Respuesta con Servicio

```typescript
@Get()
async findAll(@Query() query: PaginationDto) {
  const serviceResponse = await this.service.findAll(query);

  // Automáticamente detecta paginación
  return ResponseUtil.fromServiceResponse(serviceResponse);
}

// En el servicio:
async findAll(query: PaginationDto) {
  const items = await this.repository.find(query);
  const total = await this.repository.count();

  return {
    items,
    total,
    page: query.page,
    limit: query.limit,
    message: 'Items retrieved successfully'
  };
}
```

---

## Casos de Uso Especiales

### Respuesta con Context HTTP Explícito

```typescript
@Get(':id')
async findOne(@Param('id') id: string, @Req() req: Request) {
  const resource = await this.service.findById(id);

  return ResponseUtil.http(
    resource,
    200,
    req.url,
    req.method,
    'Resource retrieved'
  );
}
```

### Transformar Respuesta de Múltiples Servicios

```typescript
@Get('dashboard')
async getDashboard() {
  const [resources, reservations, stats] = await Promise.all([
    this.resourceService.findAll(),
    this.reservationService.findRecent(),
    this.statsService.getOverview()
  ]);

  return ResponseUtil.success(
    {
      resources: resources.items,
      reservations: reservations.items,
      stats
    },
    'Dashboard data retrieved'
  );
}
```

---

## Mejores Prácticas

### ✅ DO

```typescript
// Usar ResponseUtil para consistencia
return ResponseUtil.success(data, message);

// Agregar mensajes descriptivos
return ResponseUtil.notFound(
  "Resource",
  "The requested resource does not exist"
);

// Usar métodos específicos por protocolo
return ResponseUtil.event(data, "EVENT_TYPE", "service-name");
```

### ❌ DON'T

```typescript
// NO devolver objetos planos sin ResponseUtil
return { success: true, data }; // ❌

// NO usar funciones legacy
return createSuccessResponse(data); // ❌ Deprecated

// NO mezclar formatos
return { ...ResponseUtil.success(data), customField: "value" }; // ❌
```

---

## Notas Finales

- Todos los métodos de `ResponseUtil` son **type-safe** con TypeScript
- El `TransformInterceptor` agrega automáticamente context HTTP
- Los errores de validación deben usar `Record<string, string[]>`
- Para WebSocket y Events, usa los métodos especializados `.websocket()` y `.event()`
- Siempre incluye mensajes descriptivos para mejor debugging
