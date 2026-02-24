# ✅ Conexión MongoDB Corregida

**Fecha**: 2025-01-20 00:06  
**Estado**: ✅ RESUELTO

---

## 🔴 Problema Detectado

Los servicios intentaban conectarse a un **replica set inexistente**:

```
DATABASE_URI=mongodb://bookly:bookly123@localhost:27017,localhost:27018,localhost:27019/bookly-[service]?authSource=admin&replicaSet=bookly-rs
```

Error resultante:

```
ERROR [MongooseModule] Unable to connect to the database. Retrying (1)...
MongooseServerSelectionError: Server selection timed out after 30000 ms
```

---

## ✅ Solución Aplicada

Cada servicio tiene su **propia instancia MongoDB** en **puertos diferentes**:

| Servicio         | Puerto | Contenedor Docker                  | URI Correcta                                                                      |
| ---------------- | ------ | ---------------------------------- | --------------------------------------------------------------------------------- |
| **Auth**         | 27017  | `bookly-backend-mongodb-auth`         | `mongodb://bookly:bookly123@localhost:27017/bookly-auth?authSource=admin`         |
| **Resources**    | 27018  | `bookly-backend-mongodb-resources`    | `mongodb://bookly:bookly123@localhost:27018/bookly-resources?authSource=admin`    |
| **Availability** | 27019  | `bookly-backend-mongodb-availability` | `mongodb://bookly:bookly123@localhost:27019/bookly-availability?authSource=admin` |
| **Stockpile**    | 27020  | `bookly-backend-mongodb-stockpile`    | `mongodb://bookly:bookly123@localhost:27020/bookly-stockpile?authSource=admin`    |
| **Reports**      | 27021  | `bookly-backend-mongodb-reports`      | `mongodb://bookly:bookly123@localhost:27021/bookly-reports?authSource=admin`      |
| **API Gateway**  | 27022  | `bookly-backend-mongodb-gateway`      | `mongodb://bookly:bookly123@localhost:27022/bookly-gateway?authSource=admin`      |

### Cambios Realizados

✅ Actualicé las URIs en todos los archivos `.env` para **conexión directa simple** (sin replica set)

---

## 🔄 Acción Requerida: REINICIAR DEBUGGERS NUEVAMENTE

Los debuggers actuales todavía tienen las URIs antiguas en memoria.

### Opción 1: Reiniciar Desde VS Code (Recomendado)

1. **Detén TODOS los debuggers activos**:
   - Ve al panel Debug (Cmd+Shift+D)
   - Click en **Stop** (⏹️) para cada uno
   - Espera "Waiting for the debugger to disconnect..."

2. **Limpia procesos huérfanos** (importante):

   ```bash
   pkill -f "node.*-service"
   ```

3. **Inicia nuevamente**:
   - F5 en cada servicio individual
   - O usa "Debug All Services (Mock)"

### Opción 2: Reiniciar Desde Terminal

```bash
# Ir al directorio del monorepo
cd /Users/henderorlando/Documents/GitHub/bookly-monorepo/bookly-backend

# Detener todos los procesos
pkill -9 -f "node.*start:.*:debug"
pkill -9 -f "ts-node-dev"

# Esperar 3 segundos
sleep 3

# Verificar que no queden procesos
ps aux | grep -E "(start:|debug)" | grep -v grep

# Luego iniciar desde VS Code
```

---

## ✅ Logs Esperados (CORRECTO)

Después de reiniciar con las nuevas URIs:

```
[NestFactory] Starting Nest application...
[InstanceLoader] MongooseModule dependencies initialized
[DatabaseService] ✅ MongoDB connected successfully
[DatabaseService] ✅ Database module initialized successfully
{
  database: 'bookly-[service]',
  host: 'localhost',
  state: 'connected'
}
[NestApplication] Nest application successfully started
```

**SIN** estos errores:

- ❌ `DATABASE_URI is required`
- ❌ `Server selection timed out`
- ❌ `Unable to connect to the database`

---

## 🔍 Verificación

### 1. Verificar MongoDB está corriendo

```bash
docker ps --filter "name=mongo"
```

