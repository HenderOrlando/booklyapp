# API Gateway - Bookly

**Puerto**: 3000  
**Versión**: 1.0.0  
**Arquitectura**: Híbrida (HTTP + Kafka EDA)
---

## 🎯 Descripción

API Gateway unificado para todos los microservicios de Bookly. Implementa un **patrón híbrido** que combina:

- **HTTP REST** para queries (GET) - respuestas síncronas inmediatas
- **Kafka Events** para commands (POST/PUT/DELETE) - procesamiento asíncrono resiliente

---

## 🏗️ Arquitectura

```
Cliente → API Gateway:3000
            │
            ├─ GET requests    → HTTP directo  → Microservicio
            └─ POST/PUT/DELETE → Kafka eventos → Topic → Consumer
```

### Microservicios Conectados

| Servicio     | Puerto | URL                   | Tópico Kafka            |
| ------------ | ------ | --------------------- | ----------------------- |
| Auth         | 3001   | http://localhost:3001 | `auth.commands`         |
| Resources    | 3002   | http://localhost:3002 | `resources.commands`    |
| Availability | 3003   | http://localhost:3003 | `availability.commands` |
| Stockpile    | 3004   | http://localhost:3004 | `stockpile.commands`    |
| Reports      | 3005   | http://localhost:3005 | `reports.commands`      |

---

## 🚀 Inicio Rápido

### Instalación

```bash
npm install @nestjs/axios axios uuid
```

### Variables de Entorno

```env
# API Gateway
PORT=3000
NODE_ENV=development

# Kafka
KAFKA_BROKER=localhost:9092

# Microservices URLs (fallback HTTP)
AUTH_SERVICE_URL=http://localhost:3001
RESOURCES_SERVICE_URL=http://localhost:3002
AVAILABILITY_SERVICE_URL=http://localhost:3003
STOCKPILE_SERVICE_URL=http://localhost:3004
REPORTS_SERVICE_URL=http://localhost:3005

# CORS
CORS_ORIGIN=*
```

### Iniciar Servicio

```bash
# Desarrollo
npm run start:dev

# Producción
npm run start:prod

# Debug
npm run start:debug
```

### Endpoints

- **Swagger Documentation**: http://localhost:3000/api/docs
- **Health Check**: http://localhost:3000/health
- **Services Info**: http://localhost:3000/health/services
- **Proxy**: http://localhost:3000/api/v1/:service/\*

---

## 📖 Uso

### Query Example (HTTP)

```bash
# Listar categorías (GET)
curl http://localhost:3000/api/v1/resources/categories?page=1&limit=10

# Response inmediata (HTTP directo)
{
  "data": [...],
  "total": 50,
  "page": 1,
  "limit": 10
}
```

### Command Example (Kafka)

```bash
# Crear categoría (POST)
curl -X POST http://localhost:3000/api/v1/resources/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"name": "Nueva Categoría", "type": "RESOURCE"}'

# Response inmediata (evento publicado a Kafka)
{
  "success": true,
  "message": "Command accepted and queued for processing",
  "eventId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "processing"
}
```

---

## 🔧 Componentes

### ApiGatewayModule

Módulo principal que configura:

- `ConfigModule` (global)
- `HttpModule` (para requests HTTP)
- `KafkaModule` (para eventos)

### ProxyService

Servicio que implementa la lógica de routing híbrido:

- `proxyRequest()` - Decide estrategia según método HTTP
- `proxyViaHttp()` - Comunicación síncrona REST
- `proxyViaKafka()` - Publicación de eventos asíncronos
- `cleanHeaders()` - Sanitización de headers

### ProxyController

Controlador universal que captura todas las peticiones:

```typescript
@All('api/v1/:service/*')
async proxy(
  @Param('service') service: string,
  @Req() req: any,
  @Body() body: any,
  @Headers() headers: any,
  @Query() query: any
): Promise<any>
```

### HealthController

Endpoints de monitoreo:

- `GET /health` - Estado del API Gateway
- `GET /health/services` - URLs de microservicios

---

## 🛡️ Resiliencia

### Fallback Automático

Si Kafka está no disponible, el sistema hace **fallback automático a HTTP**:

