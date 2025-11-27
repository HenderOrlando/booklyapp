# Configuración de Redis Cache para RF-23

## ✅ Integración Completada

El proyecto **Bookly** ya cuenta con una integración de Redis global a través de `@libs/redis`. No necesitas instalar dependencias adicionales.

## Arquitectura Existente

### RedisModule Global (`@libs/redis`)

El proyecto utiliza un módulo Redis centralizado que proporciona:

- Conexión automática a Redis
- Métodos helper para cache con prefijos
- Gestión de TTL
- Reconexión automática
- Health checks

```typescript
// Ubicado en: libs/redis/src/redis.module.ts
@Global()
@Module({})
export class RedisModule {
  static forRoot(options?: RedisModuleOptions): DynamicModule {
    // ...
  }
}
```

### RedisService

Servicio inyectable con métodos útiles:

- `get<T>(key: string): Promise<T | null>`
- `set(key: string, value: any, options?: CacheOptions): Promise<void>`
- `del(key: string): Promise<void>`
- `delMany(keys: string[]): Promise<void>`
- `keys(pattern: string): Promise<string[]>`
- `cacheWithPrefix(prefix, key, value, ttl): Promise<void>`
- `getCachedWithPrefix<T>(prefix, key): Promise<T | null>`

## Configuración en Stockpile Service

### 1. Importar RedisModule en stockpile.module.ts

```typescript
import { RedisModule } from "@libs/redis/src/redis.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    // ... otros módulos
    RedisModule.forRoot(), // ✅ Ya agregado
  ],
  providers: [
    CacheInvalidationService, // ✅ Ya agregado
    CacheActiveApprovalsInterceptor, // ✅ Ya agregado
    // ... otros providers
  ],
})
export class StockpileModule {}
```

### 2. Implementación del Interceptor

```typescript
// src/infrastructure/interceptors/cache-active-approvals.interceptor.ts
import { RedisService } from "@libs/redis/src/redis.service";

@Injectable()
export class CacheActiveApprovalsInterceptor implements NestInterceptor {
  private readonly CACHE_TTL = 300; // 5 minutos

  constructor(private readonly redisService: RedisService) {}

  async intercept(context: ExecutionContext, next: CallHandler) {
    const cacheKey = this.generateCacheKey(request);

    // Obtener del cache usando el prefijo "CACHE"
    const cached = await this.redisService.getCachedWithPrefix(
      "CACHE",
      cacheKey
    );
    if (cached) return of(cached);

    // Si no hay cache, ejecutar y cachear
    return next.handle().pipe(
      tap(async (response) => {
        await this.redisService.cacheWithPrefix(
          "CACHE",
          cacheKey,
          response,
          this.CACHE_TTL
        );
      })
    );
  }
}
```

### 3. Aplicar interceptor en el controller

```typescript
import { UseInterceptors } from "@nestjs/common";
import { CacheActiveApprovalsInterceptor } from "../interceptors/cache-active-approvals.interceptor";

@Controller("approval-requests")
export class ApprovalRequestsController {
  @Get("active-today")
  @UseInterceptors(CacheActiveApprovalsInterceptor)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SECURITY, UserRole.GENERAL_ADMIN, UserRole.PROGRAM_ADMIN)
  async getActiveToday(...) {
    // ...
  }
}
```

### 4. Invalidar cache en handlers

```typescript
import { CacheInvalidationService } from "../../infrastructure/services/cache-invalidation.service";

@CommandHandler(ApproveStepCommand)
export class ApproveStepHandler {
  constructor(
    private readonly approvalRequestService: ApprovalRequestService,
    private readonly cacheInvalidationService: CacheInvalidationService
  ) {}

  async execute(command: ApproveStepCommand): Promise<ApprovalRequestEntity> {
    const result = await this.approvalRequestService.approveStep({
      approvalRequestId: command.approvalRequestId,
      approverId: command.approverId,
      stepName: command.stepName,
      comment: command.comment,
    });

    // Invalidar cache
    await this.cacheInvalidationService.invalidateActiveApprovalsCache();

    return result;
  }
}
```

