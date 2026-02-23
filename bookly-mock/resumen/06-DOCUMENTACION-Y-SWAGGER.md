# 06 - Documentación y Swagger/AsyncAPI

## 📋 Objetivo

Garantizar documentación completa de APIs REST (Swagger) y eventos (AsyncAPI) en todos los microservicios.

---

## ✅ Estado Actual en bookly-mock

### ✓ Implementado Correctamente

1. **Swagger Configurado**
   - ✅ Swagger en cada microservicio
   - ✅ API Gateway con documentación agregada
   - ✅ Decoradores `@ApiOperation`, `@ApiResponse`

2. **Documentación Markdown**
   - ✅ README.md en cada servicio
   - ✅ Índices de documentación (INDEX.md)
   - ✅ Documentación de requerimientos

---

## 🎯 Tareas por Completar

### Tarea 6.1: Completar Decoradores Swagger en Controllers

**Objetivo**: Todos los endpoints deben tener documentación Swagger completa.

**Patrón correcto**:

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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ResponseUtil } from '@libs/common';

@ApiTags('Resources')
@ApiBearerAuth()
@Controller('resources')
export class ResourcesController {
  @ApiOperation({
    summary: 'Get all resources',
    description: 'Retrieve a paginated list of all resources',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: 'Resources retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/Resource' },
        },
        message: { type: 'string', example: 'Resources retrieved successfully' },
        meta: {
          type: 'object',
          properties: {
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 20 },
            total: { type: 'number', example: 100 },
            totalPages: { type: 'number', example: 5 },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @Get()
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const { data, total } = await this.service.findAll(page, limit);
    return ResponseUtil.paginated(data, total, page || 1, limit || 20);
  }

  @ApiOperation({
    summary: 'Get resource by ID',
    description: 'Retrieve a single resource by its ID',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Resource ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Resource found',
    type: ResourceResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Resource not found',
  })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const resource = await this.service.findById(id);
    if (!resource) {
      return ResponseUtil.notFound('Resource');
    }
    return ResponseUtil.success(resource);
  }

  @ApiOperation({
    summary: 'Create a new resource',
    description: 'Create a new resource with the provided data',
  })
  @ApiBody({
    type: CreateResourceDto,
    description: 'Resource data',
  })
  @ApiResponse({
    status: 201,
    description: 'Resource created successfully',
    type: ResourceResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  @Post()
  async create(@Body() dto: CreateResourceDto) {
    const resource = await this.service.create(dto);
    return ResponseUtil.success(resource, 'Resource created', 201);
  }
}
```

**Acción**: Revisar y completar decoradores en:
- `apps/auth-service/src/infrastructure/controllers/`
- `apps/resources-service/src/infrastructure/controllers/`
- `apps/availability-service/src/infrastructure/controllers/`
- `apps/stockpile-service/src/infrastructure/controllers/`
- `apps/reports-service/src/infrastructure/controllers/`

---

### Tarea 6.2: Crear DTOs con Decoradores Swagger

**Objetivo**: Todos los DTOs deben tener validación y documentación.

**Patrón correcto**:

```typescript
// apps/resources-service/src/infrastructure/dto/create-resource.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsNotEmpty,
  IsOptional,
  Min,
  Max,
  IsArray,
  IsMongoId,
} from 'class-validator';

export class CreateResourceDto {
  @ApiProperty({
    description: 'Resource name',
    example: 'Sala A-101',
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Resource capacity',
    example: 30,
    minimum: 1,
    maximum: 500,
  })
  @IsNumber()
  @Min(1)
  @Max(500)
  capacity: number;

  @ApiProperty({
    description: 'Resource location',
    example: 'Building A, Floor 1',
  })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiPropertyOptional({
    description: 'Resource description',
    example: 'Classroom with projector and whiteboard',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Category IDs',
    type: [String],
    example: ['507f1f77bcf86cd799439011'],
  })
  @IsArray()
  @IsMongoId({ each: true })
  categoryIds: string[];

  @ApiProperty({
    description: 'Academic program ID',
    example: '507f1f77bcf86cd799439012',
  })
  @IsMongoId()
  programId: string;

