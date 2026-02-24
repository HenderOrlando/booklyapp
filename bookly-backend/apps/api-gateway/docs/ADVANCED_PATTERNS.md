# API Gateway - Patrones Avanzados

Documentación completa de los 4 patrones avanzados implementados en el API Gateway.

---

## 🎯 Características Implementadas

1. **Request-Reply Pattern** - Esperar respuestas de Kafka con correlationId
2. **Circuit Breaker Pattern** - Protección contra fallos en cascada
3. **Rate Limiting** - Control de tráfico por usuario y servicio
4. **Saga Pattern** - Transacciones distribuidas con compensación automática

---

## 1️⃣ Request-Reply Pattern

### Descripción

Implementa comunicación bidireccional sobre Kafka, permitiendo esperar respuestas de comandos asíncronos usando `correlationId`.

### Archivo

`src/application/services/request-reply.service.ts`

### Uso

```typescript
// En ProxyService o cualquier servicio
const event: EventPayload = {
  eventId: uuidv4(),
  eventType: "resources.create",
  timestamp: new Date(),
  service: "api-gateway",
  data: { name: "Nueva Categoría" },
};

// Enviar y esperar respuesta (timeout 30s)
const response = await requestReplyService.sendAndWaitReply(
  "resources.commands",
  event,
  30000
);

console.log(response); // Respuesta del microservicio
```

### Flujo

```
Cliente → API Gateway → Kafka (correlationId: 123)
                          ↓
                    Microservicio procesa
                          ↓
                    Publica reply (correlationId: 123)
                          ↓
API Gateway → Match correlationId → Resolver Promise
         ↓
Cliente recibe respuesta
```

### Configuración

- **Tópico de respuestas**: `api-gateway.replies`
- **Timeout predeterminado**: 30 segundos
- **Group ID**: `api-gateway-consumer`

### Estadísticas

```typescript
const stats = requestReplyService.getStats();
// { pendingRequests: 5, requests: ['id1', 'id2', ...] }
```

---

## 2️⃣ Circuit Breaker Pattern

### Descripción

Protege contra fallos en cascada cortando automáticamente requests a servicios que están fallando.

### Archivo

`src/application/services/circuit-breaker.service.ts`

### Estados

```
CLOSED → OPEN → HALF-OPEN → CLOSED
  ↓        ↓         ↓          ↑
Normal   Failing  Testing   Recovered
```

### Uso

```typescript
// Registrar circuito
circuitBreaker.register("resources", {
  failureThreshold: 5, // Abrir después de 5 fallos
  successThreshold: 2, // Cerrar después de 2 éxitos en HALF-OPEN
  timeout: 60000, // 1 minuto para intentar recuperación
  resetTimeout: 300000, // 5 minutos para resetear contadores
});

// Ejecutar con circuit breaker
const result = await circuitBreaker.execute(
  "resources",
  async () => {
    // Llamada al servicio
    return await httpClient.get("/api/v1/resources");
  },
  async () => {
    // Fallback opcional si el circuito está abierto
    return cachedData;
  }
);
```

### Estados del Circuito

| Estado        | Descripción                  | Comportamiento                         |
| ------------- | ---------------------------- | -------------------------------------- |
| **CLOSED**    | Normal, servicio funcionando | Permite todas las requests             |
| **OPEN**      | Servicio fallando            | Rechaza requests, ejecuta fallback     |
| **HALF-OPEN** | Probando recuperación        | Permite requests limitadas para probar |

### Monitoreo

```typescript
// Estado de un circuito
const state = circuitBreaker.getCircuitState("resources");
// { state: 'CLOSED', failures: 0, successes: 10, lastStateChange: Date }

// Todos los circuitos
const allCircuits = circuitBreaker.getAllCircuits();

// Reset manual
circuitBreaker.resetCircuit("resources");
```

### Logging

```
[CIRCUIT-BREAKER] Circuit OPENED for resources { failures: 5 }
[CIRCUIT-BREAKER] Circuit HALF-OPEN for resources (testing recovery)
[CIRCUIT-BREAKER] Circuit CLOSED for resources (recovered)
```

---

## 3️⃣ Rate Limiting

### Descripción

Control de tráfico para prevenir abuso y ataques de denegación de servicio, con límites por usuario, servicio e IP.

### Archivo

`src/application/services/rate-limiter.service.ts`

### Configuraciones

| Tipo        | Límite   | Ventana | Bloqueo | Uso                        |
| ----------- | -------- | ------- | ------- | -------------------------- |
| **User**    | 100 req  | 1 min   | 5 min   | Usuario autenticado global |
| **Service** | 1000 req | 1 min   | 1 min   | Usuario por servicio       |
| **IP**      | 20 req   | 1 min   | 10 min  | Requests sin autenticación |

### Uso