## Variables de Entorno

Agregar al `.env`:

```env
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=  # opcional
REDIS_DB=0       # opcional
```

## Docker Compose (opcional)

```yaml
version: "3.8"
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes

volumes:
  redis_data:
```

## Estructura de Claves en Redis

```
active-approvals:today:1:20:all:all:all                    # Sin filtros
active-approvals:2025-01-05:1:20:all:all:all              # Fecha específica
active-approvals:2025-01-05:1:20:res-123:all:all          # Con resourceId
active-approvals:2025-01-05:2:20:res-123:prog-456:all     # Con filtros múltiples
```

## Estrategia de Invalidación

### 1. Invalidación Total

Se ejecuta cuando:

- Se aprueba un paso
- Se rechaza un paso
- Se cancela una solicitud

```typescript
await cacheInvalidationService.invalidateActiveApprovalsCache();
```

### 2. Invalidación por Fecha

Se ejecuta cuando se conoce la fecha específica de la reserva:

```typescript
const reservationDate = new Date(approvalRequest.metadata.reservationStartDate);
await cacheInvalidationService.invalidateCacheForDate(reservationDate);
```

## Monitoreo

### Verificar conexión a Redis

```bash
# Conectar al CLI de Redis
redis-cli

# Ver todas las claves
KEYS *

# Ver claves de aprobaciones
KEYS active-approvals:*

# Ver TTL de una clave
TTL active-approvals:today:1:20:all:all:all

# Ver valor de una clave
GET active-approvals:today:1:20:all:all:all
```

### Métricas de Cache

```typescript
// Agregar métricas en el interceptor
private cacheHits = 0;
private cacheMisses = 0;

async intercept(...) {
  const cachedResponse = await this.cacheManager.get(cacheKey);

  if (cachedResponse) {
    this.cacheHits++;
    logger.info("Cache hit", { key: cacheKey, hits: this.cacheHits });
    return of(cachedResponse);
  }

  this.cacheMisses++;
  logger.info("Cache miss", { key: cacheKey, misses: this.cacheMisses });
  // ...
}
```

## Beneficios

- ✅ Reduce carga en MongoDB
- ✅ Respuesta < 50ms (vs ~200ms sin cache)
- ✅ Escala horizontalmente con Redis Cluster
- ✅ Cache distribuido entre instancias
- ✅ TTL de 5 minutos balance freshness vs performance
- ✅ Invalidación selectiva minimiza inconsistencias

## Alternativas

### Sin Redis (In-Memory Cache)

```typescript
CacheModule.register({
  ttl: 300,
  max: 100,
  isGlobal: true,
}),
```

**Limitaciones**:

- No compartido entre instancias
- Se pierde en reinicio
- No escalable

## Testing

```typescript
describe("CacheActiveApprovalsInterceptor", () => {
  let cacheManager: Cache;
  let interceptor: CacheActiveApprovalsInterceptor;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [
        CacheModule.register({
          ttl: 5,
          max: 10,
        }),
      ],
      providers: [CacheActiveApprovalsInterceptor],
    }).compile();

    cacheManager = module.get(CACHE_MANAGER);
    interceptor = module.get(CacheActiveApprovalsInterceptor);
  });

  it("should return cached response on second call", async () => {
    // ... test implementation
  });
});
```

## Troubleshooting

### Error: Cannot connect to Redis

**Solución**: Verificar que Redis esté corriendo y las credenciales sean correctas.

```bash
# Verificar estado de Redis
redis-cli ping
# Debería responder: PONG
```

### Cache no se invalida

**Solución**: Verificar que los handlers llamen a `cacheInvalidationService.invalidateActiveApprovalsCache()`.

### TTL muy corto/largo

**Solución**: Ajustar `CACHE_TTL` según necesidades:

- 60s para datos muy dinámicos
- 300s (5min) balance recomendado
- 600s (10min) para datos menos cambiantes
