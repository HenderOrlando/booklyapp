# API Gateway - Arquitectura Híbrida con EDA

## 🎯 Patrón Implementado

El API Gateway implementa un **patrón híbrido** que combina lo mejor de dos mundos:

### 📖 Queries (GET) → HTTP Directo

- Comunicación síncrona REST
- Respuestas inmediatas
- Ideal para lecturas y consultas
- Baja latencia

### ⚡ Commands (POST/PUT/DELETE/PATCH) → Kafka Eventos

- Event-Driven Architecture (EDA)
- Procesamiento asíncrono
- Alta resiliencia
- Desacoplamiento temporal

---

## 🏗️ Arquitectura

```
┌─────────────┐
│   Cliente   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│         API Gateway (3000)          │
│                                     │
│  ┌─────────────────────────────┐  │
│  │     ProxyService            │  │
│  │                             │  │
│  │  ┌──────────┐  ┌──────────┐│  │
│  │  │   GET    │  │  POST/   ││  │
│  │  │ Queries  │  │ PUT/DEL  ││  │
│  │  └────┬─────┘  └────┬─────┘│  │
│  └───────│─────────────│──────┘  │
└──────────│─────────────│─────────┘
           │             │
       HTTP│             │Kafka
           ▼             ▼
    ┌──────────┐  ┌─────────────┐
    │Microserv.│  │Kafka Broker │
    │(REST API)│  │  Topics:    │
    └──────────┘  │- auth.cmds  │
                  │- rsrcs.cmds │
                  │- avail.cmds │
                  │- stock.cmds │
                  │- rprts.cmds │
                  └─────────────┘
```

---

## 🔧 Implementación Técnica

### ProxyService

```typescript
async proxyRequest(
  service: string,
  path: string,
  method: string,
  body?: any,
  headers?: any,
  query?: any
): Promise<any> {
  // Decisión de estrategia según método HTTP
  if (method.toUpperCase() === 'GET') {
    // Queries → HTTP directo
    return await this.proxyViaHttp(...);
  } else {
    // Commands → Kafka eventos
    return await this.proxyViaKafka(...);
  }
}
```

### Proxy vía HTTP (Queries)

```typescript
private async proxyViaHttp(...): Promise<any> {
  const url = `${serviceUrl}/api/v1${path}`;

  const response = await firstValueFrom(
    this.httpService.request({
      method,
      url,
      data: body,
      headers: this.cleanHeaders(headers),
      params: query,
    })
  );

  return response.data;
}
```

### Proxy vía Kafka (Commands)

```typescript
private async proxyViaKafka(...): Promise<any> {
  const eventId = uuidv4();
  const topic = `${service}.commands`;

  const event: EventPayload = {
    eventId,
    eventType: `${service}.${method}.${path}`,
    timestamp: new Date(),
    service: 'api-gateway',
    data: { service, path, method, body, query, headers }
  };

  // Publicar a Kafka
  await this.kafkaService.publish(topic, event);

  // Respuesta inmediata (Fire-and-forget)
  return {
    success: true,
    message: 'Command accepted and queued for processing',
    eventId,
    status: 'processing'
  };
}
```

---

## 📊 Tópicos de Kafka

| Servicio     | Tópico                  | Descripción               |
| ------------ | ----------------------- | ------------------------- |
| Auth         | `auth.commands`         | Comandos de autenticación |
| Resources    | `resources.commands`    | Gestión de recursos       |
| Availability | `availability.commands` | Reservas y disponibilidad |
| Stockpile    | `stockpile.commands`    | Aprobaciones y flujos     |
| Reports      | `reports.commands`      | Generación de reportes    |

---

## 🔄 Flujos de Comunicación

### Flujo Query (GET)

```
Cliente → API Gateway → HTTP Request → Microservicio → Response → Cliente
         [Síncrono, latencia baja ~50-200ms]
```

### Flujo Command (POST/PUT/DELETE)