```typescript
// Rate limit por usuario
await rateLimiter.checkUserLimit(userId);

// Rate limit por servicio
await rateLimiter.checkServiceLimit(userId, "resources");

// Rate limit por IP (sin auth)
await rateLimiter.checkIpLimit(req.ip);
```

### Response cuando excede

```json
{
  "statusCode": 429,
  "message": "Too Many Requests",
  "error": "Rate limit exceeded",
  "retryAfter": 300
}
```

### Configuración Personalizada

```typescript
// Límite custom para un usuario VIP
rateLimiter.setCustomUserLimit("user-123", {
  points: 1000,
  duration: 60,
  blockDuration: 60,
});
```

### Estadísticas

```typescript
// Info de rate limit para un usuario
const info = rateLimiter.getRateLimitInfo("user:user-123");
// {
//   remaining: 85,
//   limit: 100,
//   resetTime: 1730671200000,
//   isBlocked: false
// }

// Stats globales
const stats = rateLimiter.getStats();
// {
//   totalKeys: 150,
//   blockedKeys: 5,
//   activeKeys: 145
// }
```

### Limpieza Automática

```typescript
// Ejecutar periódicamente (ej: cada hora)
setInterval(() => {
  rateLimiter.cleanExpiredRecords();
}, 3600000);
```

---

## 4️⃣ Saga Pattern

### Descripción

Gestiona transacciones distribuidas con compensación automática en caso de fallo (rollback distribuido).

### Archivo

`src/application/services/saga.service.ts`

### Estados

```
PENDING → IN_PROGRESS → COMPLETED
                ↓
              FAILED → COMPENSATING → COMPENSATED
```

### Ejemplo: Crear Reserva Completa

```typescript
const sagaId = await sagaService.startSaga("CreateReservation", [
  // Paso 1: Verificar disponibilidad
  {
    service: "availability",
    action: "check-availability",
    data: { resourceId, startDate, endDate },
    compensationAction: "release-resource",
    compensationData: { resourceId },
  },

  // Paso 2: Crear reserva
  {
    service: "availability",
    action: "create-reservation",
    data: { userId, resourceId, startDate, endDate },
    compensationAction: "delete-reservation",
    compensationData: { reservationId: "${reservationId}" },
  },

  // Paso 3: Enviar notificación
  {
    service: "stockpile",
    action: "send-notification",
    data: { userId, reservationId, type: "confirmation" },
    compensationAction: "cancel-notification",
    compensationData: { notificationId: "${notificationId}" },
  },
]);

// Obtener estado
const status = sagaService.getSagaStatus(sagaId);
console.log(status.status); // 'IN_PROGRESS', 'COMPLETED', 'COMPENSATED'
```

### Flujo Exitoso

```
Step 1: check-availability → ✅ Success
Step 2: create-reservation → ✅ Success
Step 3: send-notification → ✅ Success

Saga Status: COMPLETED
```

### Flujo con Fallo (Compensación)

```
Step 1: check-availability → ✅ Success
Step 2: create-reservation → ✅ Success
Step 3: send-notification → ❌ FAILED

Compensation:
Step 2: delete-reservation → ✅ Compensated
Step 1: release-resource → ✅ Compensated

Saga Status: COMPENSATED
```

### Estadísticas

```typescript
const stats = sagaService.getStats();
// {
//   total: 100,
//   completed: 80,
//   failed: 10,
//   compensated: 10,
//   inProgress: 0
// }

// Sagas activas
const active = sagaService.getActiveSagas();
```

### Limpieza

```typescript
// Limpiar sagas completadas hace más de 1 hora
sagaService.cleanOldSagas(3600000);
```

---

## 🔧 Integración en ProxyService

### Constructor

```typescript
constructor(
  private readonly httpService: HttpService,
  private readonly kafkaService: KafkaService,
  private readonly circuitBreaker: CircuitBreakerService,
  private readonly rateLimiter: RateLimiterService,
  private readonly requestReply: RequestReplyService,
  private readonly saga: SagaService
) {}
```

### Ejemplo de Uso Completo

```typescript
async proxyRequest(
  service: string,
  path: string,
  method: string,
  body?: any,
  headers?: any,
  query?: any,
  userId?: string
): Promise<any> {
  // 1. Rate Limiting
  if (userId) {
    await this.rateLimiter.checkUserLimit(userId);
    await this.rateLimiter.checkServiceLimit(userId, service);
  } else {
    await this.rateLimiter.checkIpLimit(headers?.['x-forwarded-for'] || 'unknown');
  }

  // 2. Decidir estrategia
  if (method === 'GET') {
    // Queries con Circuit Breaker
    return await this.circuitBreaker.execute(
      service,
      async () => await this.proxyViaHttp(...),
      async () => cachedData // Fallback
    );
  } else {
    // Commands con Request-Reply
    const event = this.createEvent(service, path, body);
    return await this.requestReply.sendAndWaitReply(
      `${service}.commands`,
      event,
      30000
    );
  }
}
```

---

## 📊 Monitoring y Observabilidad