  @ApiPropertyOptional({
    description: 'Technical attributes (flexible JSON)',
    example: {
      hasProjector: true,
      hasAirConditioning: true,
      hasWhiteboard: true,
    },
  })
  @IsOptional()
  technicalAttributes?: Record<string, any>;
}
```

**Acción**: Crear/actualizar DTOs en todos los servicios con:
- Decoradores de validación (`class-validator`)
- Decoradores de Swagger (`@ApiProperty`)
- Ejemplos claros
- Descripciones detalladas

---

### Tarea 6.3: Implementar AsyncAPI para Eventos

**Objetivo**: Documentar todos los eventos publicados y consumidos.

**Estructura AsyncAPI**:

```yaml
# apps/resources-service/asyncapi.yml
asyncapi: '2.6.0'
info:
  title: Resources Service Events
  version: '1.0.0'
  description: |
    Events published and consumed by the Resources Service.
    This service manages physical resources like rooms, equipment, and laboratories.
  contact:
    name: Bookly Team
    email: support@bookly.ufps.edu.co

servers:
  production:
    url: kafka://kafka:9092
    protocol: kafka
    description: Production Kafka broker

channels:
  resources.created:
    description: Published when a new resource is created
    publish:
      summary: Resource Created Event
      operationId: onResourceCreated
      message:
        $ref: '#/components/messages/ResourceCreated'

  resources.updated:
    description: Published when a resource is updated
    publish:
      summary: Resource Updated Event
      operationId: onResourceUpdated
      message:
        $ref: '#/components/messages/ResourceUpdated'

  resources.deleted:
    description: Published when a resource is deleted
    publish:
      summary: Resource Deleted Event
      operationId: onResourceDeleted
      message:
        $ref: '#/components/messages/ResourceDeleted'

  maintenance.scheduled:
    description: Published when maintenance is scheduled
    publish:
      summary: Maintenance Scheduled Event
      operationId: onMaintenanceScheduled
      message:
        $ref: '#/components/messages/MaintenanceScheduled'

components:
  messages:
    ResourceCreated:
      name: ResourceCreated
      title: Resource Created
      summary: A new resource has been created
      contentType: application/json
      payload:
        type: object
        properties:
          success:
            type: boolean
            example: true
          data:
            type: object
            properties:
              resourceId:
                type: string
                format: uuid
                example: '507f1f77bcf86cd799439011'
              name:
                type: string
                example: 'Sala A-101'
              categoryId:
                type: string
                example: '507f1f77bcf86cd799439012'
              programId:
                type: string
                example: '507f1f77bcf86cd799439013'
              createdBy:
                type: string
                example: '507f1f77bcf86cd799439014'
              createdAt:
                type: string
                format: date-time
                example: '2025-01-15T10:00:00Z'
          context:
            type: object
            properties:
              type:
                type: string
                example: 'event'
              eventType:
                type: string
                example: 'RESOURCE_CREATED'
              service:
                type: string
                example: 'resources-service'
              correlationId:
                type: string
                example: 'evt-123456'

    ResourceUpdated:
      name: ResourceUpdated
      title: Resource Updated
      summary: A resource has been updated
      contentType: application/json
      payload:
        type: object
        properties:
          success:
            type: boolean
          data:
            type: object
            properties:
              resourceId:
                type: string
              changes:
                type: object
                description: Fields that were changed
          context:
            type: object

    ResourceDeleted:
      name: ResourceDeleted
      title: Resource Deleted
      summary: A resource has been deleted
      contentType: application/json
      payload:
        type: object
        properties:
          success:
            type: boolean
          data:
            type: object
            properties:
              resourceId:
                type: string
              deletedBy:
                type: string
              deletedAt:
                type: string
                format: date-time
          context:
            type: object

    MaintenanceScheduled:
      name: MaintenanceScheduled
      title: Maintenance Scheduled
      summary: Maintenance has been scheduled for a resource
      contentType: application/json
      payload:
        type: object
        properties:
          success:
            type: boolean
          data:
            type: object
            properties:
              resourceId:
                type: string
              maintenanceType:
                type: string
              scheduledDate:
                type: string
                format: date-time
              estimatedDuration:
                type: number
                description: Duration in minutes
          context:
            type: object
```

**Acción**: Crear `asyncapi.yml` en cada servicio:
- `apps/auth-service/asyncapi.yml`
- `apps/resources-service/asyncapi.yml`
- `apps/availability-service/asyncapi.yml`
- `apps/stockpile-service/asyncapi.yml`
- `apps/reports-service/asyncapi.yml`

---

### Tarea 6.4: Configurar Swagger en API Gateway

**Objetivo**: Documentación agregada de todos los servicios en un solo lugar.

**Configuración**:

```typescript
// apps/api-gateway/src/main.ts
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ApiGatewayModule } from './api-gateway.module';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Bookly API')
    .setDescription('Complete API documentation for Bookly reservation system')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Authentication', 'User authentication and authorization')
    .addTag('Resources', 'Resource management')
    .addTag('Availability', 'Availability and reservations')
    .addTag('Approvals', 'Approval workflows')
    .addTag('Reports', 'Reports and analytics')
    .addServer('http://localhost:3000', 'Local development')
    .addServer('https://api.bookly.ufps.edu.co', 'Production')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Bookly API Documentation',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
  });

  await app.listen(3000);
  console.log(`API Gateway running on: http://localhost:3000`);
  console.log(`Swagger docs available at: http://localhost:3000/api/docs`);
}