```
Cliente → API Gateway → Kafka Event → Topic → Consumer (Microservicio)
                      ↓
            Response inmediata:
            { success: true, eventId, status: "processing" }
```

---

## ⚡ Ventajas del Patrón Híbrido

### Queries (HTTP)

✅ **Respuestas inmediatas** - El usuario obtiene datos al instante  
✅ **Baja latencia** - Ideal para consultas frecuentes  
✅ **Simplicidad** - No requiere procesamiento asíncrono  
✅ **Caching fácil** - Compatible con estrategias de cache

### Commands (Kafka)

✅ **Resiliencia** - Si un servicio cae, el evento se procesa después  
✅ **Desacoplamiento** - Servicios no necesitan conocerse entre sí  
✅ **Escalabilidad** - Fácil añadir consumidores para procesamiento paralelo  
✅ **Auditoría** - Todos los eventos quedan registrados en Kafka  
✅ **Retry automático** - Kafka reintenta entregas fallidas

---

## 🛡️ Resiliencia y Fallback

Si Kafka está **no disponible**, el sistema tiene un **fallback automático a HTTP**:

```typescript
try {
  await this.kafkaService.publish(topic, event);
  return { success: true, eventId, status: 'processing' };
} catch (error) {
  // Fallback a HTTP si Kafka falla
  this.logger.warn(`[KAFKA] Falling back to HTTP`);
  return await this.proxyViaHttp(...);
}
```

---

## 🔧 Configuración

### Variables de Entorno

```env
# Kafka Configuration
KAFKA_BROKER=localhost:9092
# Para múltiples brokers: KAFKA_BROKER=broker1:9092,broker2:9092,broker3:9092

# Microservices URLs (fallback HTTP)
AUTH_SERVICE_URL=http://localhost:3001
RESOURCES_SERVICE_URL=http://localhost:3002
AVAILABILITY_SERVICE_URL=http://localhost:3003
STOCKPILE_SERVICE_URL=http://localhost:3004
REPORTS_SERVICE_URL=http://localhost:3005
```

### Module Configuration

```typescript
KafkaModule.forRoot({
  clientId: "api-gateway",
  brokers: process.env.KAFKA_BROKER?.split(",") || ["localhost:9092"],
});
```

---

## 📝 Ejemplos de Uso

### Query Example (GET)

```bash
# Request
GET /api/v1/resources/categories?page=1&limit=10

# Flujo:
API Gateway → HTTP → resources-service:3002 → Response inmediata
```

### Command Example (POST)

```bash
# Request
POST /api/v1/resources/categories
Body: { name: "Nueva Categoría", type: "RESOURCE" }

# Flujo:
API Gateway → Kafka → resources.commands → Response:
{
  "success": true,
  "message": "Command accepted and queued for processing",
  "eventId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "processing"
}

# Procesamiento asíncrono:
Consumer en resources-service procesa el evento
```

---

## 🔍 Logging y Monitoreo

Todos los requests son logeados con prefijos según el canal:

```
[HTTP] Proxying GET http://localhost:3002/api/v1/categories
[KAFKA] Publishing command to topic: resources.commands
[KAFKA] Command published successfully { eventId, topic }
[KAFKA] Falling back to HTTP for resources/categories
```

---

## 📚 Referencias

- **CQRS Pattern**: Command Query Responsibility Segregation
- **EDA**: Event-Driven Architecture
- **Kafka**: Apache Kafka for event streaming
- **Hybrid Pattern**: Combining synchronous and asynchronous communication

---

## 🚀 Próximos Pasos

1. **Request-Reply Pattern**: Implementar correlationId para esperar respuesta de Kafka
2. **Saga Pattern**: Para transacciones distribuidas
3. **Circuit Breaker**: Para manejar fallos de microservicios
4. **Rate Limiting**: Por servicio y por usuario
5. **Metrics**: Prometheus para métricas de latencia y throughput

---

**Última actualización**: 2025-11-03  
**Versión**: 1.0.0  
**Estado**: ✅ Implementado y funcionando