### Logs Estructurados

Todos los patrones loguean con prefijos identificadores:

```
[REQUEST-REPLY] Sending request with correlationId: abc-123
[CIRCUIT-BREAKER] Circuit OPEN for resources, rejecting request
[RATE-LIMIT] User user-123 exceeded limit
[SAGA] Started saga: CreateReservation
[SAGA] Compensating step 2: delete-reservation
```

### Health Check Endpoint

```typescript
GET /health/advanced
{
  "circuitBreakers": {
    "resources": { "state": "CLOSED", "failures": 0 },
    "availability": { "state": "HALF_OPEN", "failures": 3 }
  },
  "rateLimiter": {
    "totalKeys": 150,
    "blockedKeys": 5,
    "activeKeys": 145
  },
  "requestReply": {
    "pendingRequests": 2
  },
  "sagas": {
    "total": 100,
    "inProgress": 2,
    "completed": 90,
    "compensated": 8
  }
}
```

---

## 🚀 Inicialización

### Module Registration

```typescript
@Module({
  imports: [KafkaModule.forRoot(...)],
  providers: [
    ProxyService,
    CircuitBreakerService,
    RateLimiterService,
    RequestReplyService,
    SagaService
  ]
})
export class ApiGatewayModule {}
```

### Registrar Circuit Breakers

```typescript
// En onModuleInit
async onModuleInit() {
  // Registrar circuitos para cada servicio
  this.circuitBreaker.register('auth');
  this.circuitBreaker.register('resources');
  this.circuitBreaker.register('availability');
  this.circuitBreaker.register('stockpile');
  this.circuitBreaker.register('reports');
}
```

---

## 📚 Casos de Uso

### 1. Query con Circuit Breaker

```typescript
// GET /api/v1/resources/categories
await circuitBreaker.execute("resources", async () => {
  return await httpClient.get("/api/v1/categories");
});
```

### 2. Command con Request-Reply

```typescript
// POST /api/v1/resources/categories
const response = await requestReply.sendAndWaitReply(
  "resources.commands",
  createEvent,
  30000
);
```

### 3. Transacción Distribuida con Saga

```typescript
// POST /api/v1/reservations (reserva completa)
const sagaId = await saga.startSaga('CreateReservation', [
  { service: 'availability', action: 'check', ... },
  { service: 'availability', action: 'reserve', ... },
  { service: 'stockpile', action: 'notify', ... }
]);
```

### 4. Rate Limiting en Middleware

```typescript
@Injectable()
export class RateLimitMiddleware {
  async use(req, res, next) {
    try {
      const userId = req.user?.id;
      if (userId) {
        await rateLimiter.checkUserLimit(userId);
      } else {
        await rateLimiter.checkIpLimit(req.ip);
      }
      next();
    } catch (error) {
      res.status(429).json(error);
    }
  }
}
```

---

## ⚙️ Configuración Recomendada

### Producción

```env
# Circuit Breaker
CIRCUIT_FAILURE_THRESHOLD=5
CIRCUIT_SUCCESS_THRESHOLD=2
CIRCUIT_TIMEOUT=60000
CIRCUIT_RESET_TIMEOUT=300000

# Rate Limiting
RATE_LIMIT_USER_POINTS=100
RATE_LIMIT_SERVICE_POINTS=1000
RATE_LIMIT_IP_POINTS=20

# Request-Reply
REQUEST_REPLY_TIMEOUT=30000

# Saga
SAGA_CLEANUP_INTERVAL=3600000
```

### Desarrollo

Configuraciones más permisivas para testing:

```env
CIRCUIT_FAILURE_THRESHOLD=10
RATE_LIMIT_USER_POINTS=1000
REQUEST_REPLY_TIMEOUT=60000
```

---

## 🐛 Troubleshooting

### Circuit siempre abierto

```bash
# Ver estado
curl http://localhost:3000/health/advanced

# Reset manual
# Implementar endpoint admin: POST /admin/circuit-breaker/reset/:service
```

### Rate limit bloqueando usuarios legítimos

```bash
# Verificar stats
const stats = rateLimiter.getStats();

# Aumentar límites o custom limits para usuarios específicos
rateLimiter.setCustomUserLimit(userId, { points: 500 });
```

### Request-Reply timeout

```bash
# Verificar Kafka consumers
kafka-consumer-groups.sh --group api-gateway-consumer --describe

# Aumentar timeout
requestReply.sendAndWaitReply(topic, event, 60000); // 60s
```

### Saga no compensa correctamente

```bash
# Ver logs de saga
docker logs api-gateway | grep "\[SAGA\]"

# Verificar que compensationAction esté definido
const steps = saga.steps;
steps.forEach(step => {
  console.log(step.compensationAction); // debe existir
});
```

---

**Última actualización**: 2025-11-03  
**Versión**: 1.0.0  
**Estado**: ✅ Todos los patrones implementados y documentados
