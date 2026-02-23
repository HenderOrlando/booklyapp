# 02 - Estándares de Respuesta API

## 📋 Objetivo
Garantizar que todas las respuestas de API sigan el estándar `ApiResponseBookly<T>` unificado para HTTP, WebSocket, Events y RPC.

---

## ✅ Estado Actual en bookly-mock

### ✓ Implementado Correctamente

1. **ResponseUtil en libs/common**
   - ✅ Clase `ResponseUtil` con métodos estándar
   - ✅ Interface `ApiResponseBookly<T>`
   - ✅ Soporte para HTTP, WebSocket, Events, RPC
   - ✅ Métodos de paginación
   - ✅ Métodos de error granular

2. **TransformInterceptor**
   - ✅ Interceptor global en todos los servicios
   - ✅ Agrega contexto HTTP automáticamente
   - ✅ Detecta respuestas ya formateadas

3. **Documentación**
   - ✅ `docs/API_RESPONSE_STANDARD.md` completo
   - ✅ Ejemplos de uso por protocolo

---

## 🎯 Tareas por Completar

### Tarea 2.1: Auditar Todos los Controllers

**Objetivo**: Verificar que todos los controllers usen `ResponseUtil`.

**Patrón correcto**:
```typescript
import { ResponseUtil } from '@libs/common';

@Controller('resources')
export class ResourcesController {
  @Get()
  async findAll(@Query() query: PaginationDto) {
    const { data, total } = await this.service.findAll(query);
    return ResponseUtil.paginated(
      data,
      total,
      query.page,
      query.limit,
      'Resources retrieved successfully'
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const resource = await this.service.findById(id);
    if (!resource) {
      return ResponseUtil.notFound('Resource');
    }
    return ResponseUtil.success(resource, 'Resource found');
  }

  @Post()
  async create(@Body() dto: CreateResourceDto) {
    const resource = await this.service.create(dto);
    return ResponseUtil.success(resource, 'Resource created', 201);
  }
}
```

**Patrones incorrectos a corregir**:
```typescript
// ❌ Retorno directo sin ResponseUtil
return resource;

// ❌ Formato manual
return {
  success: true,
  data: resource,
  message: 'OK'
};

// ❌ Throw de excepciones sin manejo
if (!resource) throw new NotFoundException();
```

**Acción**: Revisar controllers en:
- `apps/auth-service/src/infrastructure/controllers/`
- `apps/resources-service/src/infrastructure/controllers/`
- `apps/availability-service/src/infrastructure/controllers/`
- `apps/stockpile-service/src/infrastructure/controllers/`
- `apps/reports-service/src/infrastructure/controllers/`

---

### Tarea 2.2: Estandarizar Manejo de Errores

**Objetivo**: Usar métodos específicos de `ResponseUtil` para cada tipo de error.

**Tipos de error estándar**:

```typescript
// 400 - Validación
return ResponseUtil.validationError({
  name: ['Name is required', 'Name must be at least 3 characters'],
  email: ['Invalid email format']
});

// 401 - No autenticado
return ResponseUtil.unauthorized('Invalid credentials');

// 403 - Sin permisos
return ResponseUtil.forbidden('Insufficient permissions');

// 404 - No encontrado
return ResponseUtil.notFound('Resource');

// 409 - Conflicto
return ResponseUtil.error('Resource already exists', null, null, 409);

// 500 - Error interno
return ResponseUtil.error('Internal server error', null, null, 500);
```

**Acción**: 
1. Revisar todos los `try-catch` blocks
2. Reemplazar `throw new HttpException()` por `return ResponseUtil.error()`
3. Usar métodos específicos según el código de error

---

### Tarea 2.3: Implementar Respuestas de Eventos

**Objetivo**: Estandarizar eventos publicados con `ResponseUtil.event()`.

**Patrón correcto**:
```typescript
import { ResponseUtil } from '@libs/common';
import { EventBus } from '@libs/event-bus';

@Injectable()
export class ResourceService {
  constructor(private eventBus: EventBus) {}

  async create(dto: CreateResourceDto) {
    const resource = await this.repository.save(dto);
    
    // Publicar evento estandarizado
    const eventData = ResponseUtil.event(
      { resourceId: resource.id, name: resource.name },
      'RESOURCE_CREATED',
      'resources-service',
      'Resource created successfully',
      `evt-${Date.now()}`
    );
    
    await this.eventBus.publish('resources.created', eventData);
    
    return resource;
  }
}
```

