# 🏗️ [Service Name] - Arquitectura

**Fecha**: [Fecha]  
**Versión**: 1.0

---

## 📋 Índice

- [Visión General](#visión-general)
- [Capas de la Arquitectura](#capas-de-la-arquitectura)
- [Patrones Implementados](#patrones-implementados)
- [Event-Driven Architecture](#event-driven-architecture)
- [Comunicación con Otros Servicios](#comunicación-con-otros-servicios)
- [Seguridad](#seguridad)
- [Cache y Performance](#cache-y-performance)

---

## 🎯 Visión General

El **[Service Name]** es responsable de [descripción]:

- [Responsabilidad 1]
- [Responsabilidad 2]
- [Responsabilidad 3]

### Diagrama de Arquitectura

```
┌─────────────────────────────────────────────┐
│            [Service Name]                   │
├─────────────────────────────────────────────┤
│  ┌──────────────────────────────────┐       │
│  │    Infrastructure Layer          │       │
│  │    Controllers                   │       │
│  └──────────────────────────────────┘       │
│  ┌──────────────────────────────────┐       │
│  │    Application Layer (CQRS)      │       │
│  │    Commands | Queries            │       │
│  │    Services                      │       │
│  └──────────────────────────────────┘       │
│  ┌──────────────────────────────────┐       │
│  │    Domain Layer                  │       │
│  │    Entities | Repositories       │       │
│  └──────────────────────────────────┘       │
└─────────────────────────────────────────────┘
```

### Puerto

- **Development**: [puerto]
- **Production**: [puerto]

---

## 📦 Capas de la Arquitectura

### Domain Layer (Capa de Dominio)

**Responsabilidad**: Lógica de negocio y reglas de dominio.

#### Entidades

- **`Entity1`**: [Descripción]
  - Atributos: [campos principales]
  - Relaciones: [relaciones con otras entidades]

#### Repositorios (Interfaces)

```typescript
interface IEntity1Repository {
  findById(id: string): Promise<Entity1>;
  create(data: CreateDto): Promise<Entity1>;
  update(id: string, data: UpdateDto): Promise<Entity1>;
}
```

---

### Application Layer (Capa de Aplicación)

**Responsabilidad**: Orquestación de casos de uso.

#### Commands (Escritura)

```typescript
CreateEntity1Command;
UpdateEntity1Command;
DeleteEntity1Command;
```

#### Queries (Lectura)

```typescript
GetEntity1ByIdQuery;
GetEntity1ListQuery;
```

#### Services

- **`Service1`**: [Descripción]
- **`Service2`**: [Descripción]

---

### Infrastructure Layer (Capa de Infraestructura)

**Responsabilidad**: Comunicación externa.

#### Controllers

```typescript
@Controller('[path]')
export class Entity1Controller {
  @Get()
  @Post()
  @Get(':id')
  @Patch(':id')
  @Delete(':id')
}
```

#### Adaptadores

- **`PrismaEntity1Repository`**: Implementación repository
- **`EventBusAdapter`**: Publicación de eventos
- **`CacheAdapter`**: Redis cache

---

## 🎨 Patrones Implementados

### 1. CQRS

```typescript
@CommandHandler(CreateCommand)
export class CreateHandler {
  async execute(command: CreateCommand): Promise<Dto> {
    // Lógica
  }
}

@QueryHandler(GetQuery)
export class GetHandler {
  async execute(query: GetQuery): Promise<Dto> {
    // Lógica
  }
}
```

### 2. Repository Pattern

```typescript
export interface IRepository {
  findById(id: string): Promise<Entity>;
}

@Injectable()
export class PrismaRepository implements IRepository {
  async findById(id: string): Promise<Entity> {
    // Implementación
  }
}
```

### 3. Strategy Pattern (opcional)

[Describir estrategias si aplica]

---

## 🔄 Event-Driven Architecture

### Eventos Publicados

```typescript
Event1Name {
  eventId: string;
  timestamp: Date;
  data: { ... };
}
```

### Eventos Consumidos

[Listar eventos que consume]

---

## 🔗 Comunicación con Otros Servicios

### Servicios que Consumen Este Servicio

- [Servicio 1]: [Propósito]
- [Servicio 2]: [Propósito]

### Servicios Consumidos

- [Servicio 1]: [Propósito]

---

## 🔐 Seguridad

### Guards Implementados

- **JwtAuthGuard**: Validación JWT
- **RolesGuard**: Verificación de roles
- **PermissionsGuard**: Verificación de permisos

### Rate Limiting

```typescript
@UseGuards(ThrottlerGuard)
@Throttle(10, 60) // 10 requests por minuto
```

---

## ⚡ Cache y Performance

### Estrategia de Cache

**Redis para**:

1. [Tipo de dato 1]: TTL = [tiempo]
2. [Tipo de dato 2]: TTL = [tiempo]

### Invalidación de Cache

[Describir estrategia]

---

## 📚 Referencias

- [Base de Datos](DATABASE.md)
- [Endpoints](ENDPOINTS.md)
- [Event Bus](EVENT_BUS.md)

---

**Mantenedores**: Bookly Development Team  
**Última actualización**: [Fecha]