bootstrap();
```

**Acción**: Verificar que el API Gateway muestre documentación de todos los servicios.

---

### Tarea 6.5: Crear Documentación de Endpoints

**Objetivo**: Archivo `ENDPOINTS.md` en cada servicio con lista completa de endpoints.

**Estructura**:

```markdown
# Endpoints - Resources Service

## Base URL

- **Development**: `http://localhost:3002/api/v1`
- **Production**: `https://api.bookly.ufps.edu.co/resources/api/v1`

## Authentication

All endpoints require Bearer token authentication except where noted.

```http
Authorization: Bearer <access_token>
```

## Resources

### GET /resources

Get all resources with pagination.

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 20)
- `categoryId` (string, optional): Filter by category
- `programId` (string, optional): Filter by program
- `status` (string, optional): Filter by status

**Response:**
```json
{
  "success": true,
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### GET /resources/:id

Get resource by ID.

**Parameters:**
- `id` (string): Resource ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Sala A-101",
    "capacity": 30,
    "location": "Building A, Floor 1"
  }
}
```

### POST /resources

Create a new resource.

**Required Permissions:** `resources:create`

**Body:**
```json
{
  "name": "Sala A-101",
  "capacity": 30,
  "location": "Building A, Floor 1",
  "categoryIds": ["507f1f77bcf86cd799439012"],
  "programId": "507f1f77bcf86cd799439013"
}
```

**Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Resource created successfully"
}
```

### PUT /resources/:id

Update a resource.

**Required Permissions:** `resources:update`

### DELETE /resources/:id

Delete a resource (soft delete).

**Required Permissions:** `resources:delete`
```

**Acción**: Crear/actualizar `ENDPOINTS.md` en cada servicio.

---

### Tarea 6.6: Documentar Schemas de Base de Datos

**Objetivo**: Archivo `DATABASE.md` con esquemas y relaciones.

**Estructura**:

```markdown
# Database Schema - Resources Service

## Database

- **Name**: `bookly-resources`
- **Type**: MongoDB
- **Connection**: `mongodb://localhost:27018/bookly-resources`

## Collections

### resources

Stores all physical resources (rooms, equipment, labs).

**Schema:**
```typescript
{
  _id: ObjectId,
  name: string,
  capacity: number,
  location: string,
  description?: string,
  categoryIds: ObjectId[],
  programId: ObjectId,
  status: 'available' | 'unavailable' | 'maintenance',
  technicalAttributes: object,
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date,
  deletedAt?: Date
}
```

**Indexes:**
- `name` (unique)
- `categoryIds`
- `programId`
- `status`

### categories

Resource categories (room types, equipment types).

**Schema:**
```typescript
{
  _id: ObjectId,
  name: string,
  description: string,
  type: 'resource_type' | 'maintenance_type',
  isMinimal: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### maintenance

Maintenance records for resources.

**Schema:**
```typescript
{
  _id: ObjectId,
  resourceId: ObjectId,
  type: string,
  scheduledDate: Date,
  completedDate?: Date,
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled',
  notes: string,
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

## Relationships

- `resources.categoryIds` → `categories._id` (many-to-many)
- `resources.programId` → `programs._id` (in auth-service)
- `maintenance.resourceId` → `resources._id` (one-to-many)

**Acción**: Crear/actualizar `DATABASE.md` en cada servicio.

---

## 📊 Métricas de Cumplimiento

| Aspecto | Estado | Prioridad |
|---------|--------|-----------|
| Decoradores Swagger completos | 60% | Alta |
| DTOs documentados | 50% | Alta |
| AsyncAPI implementado | 0% | Media |
| API Gateway con docs agregadas | 70% | Alta |
| ENDPOINTS.md | 40% | Media |
| DATABASE.md | 60% | Media |

---

## 🔗 Referencias

- `docs/API_SWAGGER_DOCUMENTATION.md`
- [Swagger/OpenAPI Specification](https://swagger.io/specification/)
- [AsyncAPI Specification](https://www.asyncapi.com/docs/specifications/v2.6.0)
- [NestJS Swagger](https://docs.nestjs.com/openapi/introduction)

---

**Última actualización**: 30 de noviembre de 2024  
**Responsable**: Equipo Bookly  
**Siguiente revisión**: Tarea 6.1
