# Guía de Migración - Estándar de Respuesta Unificado

## Resumen de Cambios

Se ha consolidado el estándar de respuestas de Bookly para unificar todos los formatos (HTTP, WebSocket, Events, RPC) bajo una única interface: `ApiResponseBookly<T>`.

## Cambios Principales

### 1. Nueva Interface Principal: `ApiResponseBookly<T>`

**Antes:**

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: PaginationMeta;
  errors?: ApiError[]; // ❌ Array de objetos
  timestamp: Date; // ❌ Date object
}
```

**Ahora:**

```typescript
interface ApiResponseBookly<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>; // ✅ Errores granulares por campo
  meta?: PaginationMeta | AdvancedSearchPaginationMeta;
  timestamp?: string; // ✅ ISO 8601 string
  path?: string;
  method?: string;
  statusCode?: number;
  context?: ResponseContext; // ✅ Context para múltiples protocolos
}
```

### 2. Nueva Clase Utility: `ResponseUtil`

**Antes:**

```typescript
// Funciones individuales
import { createSuccessResponse, createErrorResponse } from "@libs/common";

const response = createSuccessResponse(data, "Success");
```

**Ahora:**

```typescript
// Clase unificada con métodos especializados
import { ResponseUtil } from "@libs/common";

// HTTP
const response = ResponseUtil.success(data, "Success");

// WebSocket
const wsResponse = ResponseUtil.websocket(data, "Notification sent");

// Event
const eventResponse = ResponseUtil.event(
  data,
  "RESOURCE_CREATED",
  "resources-service"
);

// RPC
const rpcResponse = ResponseUtil.rpc(data, "correlation-123");
```

### 3. Formato de Errores Mejorado

**Antes:**

```typescript
errors: [
  { code: "INVALID_NAME", message: "Name is required", field: "name" },
  { code: "INVALID_EMAIL", message: "Email is invalid", field: "email" },
];
```

**Ahora:**

```typescript
errors: {
  name: ['Name is required', 'Name must be at least 3 characters'],
  email: ['Email is invalid', 'Email is already in use']
}
```

## Pasos de Migración

### Paso 1: Actualizar Imports

```typescript
// ❌ Antiguo
import { ApiResponse, createSuccessResponse } from "@libs/common";

// ✅ Nuevo
import { ApiResponseBookly, ResponseUtil } from "@libs/common";

// ⚠️ Si necesitas compatibilidad temporal, ambos están disponibles
import { ApiResponse, ApiResponseBookly, ResponseUtil } from "@libs/common";
```

### Paso 2: Actualizar Controllers HTTP

**Antes:**

```typescript
@Get()
async findAll() {
  const resources = await this.service.findAll();
  return createSuccessResponse(resources, 'Resources found');
}
```

**Después:**

```typescript
@Get()
async findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
  const { items, total } = await this.service.findAll(page, limit);
  return ResponseUtil.paginated(items, total, page, limit, 'Resources retrieved');
}
```

### Paso 3: Actualizar Manejo de Errores

**Antes:**

```typescript
return createErrorResponse("Validation failed", "VALIDATION_ERROR", [
  { code: "INVALID_NAME", message: "Name is required", field: "name" },
]);
```

**Después:**

```typescript
return ResponseUtil.validationError({
  name: ["Name is required"],
});
```

### Paso 4: Actualizar WebSocket Gateways

**Antes:**

```typescript
@WebSocketGateway()
export class NotificationsGateway {
  sendNotification(data: any) {
    this.server.emit("notification", { success: true, data });
  }
}
```

**Después:**

```typescript
@WebSocketGateway()
export class NotificationsGateway {
  sendNotification(data: any) {
    const response = ResponseUtil.websocket(data, "Notification sent");
    this.server.emit("notification", response);
  }
}
```

### Paso 5: Actualizar Event Publishers

**Antes:**

```typescript
await this.eventBus.publish("resource.created", {
  eventId: uuid(),
  eventType: "RESOURCE_CREATED",
  timestamp: new Date(),
  service: "resources-service",
  data: resource,
});
```

**Después:**

```typescript
const eventResponse = ResponseUtil.event(
  resource,
  "RESOURCE_CREATED",
  "resources-service",
  "Resource created successfully",
  correlationId
);

await this.eventBus.publish("resource.created", eventResponse);
```

## Métodos Disponibles en ResponseUtil

### Métodos Generales

- `ResponseUtil.success<T>(data, message?, meta?, context?)` - Respuesta exitosa
- `ResponseUtil.error(message, errors?, data?, context?)` - Respuesta de error
- `ResponseUtil.validationError(errors, message?, context?)` - Error de validación
- `ResponseUtil.notFound(resource?, message?, context?)` - 404 Not Found
- `ResponseUtil.unauthorized(message?, context?)` - 401 Unauthorized
- `ResponseUtil.forbidden(message?, context?)` - 403 Forbidden

### Métodos de Paginación

- `ResponseUtil.paginated<T>(data, total, page, limit, message?, context?)` - Respuesta paginada
- `ResponseUtil.advancedSearchPaginated<T>(data, pagination, startTime, filters, message?, context?)` - Búsqueda avanzada
- `ResponseUtil.list<T>(items, message?)` - Lista simple

### Métodos Especializados por Protocolo

- `ResponseUtil.http<T>(data, statusCode, path?, method?, message?)` - HTTP explícito
- `ResponseUtil.websocket<T>(data, message?, path?)` - WebSocket
- `ResponseUtil.event<T>(data, eventType, service, message?, correlationId?)` - Events
- `ResponseUtil.rpc<T>(data, correlationId, message?)` - RPC

### Métodos de Transformación

- `ResponseUtil.fromServiceResponse<T>(serviceResponse)` - Transforma respuesta de servicio

## Compatibilidad hacia Atrás

Las siguientes funciones y tipos están **deprecated pero disponibles**:

```typescript
// ⚠️ Deprecated - Usar ResponseUtil.success()
export const createSuccessResponse = <T>(data: T, message?: string) =>
  ResponseUtil.success(data, message);