```typescript
try {
  await kafkaService.publish(topic, event);
} catch (error) {
  // Fallback a HTTP
  return await this.proxyViaHttp(...);
}
```

### Retry Policy

Kafka implementa retries automáticos:

- Initial retry time: 300ms
- Max retries: 10
- Exponential backoff

---

## 📝 Logging

Todos los requests son logeados con prefijos identificadores:

```
[HTTP] Proxying GET http://localhost:3002/api/v1/categories
[KAFKA] Publishing command to topic: resources.commands
[KAFKA] Command published successfully { eventId, topic }
[KAFKA] Falling back to HTTP for resources/categories
```

---

## 🧪 Testing

### Health Check

```bash
# Verificar estado del gateway
curl http://localhost:3000/health

# Verificar servicios conectados
curl http://localhost:3000/health/services
```

### Load Testing

```bash
# Queries (HTTP)
ab -n 1000 -c 10 http://localhost:3000/api/v1/resources/categories

# Commands (Kafka)
ab -n 1000 -c 10 -p data.json -T application/json \
  http://localhost:3000/api/v1/resources/categories
```

---

## 📊 Monitoreo

### Kafka Topics

```bash
# Listar tópicos
kafka-topics.sh --list --bootstrap-server localhost:9092

# Ver mensajes
kafka-console-consumer.sh --topic resources.commands \
  --bootstrap-server localhost:9092 --from-beginning
```

### Logs del Gateway

```bash
# Ver logs en tiempo real
npm run start:dev | grep -E '\[HTTP\]|\[KAFKA\]'

# Filtrar solo errores
npm run start:dev | grep ERROR
```

---

## 📚 Documentación

- **Swagger API**: http://localhost:3000/api/docs
- **Arquitectura Híbrida**: [HYBRID_ARCHITECTURE.md](./docs/HYBRID_ARCHITECTURE.md)
- **Project Progress**: [PROGRESS.md](../../docs/PROGRESS.md)

---

## 🔐 Seguridad

### Headers Permitidos

El gateway solo forwarea headers esenciales:

- `authorization`
- `content-type`
- `accept`

### CORS

Configurable via `CORS_ORIGIN` env variable.

### JWT Validation

Los microservicios validan JWT, no el gateway. El gateway solo actúa como proxy.

---

## 🚦 Estados de Respuesta

### HTTP Queries

- `200` - OK
- `404` - Service/Resource not found
- `500` - Internal server error
- `503` - Service unavailable

### Kafka Commands

- `200` - Command accepted
  ```json
  {
    "success": true,
    "eventId": "uuid",
    "status": "processing"
  }
  ```
- `404` - Service not found
- `500` - Kafka publish error (con fallback a HTTP)

---

## 🐛 Troubleshooting

### Kafka no conecta

```bash
# Verificar si Kafka está corriendo
nc -zv localhost 9092

# Ver logs de Kafka
docker logs bookly-kafka

# Fallback automático a HTTP se activa
```

### Microservicio no responde

```bash
# Verificar estado del servicio
curl http://localhost:3002/health

# Ver logs del servicio
docker logs bookly-resources-service
```

### Gateway no inicia

```bash
# Verificar dependencias
npm install

# Verificar puerto 3000 disponible
lsof -i :3000

# Ver logs detallados
npm run start:dev
```

---

## 📦 Dependencias Principales

```json
{
  "@nestjs/common": "^10.0.0",
  "@nestjs/core": "^10.0.0",
  "@nestjs/axios": "^3.0.0",
  "@nestjs/config": "^3.0.0",
  "@nestjs/swagger": "^7.0.0",
  "kafkajs": "^2.2.4",
  "axios": "^1.6.0",
  "uuid": "^9.0.0"
}
```

---

## 🎯 Próximos Pasos

- [ ] Request-Reply pattern con correlationId
- [ ] Circuit breaker para microservicios
- [ ] Rate limiting por usuario/servicio
- [ ] Métricas con Prometheus
- [ ] Distributed tracing con OpenTelemetry

---

**Desarrollado para**: Universidad Francisco de Paula Santander (UFPS)  
**Proyecto**: Bookly - Sistema de Reservas Institucionales  
**Última actualización**: 2025-11-03