**Acción**: Revisar todos los `eventBus.publish()` en:
- `apps/auth-service/src/application/services/`
- `apps/resources-service/src/application/services/`
- `apps/availability-service/src/application/services/`
- `apps/stockpile-service/src/application/services/`
- `apps/reports-service/src/application/services/`

---

### Tarea 2.4: Implementar Respuestas WebSocket

**Objetivo**: Estandarizar notificaciones WebSocket con `ResponseUtil.websocket()`.

**Patrón correcto**:
```typescript
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { ResponseUtil } from '@libs/common';

@WebSocketGateway()
export class NotificationsGateway {
  @WebSocketServer()
  server: Server;

  sendNotification(userId: string, notification: any) {
    const response = ResponseUtil.websocket(
      notification,
      'New notification received',
      '/ws/notifications'
    );
    
    this.server.to(userId).emit('notification:created', response);
  }
}
```

**Acción**: 
1. Identificar todos los WebSocket gateways
2. Estandarizar emisiones con `ResponseUtil.websocket()`
3. Documentar eventos WebSocket en cada servicio

---

### Tarea 2.5: Validar Paginación Estándar

**Objetivo**: Todas las listas paginadas deben usar `ResponseUtil.paginated()`.

**Patrón correcto**:
```typescript
@Get()
async findAll(
  @Query('page') page: number = 1,
  @Query('limit') limit: number = 20
) {
  const { data, total } = await this.service.findAll(page, limit);
  
  return ResponseUtil.paginated(
    data,
    total,
    page,
    limit,
    'Resources retrieved successfully'
  );
}
```

**Estructura de respuesta esperada**:
```json
{
  "success": true,
  "data": [...],
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

**Acción**: Revisar todos los endpoints con `@Get()` que retornan arrays.

---

### Tarea 2.6: Documentar Swagger con Respuestas Estándar

**Objetivo**: Todos los endpoints deben tener decoradores Swagger con el formato estándar.

**Patrón correcto**:
```typescript
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiOperation({ summary: 'Get all resources' })
@ApiResponse({
  status: 200,
  description: 'Resources retrieved successfully',
  schema: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      data: { type: 'array', items: { $ref: '#/components/schemas/Resource' } },
      message: { type: 'string', example: 'Resources retrieved successfully' },
      meta: {
        type: 'object',
        properties: {
          page: { type: 'number', example: 1 },
          limit: { type: 'number', example: 20 },
          total: { type: 'number', example: 100 },
          totalPages: { type: 'number', example: 5 }
        }
      }
    }
  }
})
@Get()
async findAll() { ... }
```

**Acción**: 
1. Agregar decoradores Swagger a todos los endpoints
2. Usar el formato `ApiResponseBookly<T>` en schemas
3. Verificar en Swagger UI que las respuestas se muestren correctamente

---

### Tarea 2.7: Crear DTOs de Respuesta Tipados

**Objetivo**: Crear DTOs específicos para respuestas complejas.

**Ejemplo**:
```typescript
// libs/common/src/dtos/responses/resource-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class ResourceResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  capacity: number;

  @ApiProperty()
  status: string;
}

export class ResourceListResponseDto {
  @ApiProperty({ type: [ResourceResponseDto] })
  data: ResourceResponseDto[];

  @ApiProperty()
  meta: PaginationMetaDto;
}
```

**Acción**: Crear DTOs de respuesta para:
- Recursos
- Reservas
- Usuarios
- Roles y permisos
- Reportes

---

## 📊 Métricas de Cumplimiento

| Aspecto | Estado | Prioridad |
|---------|--------|-----------|
| Controllers con ResponseUtil | 75% | Alta |
| Manejo de errores estandarizado | 60% | Alta |
| Eventos con ResponseUtil.event() | 40% | Media |
| WebSocket con ResponseUtil.websocket() | 30% | Media |
| Paginación estándar | 80% | Alta |
| Documentación Swagger | 50% | Media |
| DTOs de respuesta tipados | 40% | Baja |

---

## 🔗 Referencias

- `docs/API_RESPONSE_STANDARD.md` - Documentación completa del estándar
- `libs/common/src/utils/response.util.ts` - Implementación de ResponseUtil
- `libs/interceptors/src/transform.interceptor.ts` - Interceptor de transformación

---

**Última actualización**: 30 de noviembre de 2024  
**Responsable**: Equipo Bookly  
**Siguiente revisión**: Tarea 2.1
