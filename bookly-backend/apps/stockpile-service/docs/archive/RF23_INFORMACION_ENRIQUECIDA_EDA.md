# RF-23: Información Enriquecida con Event-Driven Architecture (EDA)

## ✅ Estado Actual: INFRAESTRUCTURA PREPARADA

La infraestructura para información enriquecida está completamente implementada y lista para integración con Event-Driven Architecture (EDA).

---

## 📋 Resumen

Se ha implementado un sistema de enriquecimiento de datos que actualmente devuelve estructura básica, pero está **completamente preparado** para recibir datos de otros servicios vía eventos.

### Arquitectura Implementada

```
┌─────────────────────┐
│  Controller (GET)   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   CQRS Handler      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Approval Service   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐      ┌─────────────────────┐
│     Repository      │      │  DataEnrichment     │
│  (Base de datos)    │      │     Service         │
└──────────┬──────────┘      └──────────┬──────────┘
           │                            │
           │                            │
           │    ┌──────────────────────┘
           │    │
           ▼    ▼
        Entidades Base
              │
              ▼
       EnrichApprovalRequests()
              │
              ▼
     ┌────────┴────────┐
     │                 │
     ▼                 ▼
┌─────────┐     ┌──────────┐
│  Redis  │     │  Redis   │
│  Cache  │     │  Cache   │
│  Users  │     │Resources │
└─────────┘     └──────────┘
     ▲                 ▲
     │                 │
     │  EDA Events     │
     │  (To Implement) │
     │                 │
┌─────────────┐  ┌─────────────┐
│ Availability│  │ Resources   │
│   Service   │  │  Service    │
└─────────────┘  └─────────────┘
```

---

## 🔧 Archivos Implementados

### 1. DTOs Enriquecidos

**Archivo**: `src/infrastructure/dtos/enriched-approval.dto.ts`

```typescript
export class RequesterInfoDto {
  id: string;
  name?: string; // ← Desde availability-service vía eventos
  email?: string; // ← Desde availability-service vía eventos
  program?: string; // ← Desde availability-service vía eventos
}

export class ResourceInfoDto {
  id: string;
  name?: string; // ← Desde resources-service vía eventos
  type?: string; // ← Desde resources-service vía eventos
  location?: string; // ← Desde resources-service vía eventos
  capacity?: number; // ← Desde resources-service vía eventos
}

export class EnrichedApprovalRequestDto {
  id: string;
  reservationId: string;
  status: string;
  requester: RequesterInfoDto; // ← Enriquecido
  resource: ResourceInfoDto; // ← Enriquecido
  reservationStartDate?: Date;
  reservationEndDate?: Date;
  purpose?: string;
  approvalHistory?: ApprovalHistoryItemDto[];
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
```

### 2. Servicio de Enriquecimiento

**Archivo**: `src/application/services/data-enrichment.service.ts`

**Estado**: Preparado para EDA, actualmente devuelve datos básicos.

**Métodos Principales**:

- `enrichApprovalRequest(approval)`: Enriquece una aprobación individual
- `enrichApprovalRequests(approvals)`: Enriquece múltiples aprobaciones
- `getRequesterInfo(requesterId)`: Obtiene info del usuario (preparado para Redis cache)
- `getResourceInfo(resourceId)`: Obtiene info del recurso (preparado para Redis cache)

### 3. Integración en Service

**Archivo**: `src/application/services/approval-request.service.ts`

**Cambios**:

```typescript
async getActiveTodayApprovals(params): Promise<{
  requests: EnrichedApprovalRequestDto[];  // ← Ahora enriquecido
  meta: PaginationMeta;
}> {
  const result = await this.approvalRequestRepository.findActiveByDateRange(...);

  // Enriquecer datos
  const enrichedRequests = await this.dataEnrichmentService.enrichApprovalRequests(
    result.requests
  );

  return {
    requests: enrichedRequests,
    meta: result.meta,
  };
}
```

### 4. Response DTO Actualizado

**Archivo**: `src/infrastructure/dtos/get-active-today-approvals.dto.ts`

