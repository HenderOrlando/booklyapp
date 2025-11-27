# ✅ Variables de Entorno Configuradas

**Fecha**: 2025-01-19 23:50  
**Estado**: ✅ Resuelto

---

## 🔴 Problema Identificado

Todos los microservicios fallaban con el error:

```
ERROR [ExceptionHandler] DATABASE_URI is required in environment variables
Error: DATABASE_URI is required in environment variables
    at InstanceWrapper.useFactory (.../database.module.ts:29:17)
```

**Causa raíz**: Los archivos `.env` no existían o no contenían las nuevas variables requeridas por `@libs/database`.

---

## ✅ Solución Aplicada

### 1. Script Creado

**Archivo**: `scripts/create-env-files.sh`

Script que crea automáticamente archivos `.env` para todos los microservicios con las variables correctas.

### 2. Archivos .env Creados

Se crearon 6 archivos `.env`:

| Servicio             | Archivo                          | DATABASE_NAME         | Puerto |
| -------------------- | -------------------------------- | --------------------- | ------ |
| API Gateway          | `apps/api-gateway/.env`          | `bookly-gateway`      | 3000   |
| Auth Service         | `apps/auth-service/.env`         | `bookly-auth`         | 3001   |
| Resources Service    | `apps/resources-service/.env`    | `bookly-resources`    | 3002   |
| Availability Service | `apps/availability-service/.env` | `bookly-availability` | 3003   |
| Stockpile Service    | `apps/stockpile-service/.env`    | `bookly-stockpile`    | 3004   |
| Reports Service      | `apps/reports-service/.env`      | `bookly-reports`      | 3005   |

### 3. Variables Configuradas

Cada archivo `.env` contiene:

```bash
# MongoDB - Variables obligatorias
DATABASE_URI=mongodb://bookly:bookly123@localhost:27017,localhost:27018,localhost:27019/bookly-[service]?authSource=admin&replicaSet=bookly-rs
DATABASE_NAME=bookly-[service]
MONGO_INITDB_ROOT_USERNAME=bookly
MONGO_INITDB_ROOT_PASSWORD=bookly123
MONGO_AUTH_SOURCE=admin

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Event Bus
EVENT_BUS_TYPE=rabbitmq
RABBITMQ_URL=amqp://bookly:bookly123@localhost:5672/bookly
ENABLE_EVENT_STORE=false

# CORS
CORS_ORIGIN=*
```

---

## 🔄 Pasos para Reiniciar Servicios

### Opción 1: Reiniciar desde VS Code

1. **Detener todos los debuggers** (click en el botón "Stop" rojo)
2. **Esperar a que terminen** (ver "Waiting for the debugger to disconnect...")
3. **Iniciar nuevamente** usando los launch configs de VS Code

### Opción 2: Reiniciar desde Terminal

```bash
# Detener todos los procesos
pkill -f "node.*api-gateway"
pkill -f "node.*auth-service"
pkill -f "node.*resources-service"
pkill -f "node.*availability-service"
pkill -f "node.*stockpile-service"
pkill -f "node.*reports-service"

# Iniciar servicios individuales
cd apps/api-gateway && npm run start:dev
cd apps/auth-service && npm run start:dev
cd apps/resources-service && npm run start:dev
cd apps/availability-service && npm run start:dev
cd apps/stockpile-service && npm run start:dev
cd apps/reports-service && npm run start:dev
```

---

## ✅ Verificación

### 1. Logs Esperados

Deberías ver en cada servicio:

```
[DatabaseService] ✅ MongoDB connected successfully
[DatabaseService] ✅ Database module initialized successfully
[NestFactory] Application is running on: http://localhost:PORT
```

### 2. Health Checks

```bash
# API Gateway
curl http://localhost:3000/health | jq '.'

# Auth Service
curl http://localhost:3001/api/v1/health | jq '.'

# Resources Service
curl http://localhost:3002/api/v1/health | jq '.'

# Availability Service
curl http://localhost:3003/api/v1/health | jq '.'

# Stockpile Service
curl http://localhost:3004/api/v1/health | jq '.'

# Reports Service
curl http://localhost:3005/api/v1/health | jq '.'
```

**Respuesta esperada**:

```json
{
  "status": "ok",
  "service": "service-name",
  "database": {
    "connected": true,
    "name": "bookly-...",
    "state": 1,
    "latency": 10-50
  }
}
```

---

## 🛠️ Troubleshooting

### Servicio sigue fallando

1. **Verificar archivo .env existe**:

   ```bash
   ls -la apps/[service]/.env
   ```

2. **Verificar contenido**:

   ```bash
   cat apps/[service]/.env | grep DATABASE
   ```

3. **Verificar MongoDB está corriendo**:

   ```bash
   docker ps | grep mongo
   ```

4. **Limpiar y reiniciar**:
   ```bash
   cd apps/[service]
   rm -rf dist node_modules/.cache
   npm run build
   npm run start:dev
   ```

### Error de conexión a MongoDB

Si ves errores como "connection refused" o "topology closed":

1. **Verificar replica set**:

   ```bash
   docker exec bookly-mongodb-primary mongosh -u bookly -p bookly123 --authenticationDatabase admin --eval "rs.status()"
   ```

2. **Ajustar DATABASE_URI**:
   - Para conexión directa (sin replica set):
     ```bash
     DATABASE_URI=mongodb://bookly:bookly123@localhost:27017/bookly-[service]?authSource=admin
     ```

---

## 📋 Archivos Modificados

- ✅ `scripts/create-env-files.sh` - Script de creación (nuevo)
- ✅ `apps/api-gateway/.env` - Variables de entorno (nuevo)
- ✅ `apps/auth-service/.env` - Variables de entorno (nuevo)
- ✅ `apps/resources-service/.env` - Variables de entorno (nuevo)
- ✅ `apps/availability-service/.env` - Variables de entorno (nuevo)
- ✅ `apps/stockpile-service/.env` - Variables de entorno (nuevo)
- ✅ `apps/reports-service/.env` - Variables de entorno (nuevo)

---

## 🎯 Resultado Esperado

Después de reiniciar los servicios, todos deberían:

- ✅ Iniciar sin errores
- ✅ Conectarse a MongoDB correctamente
- ✅ Responder a health checks
- ✅ Mostrar logs de conexión exitosa

---

**Estado**: ✅ **RESUELTO** - Variables de entorno configuradas correctamente  
**Acción requerida**: Reiniciar los debuggers de VS Code