Deberías ver 6 contenedores:

- ✅ bookly-backend-mongodb-auth (27017)
- ✅ bookly-backend-mongodb-resources (27018)
- ✅ bookly-backend-mongodb-availability (27019)
- ✅ bookly-backend-mongodb-stockpile (27020)
- ✅ bookly-backend-mongodb-reports (27021)
- ✅ bookly-backend-mongodb-gateway (27022)

### 2. Probar conexión directa

```bash
# Auth Service (puerto 27017)
docker exec bookly-backend-mongodb-auth mongosh -u bookly -p bookly123 --authenticationDatabase admin --eval "db.version()"

# Resources Service (puerto 27018)
docker exec bookly-backend-mongodb-resources mongosh -u bookly -p bookly123 --authenticationDatabase admin --eval "db.version()"
```

### 3. Health Checks una vez corriendo

```bash
curl http://localhost:3000/health | jq '.'  # API Gateway
curl http://localhost:3001/api/v1/health | jq '.'  # Auth
curl http://localhost:3002/api/v1/health | jq '.'  # Resources
curl http://localhost:3003/api/v1/health | jq '.'  # Availability
curl http://localhost:3004/api/v1/health | jq '.'  # Stockpile
curl http://localhost:3005/api/v1/health | jq '.'  # Reports
```

**Respuesta esperada**:

```json
{
  "status": "ok",
  "database": {
    "isHealthy": true,
    "state": 1,
    "database": "bookly-[service]",
    "latency": 5-20
  }
}
```

---

## 📊 Resumen de Correcciones

### Antes (❌ Fallaba)

```bash
# Intentaba conectarse a replica set inexistente
DATABASE_URI=mongodb://bookly:bookly123@localhost:27017,localhost:27018,localhost:27019/bookly-[service]?authSource=admin&replicaSet=bookly-rs
```

### Después (✅ Funciona)

```bash
# Conexión directa a instancia individual
DATABASE_URI=mongodb://bookly:bookly123@localhost:[PORT]/bookly-[service]?authSource=admin
```

---

## 🎯 Estado Final

| Item                                        | Estado |
| ------------------------------------------- | ------ |
| Archivos `.env` existen                     | ✅     |
| Variables `DATABASE_URI` correctas          | ✅     |
| Variables `DATABASE_NAME` correctas         | ✅     |
| `envFilePath` apunta correctamente          | ✅     |
| URIs usan conexión directa (no replica set) | ✅     |
| Puertos coinciden con contenedores Docker   | ✅     |
| **Listo para reiniciar debuggers**          | ✅     |

---

## ⚠️ Si Aún Falla

### 1. Verificar contenedor específico está corriendo

```bash
docker ps --filter "name=bookly-backend-mongodb-[service]" --format "{{.Names}}: {{.Status}}"
```

### 2. Ver logs del contenedor

```bash
docker logs bookly-backend-mongodb-[service] --tail 50
```

### 3. Reiniciar contenedor específico

```bash
docker restart bookly-backend-mongodb-[service]
docker logs -f bookly-backend-mongodb-[service]
```

### 4. Verificar puerto está escuchando

```bash
lsof -iTCP:27017 -sTCP:LISTEN  # Auth
lsof -iTCP:27018 -sTCP:LISTEN  # Resources
lsof -iTCP:27019 -sTCP:LISTEN  # Availability
lsof -iTCP:27020 -sTCP:LISTEN  # Stockpile
lsof -iTCP:27021 -sTCP:LISTEN  # Reports
lsof -iTCP:27022 -sTCP:LISTEN  # Gateway
```

---

## 🚀 Acción Inmediata Requerida

### PASO 1: Detener Debuggers

Detén todos los debuggers activos en VS Code (botón ⏹️)

### PASO 2: Limpiar Procesos

```bash
pkill -f "node.*-service"
```

### PASO 3: Reiniciar

Inicia los debuggers nuevamente desde VS Code (F5)

---

**Estado**: ✅ **URIs CORREGIDAS** - Esperando reinicio de debuggers  
**Próximo paso**: Reiniciar debuggers para cargar nuevas URIs de conexión