```typescript
export class PaginatedActiveApprovalsResponseDto {
  @ApiProperty({ type: [EnrichedApprovalRequestDto] })
  data: EnrichedApprovalRequestDto[]; // ← Usa DTO enriquecido

  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
```

---

## 🚀 Implementación con EDA (Pasos Futuros)

### Paso 1: Crear Event Handlers

**Ubicación**: `apps/stockpile-service/src/infrastructure/event-handlers/`

#### 1.1 Usuario Creado/Actualizado

```typescript
// user-info.event-handler.ts
@Injectable()
export class UserInfoEventHandler {
  constructor(private readonly redisService: RedisService) {}

  @EventPattern("user.created")
  async handleUserCreated(data: UserCreatedEvent) {
    await this.redisService.cacheWithPrefix(
      "CACHE",
      `user:${data.userId}`,
      {
        id: data.userId,
        name: data.name,
        email: data.email,
        program: data.program,
      },
      1800
    ); // 30 minutos TTL
  }

  @EventPattern("user.updated")
  async handleUserUpdated(data: UserUpdatedEvent) {
    await this.redisService.cacheWithPrefix(
      "CACHE",
      `user:${data.userId}`,
      {
        id: data.userId,
        name: data.name,
        email: data.email,
        program: data.program,
      },
      1800
    );
  }

  @EventPattern("user.deleted")
  async handleUserDeleted(data: UserDeletedEvent) {
    await this.redisService.deleteCachedWithPrefix(
      "CACHE",
      `user:${data.userId}`
    );
  }
}
```

#### 1.2 Recurso Creado/Actualizado

```typescript
// resource-info.event-handler.ts
@Injectable()
export class ResourceInfoEventHandler {
  constructor(private readonly redisService: RedisService) {}

  @EventPattern("resource.created")
  async handleResourceCreated(data: ResourceCreatedEvent) {
    await this.redisService.cacheWithPrefix(
      "CACHE",
      `resource:${data.resourceId}`,
      {
        id: data.resourceId,
        name: data.name,
        type: data.type,
        location: data.location,
        capacity: data.capacity,
      },
      3600
    ); // 1 hora TTL
  }

  @EventPattern("resource.updated")
  async handleResourceUpdated(data: ResourceUpdatedEvent) {
    await this.redisService.cacheWithPrefix(
      "CACHE",
      `resource:${data.resourceId}`,
      {
        id: data.resourceId,
        name: data.name,
        type: data.type,
        location: data.location,
        capacity: data.capacity,
      },
      3600
    );
  }

  @EventPattern("resource.deleted")
  async handleResourceDeleted(data: ResourceDeletedEvent) {
    await this.redisService.deleteCachedWithPrefix(
      "CACHE",
      `resource:${data.resourceId}`
    );
  }
}
```

### Paso 2: Actualizar DataEnrichmentService

```typescript
// src/application/services/data-enrichment.service.ts

@Injectable()
export class DataEnrichmentService {
  constructor(
    private readonly redisService: RedisService // ← Inyectar RedisService
  ) {}

  private async getRequesterInfo(
    requesterId?: string
  ): Promise<RequesterInfoDto> {
    if (!requesterId) {
      return { id: "unknown" };
    }

    // Consultar cache Redis
    const cached =
      await this.redisService.getCachedWithPrefix<RequesterInfoDto>(
        "CACHE",
        `user:${requesterId}`
      );

    if (cached) {
      logger.debug("User info found in cache", { requesterId });
      return cached;
    }

    // Si no está en cache, emitir evento solicitando información
    // (opcional, dependiendo de la estrategia)
    logger.warn("User info not found in cache", { requesterId });

    return {
      id: requesterId,
      name: undefined,
      email: undefined,
      program: undefined,
    };
  }

  private async getResourceInfo(resourceId?: string): Promise<ResourceInfoDto> {
    if (!resourceId) {
      return { id: "unknown" };
    }

    // Consultar cache Redis
    const cached = await this.redisService.getCachedWithPrefix<ResourceInfoDto>(
      "CACHE",
      `resource:${resourceId}`
    );

    if (cached) {
      logger.debug("Resource info found in cache", { resourceId });
      return cached;
    }

    logger.warn("Resource info not found in cache", { resourceId });

    return {
      id: resourceId,
      name: undefined,
      type: undefined,
      location: undefined,
      capacity: undefined,
    };
  }
}
```

