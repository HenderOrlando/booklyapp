# 🏗️ Resources Service - Arquitectura

**Fecha**: Noviembre 6, 2025  
**Versión**: 1.0

---

## 📋 Índice

- [Visión General](#visión-general)
- [Arquitectura por Capas](#arquitectura-por-capas)
- [Patrones Implementados](#patrones-implementados)
- [Event-Driven Architecture](#event-driven-architecture)
- [Comunicación Inter-Servicios](#comunicación-inter-servicios)
- [Gestión de Estado](#gestión-de-estado)
- [Métricas y Observabilidad](#métricas-y-observabilidad)

---

## 🎯 Visión General

El **Resources Service** es responsable de la gestión completa del catálogo de recursos físicos (salas, auditorios, equipos, laboratorios) de la institución. Es el servicio maestro para toda la información de recursos.

### Responsabilidades

- **CRUD de Recursos**: Crear, editar, eliminar recursos
- **Gestión de Categorías**: Organizar recursos por tipos
- **Atributos Personalizados**: Capacidad, equipamiento, accesibilidad
- **Importación Masiva**: Carga de recursos desde CSV/Excel
- **Configuración de Disponibilidad**: Horarios y reglas de uso
- **Mantenimiento**: Estados y programación de mantenimiento
- **Imágenes**: Gestión de fotos de recursos

---

## 🏛️ Arquitectura por Capas

```
┌─────────────────────────────────────────────────────────────┐
│                   PRESENTATION LAYER                        │
│  ┌────────────────┐  ┌────────────────┐  ┌───────────────┐  │
│  │   Resource     │  │   Category     │  │  Maintenance  │  │
│  │  Controller    │  │   Controller   │  │   Controller  │  │
│  └────────────────┘  └────────────────┘  └───────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                        │
│  ┌──────────────────┐        ┌──────────────────┐           │
│  │  Command Bus     │        │    Query Bus     │           │
│  │                  │        │                  │           │
│  │ • CreateResource │        │ • GetResources   │           │
│  │ • UpdateResource │        │ • GetResourceById│           │
│  │ • DeleteResource │        │ • SearchResources│           │
│  │ • ImportResources│        │ • GetCategories  │           │
│  └──────────────────┘        └──────────────────┘           │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Command/Query Handlers                  │   │
│  │                                                      │   │
│  │  • Orquestan flujo entre services                    │   │
│  │  • Publican eventos de dominio                       │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      DOMAIN LAYER                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Resource   │  │   Category   │  │ Maintenance  │       │
│  │   Entity     │  │   Entity     │  │   Entity     │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                  Services                            │   │
│  │                                                      │   │
│  │  • ResourceService                                   │   │
│  │  • CategoryService                                   │   │
│  │  • MaintenanceService                                │   │
│  │  • ImageService                                      │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  INFRASTRUCTURE LAYER                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Prisma Repositories                     │   │
│  │  • PrismaResourceRepository                          │   │
│  │  • PrismaCategoryRepository                          │   │
│  │  • PrismaMaintenanceRepository                       │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              External Services                       │   │
│  │  • EventBusService (RabbitMQ)                        │   │
│  │  • RedisService (Cache)                              │   │
│  │  • LoggingService (Winston)                          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 Patrones Implementados

### 1. CQRS (Command Query Responsibility Segregation)

**Objetivo**: Separar operaciones de escritura (Commands) de lectura (Queries).

#### Commands (Escritura)

```typescript
// CreateResourceCommand
export class CreateResourceCommand {
  constructor(
    public readonly dto: CreateResourceDto,
    public readonly createdBy: string
  ) {}
}

// Handler
@CommandHandler(CreateResourceCommand)
export class CreateResourceHandler
  implements ICommandHandler<CreateResourceCommand>
{
  constructor(private readonly resourceService: ResourceService) {}

  async execute(command: CreateResourceCommand): Promise<Resource> {
    return this.resourceService.createResource(command.dto, command.createdBy);
  }
}
```

#### Queries (Lectura)

```typescript
// GetResourcesQuery
export class GetResourcesQuery {
  constructor(public readonly filters: ResourceFiltersDto) {}
}

// Handler
@QueryHandler(GetResourcesQuery)
export class GetResourcesHandler implements IQueryHandler<GetResourcesQuery> {
  constructor(private readonly resourceService: ResourceService) {}

  async execute(query: GetResourcesQuery): Promise<PaginatedResult<Resource>> {
    return this.resourceService.findAll(query.filters);
  }
}
```

---

### 2. Repository Pattern

**Objetivo**: Abstraer lógica de persistencia y permitir cambiar el ORM sin afectar la lógica de negocio.

```typescript
// Domain Interface
export interface ResourceRepository {
  create(data: CreateResourceData): Promise<Resource>;
  findById(id: string): Promise<Resource | null>;
  findAll(filters: ResourceFilters): Promise<PaginatedResult<Resource>>;
  update(id: string, data: UpdateResourceData): Promise<Resource>;
  delete(id: string): Promise<void>;
  searchByName(query: string): Promise<Resource[]>;
  findByCategory(categoryId: string): Promise<Resource[]>;
}

// Infrastructure Implementation
@Injectable()
export class PrismaResourceRepository implements ResourceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateResourceData): Promise<Resource> {
    const prismaResource = await this.prisma.resource.create({ data });
    return ResourceMapper.toDomain(prismaResource);
  }

  // ... otros métodos
}
```

---

### 3. Factory Pattern

**Objetivo**: Crear instancias de entidades complejas con validaciones.

```typescript
export class ResourceFactory {
  static create(dto: CreateResourceDto): Resource {
    // Validaciones de negocio
    if (dto.capacity < 1) {
      throw new BadRequestException("Capacity must be at least 1");
    }

    return new Resource({
      name: dto.name,
      code: this.generateCode(dto.name),
      type: dto.type,
      capacity: dto.capacity,
      location: dto.location,
      attributes: this.buildAttributes(dto),
      availabilityRules: this.buildDefaultRules(),
      isActive: true,
      createdAt: new Date(),
    });
  }

  private static generateCode(name: string): string {
    const prefix = name.substring(0, 3).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${random}`;
  }
}
```

---

### 4. Specification Pattern

**Objetivo**: Encapsular lógica de filtrado y búsqueda compleja.

```typescript
export class ResourceSpecification {
  static isAvailableForReservation(resource: Resource, date: Date): boolean {
    // Verificar si está activo
    if (!resource.isActive) return false;

    // Verificar si está en mantenimiento
    if (resource.maintenanceStatus === MaintenanceStatus.IN_PROGRESS) {
      return false;
    }

    // Verificar reglas de disponibilidad
    const dayOfWeek = date.getDay();
    const rules = resource.availabilityRules.find(
      (r) => r.dayOfWeek === dayOfWeek
    );

    return rules ? rules.isAvailable : false;
  }

  static hasRequiredEquipment(resource: Resource, required: string[]): boolean {
    const equipment = resource.attributes.equipment || [];
    return required.every((item) => equipment.includes(item));
  }
}
```

---

## 🔄 Event-Driven Architecture

### Eventos Publicados

El Resources Service publica eventos para notificar cambios a otros servicios:

```typescript
// ResourceCreatedEvent
export interface ResourceCreatedEvent {
  eventId: string;
  timestamp: Date;
  data: {
    resourceId: string;
    name: string;
    type: string;
    categoryId: string;
    capacity: number;
    location: string;
    createdBy: string;
  };
}

// ResourceUpdatedEvent
export interface ResourceUpdatedEvent {
  eventId: string;
  timestamp: Date;
  data: {
    resourceId: string;
    changes: Partial<Resource>;
    updatedBy: string;
  };
}

// ResourceDeletedEvent
export interface ResourceDeletedEvent {
  eventId: string;
  timestamp: Date;
  data: {
    resourceId: string;
    deletedBy: string;
  };
}
```

### Publicación de Eventos

```typescript
@Injectable()
export class ResourceService {
  constructor(
    private readonly eventBus: EventBusService,
    private readonly repository: ResourceRepository
  ) {}

  async createResource(
    dto: CreateResourceDto,
    createdBy: string
  ): Promise<Resource> {
    const resource = await this.repository.create(dto);

    // Publicar evento
    await this.eventBus.publish("resources.resource.created", {
      eventId: uuid(),
      timestamp: new Date(),
      data: {
        resourceId: resource.id,
        name: resource.name,
        type: resource.type,
        categoryId: resource.categoryId,
        capacity: resource.capacity,
        location: resource.location,
        createdBy,
      },
    });

    return resource;
  }
}
```

---

## 🌐 Comunicación Inter-Servicios

### Servicios Consumidores

**Availability Service**:

- Escucha `resources.resource.created` para registrar disponibilidad
- Escucha `resources.resource.updated` para actualizar calendarios
- Escucha `resources.resource.deleted` para cancelar reservas futuras

**Stockpile Service**:

- Escucha `resources.resource.created` para configurar aprobadores
- Escucha `resources.resource.updated` para actualizar validaciones

**Reports Service**:

- Escucha todos los eventos para actualizar estadísticas

---

### Consultas Sincrónicas

```typescript
// Availability Service consulta disponibilidad de un recurso
@Injectable()
export class ResourceQueryClient {
  constructor(private readonly httpService: HttpService) {}

  async getResourceById(resourceId: string): Promise<Resource> {
    const response = await this.httpService
      .get(`${RESOURCES_SERVICE_URL}/api/resources/${resourceId}`)
      .toPromise();

    return response.data;
  }

  async checkResourceAvailability(
    resourceId: string,
    date: Date
  ): Promise<boolean> {
    const resource = await this.getResourceById(resourceId);
    return ResourceSpecification.isAvailableForReservation(resource, date);
  }
}
```

---

## 💾 Gestión de Estado

### Cache con Redis

```typescript
@Injectable()
export class ResourceCacheService {
  constructor(private readonly redis: RedisService) {}

  private readonly CACHE_TTL = 300; // 5 minutos
  private readonly PREFIX = "resources:resource:";

  async get(resourceId: string): Promise<Resource | null> {
    const cached = await this.redis.get(`${this.PREFIX}${resourceId}`);
    return cached ? JSON.parse(cached) : null;
  }

  async set(resource: Resource): Promise<void> {
    await this.redis.set(
      `${this.PREFIX}${resource.id}`,
      JSON.stringify(resource),
      this.CACHE_TTL
    );
  }

  async invalidate(resourceId: string): Promise<void> {
    await this.redis.del(`${this.PREFIX}${resourceId}`);
  }

  async invalidateCategory(categoryId: string): Promise<void> {
    const keys = await this.redis.keys(`${this.PREFIX}*`);
    const resources = await Promise.all(keys.map((k) => this.redis.get(k)));

    const toInvalidate = resources
      .filter((r) => r && JSON.parse(r).categoryId === categoryId)
      .map((r) => JSON.parse(r).id);

    await Promise.all(toInvalidate.map((id) => this.invalidate(id)));
  }
}
```

---

### Optimistic Locking

```typescript
// Prevenir condiciones de carrera en actualizaciones
export class Resource {
  version: number; // Incremental version number

  update(changes: Partial<Resource>): void {
    Object.assign(this, changes);
    this.version++;
  }
}

// En repository
async update(id: string, data: UpdateResourceData, expectedVersion: number): Promise<Resource> {
  const resource = await this.prisma.resource.update({
    where: {
      id,
      version: expectedVersion, // Solo actualiza si version coincide
    },
    data: {
      ...data,
      version: { increment: 1 },
    },
  });

  if (!resource) {
    throw new ConflictException("Resource was modified by another process");
  }

  return ResourceMapper.toDomain(resource);
}
```

---

## 📊 Métricas y Observabilidad

### Logging Estructurado

```typescript
@Injectable()
export class ResourceService {
  private readonly logger = new Logger(ResourceService.name);

  async createResource(
    dto: CreateResourceDto,
    createdBy: string
  ): Promise<Resource> {
    this.logger.log("Creating resource", {
      action: "create_resource",
      resourceName: dto.name,
      categoryId: dto.categoryId,
      createdBy,
    });

    try {
      const resource = await this.repository.create(dto);

      this.logger.log("Resource created successfully", {
        action: "resource_created",
        resourceId: resource.id,
        resourceCode: resource.code,
      });

      return resource;
    } catch (error) {
      this.logger.error("Failed to create resource", {
        action: "create_resource_failed",
        error: error.message,
        dto,
      });
      throw error;
    }
  }
}
```

---

### Métricas de Performance

```typescript
// Decorador para medir tiempos de ejecución
export function Measure(metricName: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const start = Date.now();
      try {
        const result = await originalMethod.apply(this, args);
        const duration = Date.now() - start;

        // Enviar métrica a Prometheus
        metricsService.recordDuration(metricName, duration);

        return result;
      } catch (error) {
        metricsService.recordError(metricName);
        throw error;
      }
    };

    return descriptor;
  };
}

// Uso
@Measure("resource_create_duration")
async createResource(dto: CreateResourceDto): Promise<Resource> {
  // ...
}
```

---

## 🔒 Seguridad

### Validación de Permisos

```typescript
@Controller("resources")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ResourceController {
  @Permissions("resources:create")
  @Post()
  async create(@Body() dto: CreateResourceDto, @CurrentUser() user: User) {
    return this.commandBus.execute(new CreateResourceCommand(dto, user.id));
  }

  @Permissions("resources:delete")
  @Delete(":id")
  async delete(@Param("id") id: string, @CurrentUser() user: User) {
    return this.commandBus.execute(new DeleteResourceCommand(id, user.id));
  }
}
```

---

### Validación de Entrada

```typescript
export class CreateResourceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsNumber()
  @Min(1)
  @Max(1000)
  capacity: number;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsMongoId()
  categoryId: string;

  @IsOptional()
  @IsObject()
  attributes?: ResourceAttributes;
}
```

---

## 📚 Referencias

- [Base de Datos](DATABASE.md)
- [Endpoints](ENDPOINTS.md)
- [Event Bus](EVENT_BUS.md)

---

**Mantenedores**: Bookly Development Team  
**Última actualización**: Noviembre 6, 2025