// ⚠️ Deprecated - Usar ResponseUtil.error()
export const createErrorResponse = (message: string, code?: string) =>
  ResponseUtil.error(message, code ? { [code]: [message] } : undefined);

// ⚠️ Deprecated - Usar ResponseUtil.validationError()
export const createValidationErrorResponse = (
  errors: Record<string, string[]>
) => ResponseUtil.validationError(errors);

// ⚠️ Deprecated - Usar ApiResponseBookly<T>
export interface ApiResponse<T = any> {
  // ... mismo formato pero con timestamp como Date | string
}

// ⚠️ Deprecated - Usar Record<string, string[]>
export interface ApiError {
  code: string;
  message: string;
  field?: string;
  type?: string;
}
```

## Ventajas del Nuevo Estándar

1. ✅ **Unificado** - Un solo formato para HTTP, WebSocket, Events y RPC
2. ✅ **Type-Safe** - TypeScript completo en toda la aplicación
3. ✅ **Granular** - Errores específicos por campo con múltiples mensajes
4. ✅ **Contextual** - Metadata específica según el protocolo
5. ✅ **Compatible** - 100% compatible con bookly-backend
6. ✅ **Estándar** - Basado en el estándar de bookly-backend
7. ✅ **Documentado** - Documentación completa con ejemplos
8. ✅ **Backward Compatible** - No rompe código existente

## Checklist de Migración

- [ ] Actualizar imports de `ApiResponse` a `ApiResponseBookly`
- [ ] Reemplazar `createSuccessResponse` por `ResponseUtil.success()`
- [ ] Reemplazar `createErrorResponse` por `ResponseUtil.error()`
- [ ] Actualizar formato de errores de `ApiError[]` a `Record<string, string[]>`
- [ ] Actualizar controllers HTTP para usar métodos de ResponseUtil
- [ ] Actualizar WebSocket gateways para usar `ResponseUtil.websocket()`
- [ ] Actualizar event publishers para usar `ResponseUtil.event()`
- [ ] Actualizar RPC handlers para usar `ResponseUtil.rpc()`
- [ ] Actualizar tests para usar nuevo formato
- [ ] Revisar documentación de API
- [ ] Actualizar ejemplos en README

## Soporte

Para cualquier duda sobre la migración, consulta:

- `docs/API_RESPONSE_STANDARD.md` - Documentación completa del estándar
- `libs/common/src/utils/response.util.ts` - Implementación de ResponseUtil
- `libs/common/src/interfaces/index.ts` - Definición de interfaces

## Timeline Recomendado

1. **Fase 1 (Inmediata)** - Nuevos desarrollos usan `ResponseUtil`
2. **Fase 2 (1-2 semanas)** - Migrar controllers críticos
3. **Fase 3 (1 mes)** - Migrar todos los endpoints HTTP
4. **Fase 4 (2 meses)** - Migrar WebSocket y Events
5. **Fase 5 (3 meses)** - Deprecar completamente funciones legacy

## Ejemplos Completos

### Ejemplo 1: Controller CRUD Completo

```typescript
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from "@nestjs/common";
import { ResponseUtil } from "@libs/common";

@Controller("resources")
export class ResourcesController {
  @Get()
  async findAll(@Query("page") page = 1, @Query("limit") limit = 20) {
    const { items, total } = await this.service.findAll(page, limit);
    return ResponseUtil.paginated(items, total, page, limit);
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    const resource = await this.service.findById(id);
    if (!resource) {
      return ResponseUtil.notFound("Resource");
    }
    return ResponseUtil.success(resource);
  }

  @Post()
  async create(@Body() dto: CreateResourceDto) {
    const resource = await this.service.create(dto);
    return ResponseUtil.success(resource, "Resource created");
  }

  @Put(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateResourceDto) {
    const resource = await this.service.update(id, dto);
    return ResponseUtil.success(resource, "Resource updated");
  }

  @Delete(":id")
  async delete(@Param("id") id: string) {
    await this.service.delete(id);
    return ResponseUtil.success(null, "Resource deleted");
  }
}
```

### Ejemplo 2: Error Handling

```typescript
@Post()
async create(@Body() dto: CreateResourceDto) {
  try {
    const resource = await this.service.create(dto);
    return ResponseUtil.success(resource, 'Resource created');
  } catch (error) {
    if (error.name === 'ValidationError') {
      return ResponseUtil.validationError(error.errors);
    }
    if (error.name === 'UnauthorizedError') {
      return ResponseUtil.unauthorized(error.message);
    }
    if (error.name === 'ForbiddenError') {
      return ResponseUtil.forbidden(error.message);
    }
    throw error; // Let exception filter handle it
  }
}
```

### Ejemplo 3: WebSocket + Events

```typescript
@WebSocketGateway()
export class ReservationsGateway implements OnGatewayInit {
  constructor(
    private eventBus: EventBus,
    private server: Server
  ) {}

  async onReservationCreated(reservation: Reservation) {
    // Publish event
    const eventResponse = ResponseUtil.event(
      reservation,
      "RESERVATION_CREATED",
      "availability-service",
      "Reservation created",
      `evt-${reservation.id}`
    );
    await this.eventBus.publish("reservations.created", eventResponse);

    // Send WebSocket notification
    const wsResponse = ResponseUtil.websocket(
      { reservation },
      "New reservation created"
    );
    this.server.to(reservation.userId).emit("reservation:created", wsResponse);
  }
}
```