### Paso 3: Configurar Event Bus

#### 3.1 Agregar RabbitMQ al módulo

```typescript
// stockpile.module.ts
import { ClientsModule, Transport } from "@nestjs/microservices";

@Module({
  imports: [
    // ... otros imports
    ClientsModule.register([
      {
        name: "EVENT_BUS",
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || "amqp://localhost:5672"],
          queue: "stockpile_events_queue",
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  providers: [
    // ... otros providers
    UserInfoEventHandler,
    ResourceInfoEventHandler,
  ],
})
export class StockpileModule {}
```

#### 3.2 Variables de Entorno

```env
# RabbitMQ
RABBITMQ_URL=amqp://bookly:bookly123@localhost:5672
RABBITMQ_QUEUE_STOCKPILE=stockpile_events_queue

# Redis (ya configurado)
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Paso 4: Estrategia de Sincronización Inicial

#### Opción A: Población Bajo Demanda

Cuando se consulta un usuario/recurso que no está en cache:

1. Registrar en logs
2. Emitir evento `user.info.requested` o `resource.info.requested`
3. Esperar respuesta vía evento
4. Cachear resultado

#### Opción B: Población Periódica

Ejecutar un job que:

1. Consulta todos los usuarios activos
2. Consulta todos los recursos activos
3. Cachea en Redis
4. Se ejecuta cada 6 horas

```typescript
@Injectable()
export class CacheSyncService {
  @Cron("0 */6 * * *") // Cada 6 horas
  async syncUserCache() {
    // Emitir evento solicitando todos los usuarios activos
    // Cachear respuestas
  }

