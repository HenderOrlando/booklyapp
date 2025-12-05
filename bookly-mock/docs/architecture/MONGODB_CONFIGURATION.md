# MongoDB Configuration - Bookly Mock

## 🗄️ Arquitectura de Bases de Datos

Bookly utiliza **múltiples bases de datos MongoDB** separadas por servicio para cumplir con los principios de arquitectura de microservicios.

### Servicios y Puertos MongoDB

| Servicio                 | Puerto | Database            | DLQ Habilitado   |
| ------------------------ | ------ | ------------------- | ---------------- |
| **auth-service**         | 27017  | bookly-auth         | ✅               |
| **resources-service**    | 27018  | bookly-resources    | ✅               |
| **availability-service** | 27019  | bookly-availability | ✅               |
| **stockpile-service**    | 27020  | bookly-stockpile    | ✅               |
| **reports-service**      | 27021  | bookly-reports      | ✅               |
| **api-gateway**          | 27022  | bookly-gateway      | ✅ (Event Store) |

## 🔑 Credenciales por Defecto

- **Usuario**: `bookly`
- **Password**: `bookly123`
- **Auth Database**: `admin`

## 📝 URLs de Conexión Actualizadas

Todos los servicios ahora usan credenciales de autenticación por defecto:

- **auth-service**: `mongodb://bookly:bookly123@localhost:27017/bookly-auth?authSource=admin`
- **resources-service**: `mongodb://bookly:bookly123@localhost:27018/bookly-resources?authSource=admin`
- **availability-service**: `mongodb://bookly:bookly123@localhost:27019/bookly-availability?authSource=admin`
- **stockpile-service**: `mongodb://bookly:bookly123@localhost:27020/bookly-stockpile?authSource=admin`
- **reports-service**: `mongodb://bookly:bookly123@localhost:27021/bookly-reports?authSource=admin`
- **api-gateway**: `mongodb://bookly:bookly123@localhost:27022/bookly-gateway?authSource=admin`

## 🚀 Quick Start

1. **Iniciar MongoDB**:

```bash
cd bookly-mock
docker-compose up -d mongodb-auth mongodb-resources mongodb-availability mongodb-stockpile mongodb-reports mongodb-gateway
```

2. **Verificar servicios**:

```bash
docker ps | grep mongodb
```

3. **Iniciar servicios de Bookly**:

```bash
npm run start:auth
npm run start:resources
npm run start:availability
npm run start:stockpile
npm run start:reports
npm run start:gateway
```

## ✅ Verificación de DLQ

Cuando MongoDB está correctamente configurado, debes ver:

```
[DeadLetterQueueService] ℹ️ DLQ Service initialized with auto-retry enabled
```

En lugar de:

```
[DeadLetterQueueService] ⚠️ DLQ Service initialized without auto-retry (MongoDB authentication required)
```

## 🎯 Beneficios del DLQ con MongoDB

1. **Persistencia de Eventos Fallidos**: Eventos que fallan se guardan automáticamente
2. **Retry Automático**: Reintenta eventos fallidos cada 30 segundos
3. **Auditoría**: Registro completo de todos los fallos y reintentos
4. **Análisis**: Estadísticas sobre tipos de errores y servicios afectados
5. **Recuperación Manual**: API para reintentar o resolver eventos manualmente

## 📊 Monitoreo del DLQ

### API Endpoints (en api-gateway)

- `GET /api/v1/dlq/stats` - Estadísticas del DLQ
- `GET /api/v1/dlq/events` - Listar eventos en DLQ
- `POST /api/v1/dlq/retry/:id` - Reintentar evento manualmente
- `POST /api/v1/dlq/resolve/:id` - Resolver evento manualmente
- `DELETE /api/v1/dlq/:id` - Eliminar evento del DLQ

### Consultar MongoDB directamente

```bash
mongosh "mongodb://bookly:bookly123@localhost:27017/bookly-auth?authSource=admin"

use bookly-auth
db.dead_letter_queue.find().pretty()
```

## 🔧 Troubleshooting

### Error: "Command find requires authentication"

**Causa**: MongoDB requiere autenticación pero no está configurada

**Solución**: Asegúrate de usar las URLs con credenciales (ver arriba)

### Error: "Connection refused"

**Causa**: MongoDB no está corriendo

**Solución**:

```bash
docker-compose up -d mongodb-auth
```

### DLQ no se inicia

**Verificar logs**:

```bash
npm run start:auth | grep DLQ
```

**Verificar MongoDB**:

```bash
docker logs bookly-mongodb-auth
```

---

**Fecha**: 2024-11-19  
**Versión**: 2.0.0  
**Estado**: ✅ Producción