  @Cron("0 */6 * * *")
  async syncResourceCache() {
    // Emitir evento solicitando todos los recursos activos
    // Cachear respuestas
  }
}
```

---

## 📊 Estructura de Eventos

### Eventos a Escuchar (desde otros servicios)

| Evento             | Origen               | Datos                                      | Acción             |
| ------------------ | -------------------- | ------------------------------------------ | ------------------ |
| `user.created`     | availability-service | userId, name, email, program               | Cachear usuario    |
| `user.updated`     | availability-service | userId, name, email, program               | Actualizar cache   |
| `user.deleted`     | availability-service | userId                                     | Eliminar del cache |
| `resource.created` | resources-service    | resourceId, name, type, location, capacity | Cachear recurso    |
| `resource.updated` | resources-service    | resourceId, name, type, location, capacity | Actualizar cache   |
| `resource.deleted` | resources-service    | resourceId                                 | Eliminar del cache |

### Eventos a Emitir (desde stockpile-service)

| Evento                    | Destino              | Datos      | Propósito                 |
| ------------------------- | -------------------- | ---------- | ------------------------- |
| `user.info.requested`     | availability-service | userId     | Solicitar info de usuario |
| `resource.info.requested` | resources-service    | resourceId | Solicitar info de recurso |

---

## 🧪 Testing

### Unit Tests

```typescript
describe("DataEnrichmentService", () => {
  let service: DataEnrichmentService;
  let redisService: RedisService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        DataEnrichmentService,
        {
          provide: RedisService,
          useValue: {
            getCachedWithPrefix: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(DataEnrichmentService);
    redisService = module.get(RedisService);
  });

  it("should enrich approval with user info from cache", async () => {
    const mockUserInfo = {
      id: "user-123",
      name: "Juan Pérez",
      email: "juan@ufps.edu.co",
      program: "Ingeniería de Sistemas",
    };

    jest
      .spyOn(redisService, "getCachedWithPrefix")
      .mockResolvedValue(mockUserInfo);

    const approval = {
      id: "app-123",
      reservationId: "res-123",
      status: "APPROVED",
      metadata: {
        requesterId: "user-123",
        resourceId: "resource-456",
      },
    } as ApprovalRequestEntity;

    const result = await service.enrichApprovalRequest(approval);

    expect(result.requester).toEqual(mockUserInfo);
  });
});
```

### Integration Tests

```typescript
describe("GET /approval-requests/active-today (enriched)", () => {
  it("should return enriched data when cache is populated", async () => {
    // Seed Redis with user and resource data
    await redisService.cacheWithPrefix(
      "CACHE",
      "user:user-123",
      {
        id: "user-123",
        name: "Juan Pérez",
        email: "juan@ufps.edu.co",
        program: "Ingeniería",
      },
      1800
    );

    const response = await request(app.getHttpServer())
      .get("/approval-requests/active-today")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body.data[0].requester.name).toBe("Juan Pérez");
    expect(response.body.data[0].resource.name).toBeDefined();
  });

  it("should return basic data when cache is empty", async () => {
    const response = await request(app.getHttpServer())
      .get("/approval-requests/active-today")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body.data[0].requester.name).toBeUndefined();
    expect(response.body.data[0].requester.id).toBeDefined();
  });
});
```

---

## 📈 Beneficios de la Arquitectura EDA

### 1. Desacoplamiento

- Stockpile no conoce la estructura interna de otros servicios
- Cambios en availability-service o resources-service no afectan stockpile

### 2. Performance

- Cache en Redis reduce latencia
- No hay llamadas HTTP síncronas entre servicios
- Datos disponibles localmente

### 3. Escalabilidad

- Cada servicio puede escalar independientemente
- Cache distribuido con Redis Cluster
- Event bus maneja alta concurrencia

### 4. Resiliencia

- Si availability-service está caído, stockpile sigue funcionando con cache
- Degradación graceful: devuelve datos básicos si no hay enriquecimiento
- Retry automático de eventos

### 5. Trazabilidad

- Cada evento es registrado
- Auditoría completa de sincronización
- Debugging facilitado con logs estructurados

---

## 🔍 Monitoreo y Observabilidad

### Métricas Clave

- **Cache Hit Rate**: % de veces que se encuentra info en cache
- **Enrichment Success Rate**: % de aprobaciones enriquecidas exitosamente
- **Event Processing Time**: Tiempo de procesamiento de eventos
- **Cache Size**: Tamaño total del cache en Redis

### Alertas Recomendadas

- Cache hit rate < 70% → Revisar estrategia de población
- Event processing time > 500ms → Optimizar handlers
- Errores de enrichment > 5% → Verificar disponibilidad de servicios

---

## ✅ Checklist de Implementación

### Infraestructura (Completado)

- [x] DTOs enriquecidos creados
- [x] DataEnrichmentService implementado
- [x] Integración con approval-request.service
- [x] Handler actualizado con tipos correctos
- [x] Controller devolviendo formato correcto
- [x] RedisService integrado

### Event-Driven Architecture (Pendiente)

- [ ] Configurar RabbitMQ en stockpile-service
- [ ] Crear event handlers para user.created/updated/deleted
- [ ] Crear event handlers para resource.created/updated/deleted
- [ ] Actualizar DataEnrichmentService para consultar Redis
- [ ] Implementar estrategia de población inicial de cache
- [ ] Configurar eventos en availability-service
- [ ] Configurar eventos en resources-service
- [ ] Testing de integración con eventos
- [ ] Documentar eventos en AsyncAPI

### Observabilidad (Pendiente)

- [ ] Configurar métricas de cache
- [ ] Configurar alertas de enrichment
- [ ] Dashboard de monitoreo
- [ ] Logging estructurado de eventos

---

## 🎉 Estado Final

**RF-23 Información Enriquecida**: ✅ **INFRAESTRUCTURA LISTA**

- ✅ Estructura de DTOs completa
- ✅ Servicio de enriquecimiento implementado
- ✅ Integración con service y handler
- ✅ Response API con datos enriquecidos
- ⏳ Integración EDA pendiente (documentada)
- ⏳ Event handlers pendientes (estructura definida)

**Resultado actual**: La API devuelve estructura enriquecida con IDs. Los campos opcionales (name, email, etc.) se llenarán automáticamente cuando se implemente EDA.

**Próximo paso**: Implementar event handlers y configurar RabbitMQ según documentación en este archivo.
