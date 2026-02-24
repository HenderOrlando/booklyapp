# 🚀 DEPLOYMENT LOCAL - Node.js

Guía completa para desplegar Bookly-Mock en entorno local usando Node.js.

## 📋 Prerrequisitos

### Software Requerido

- **Node.js** 18+
- **npm** o **yarn**
- **Git**
- **VS Code** (recomendado para debugging)

### Verificación de Versiones

```bash
node --version  # >= 18.0.0
npm --version   # >= 8.0.0
git --version   # >= 2.0.0
```

## 🏗️ Arquitectura Local

### Microservicios y Puertos

| Servicio             | Puerto | Descripción                  |
| -------------------- | ------ | ---------------------------- |
| API Gateway          | 3000   | Entrada centralizada         |
| Auth Service         | 3001   | Autenticación y autorización |
| Resources Service    | 3002   | Gestión de recursos          |
| Availability Service | 3003   | Reservas y disponibilidad    |
| Stockpile Service    | 3004   | Aprobaciones y workflows     |
| Reports Service      | 3005   | Reportes y analytics         |

### Infraestructura Local

- **MongoDB**: 6 bases de datos (puertos 27017-27022)
- **Redis**: Cache (puerto 6379)
- **Kafka**: Event bus (puerto 9092)
- **Zookeeper**: Coordinación Kafka (puerto 2181)

## 🚀 Pasos de Deployment

### 1. Clonar y Configurar

```bash
# Clonar repositorio
git clone <repository-url>
cd bookly-monorepo/bookly-mock

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
```

### 2. Configurar Variables de Entorno

Edita `.env` con tu configuración local:

```bash
# Entorno
NODE_ENV=development

# Base de Datos
MONGODB_URI=mongodb://localhost:27017/bookly_auth
MONGODB_RESOURCES_URI=mongodb://localhost:27018/bookly_resources
MONGODB_AVAILABILITY_URI=mongodb://localhost:27019/bookly_availability
MONGODB_STOCKPILE_URI=mongodb://localhost:27020/bookly_stockpile
MONGODB_REPORTS_URI=mongodb://localhost:27021/bookly_reports
MONGODB_GATEWAY_URI=mongodb://localhost:27022/bookly_gateway

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Kafka
KAFKA_BROKER=localhost:9092

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-secret-key

# Simulación (opcional)
SIMULATE_NETWORK_LATENCY=false
ERROR_SIMULATION_RATE=0
```

### 3. Iniciar Infraestructura

```bash
# Iniciar Docker containers para infraestructura
docker-compose up -d

# Verificar que todo esté healthy
docker-compose ps

# Esperar 30 segundos para que los servicios estén listos
sleep 30
```

### 4. Poblar Base de Datos

```bash
# Ejecutar seeds para todos los servicios
npm run seed:all

# Verificar que los datos se cargaron correctamente
npm run validate:seeds
```

### 5. Iniciar Servicios

#### Opción A: Todos los Servicios Simultáneamente

```bash
npm run start:all
```

#### Opción B: Servicios Individuales (Recomendado para Desarrollo)

```bash
# Terminal 1 - API Gateway
npm run start:gateway

# Terminal 2 - Auth Service
npm run start:auth

# Terminal 3 - Resources Service
npm run start:resources

# Terminal 4 - Availability Service
npm run start:availability

# Terminal 5 - Stockpile Service
npm run start:stockpile

# Terminal 6 - Reports Service
npm run start:reports
```

## 🔍 Verificación del Deployment

### Health Checks

```bash
# Verificar cada servicio
curl http://localhost:3000/health          # API Gateway
curl http://localhost:3001/api/v1/health    # Auth Service
curl http://localhost:3002/api/v1/health    # Resources Service
curl http://localhost:3003/api/v1/health    # Availability Service
curl http://localhost:3004/api/v1/health    # Stockpile Service
curl http://localhost:3005/api/v1/health    # Reports Service
```

### Documentación API

- **Swagger Agregado**: http://localhost:3000/api/docs
- **Swagger Individual**: http://localhost:300X/api/docs

### Test de Conectividad

```bash
# Test básico de API Gateway
curl http://localhost:3000/api/v1/users/ping

# Test de autenticación
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@ufps.edu.co", "password": "123456"}'
```

## 🛠️ Modos de Ejecución

### Development (Watch Mode)

```bash
npm run start:gateway      # Recarga automática
npm run start:auth         # Recarga automática
# ... etc
```

### Debug Mode

```bash
npm run start:gateway:debug    # Debugger en puerto 9229
npm run start:auth:debug       # Debugger en puerto 9230
# ... etc
```

### Production Mode

```bash
# Build todos los servicios
npm run build:all

# Ejecutar en producción
npm run start:prod
```

## 📊 Monitoreo Local

### Logs en Tiempo Real

```bash
# Ver logs de todos los servicios
npm run start:all  # Los logs aparecen en consola

# Logs de infraestructura Docker
docker-compose logs -f
```

### Métricas Básicas

```bash
# Uso de memoria por proceso
ps aux | grep node

# Conexiones activas por puerto
netstat -an | grep :300
```

## 🔧 Troubleshooting Local

### Problemas Comunes

#### Puerto en Uso

```bash
# Identificar proceso
lsof -ti:3000

# Matar proceso
kill -9 $(lsof -ti:3000)
```

#### MongoDB No Responde

```bash
# Reiniciar MongoDB containers
docker-compose restart mongodb

# Ver logs
docker-compose logs mongodb
```

#### Redis Connection Refused

```bash
# Verificar Redis container
docker-compose ps redis

# Reiniciar si es necesario
docker-compose restart redis
```

#### Kafka Topics No Creados

```bash
# Acceder al container Kafka
docker-compose exec kafka bash

# Crear topics manualmente
kafka-topics --create --topic reservation.events --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
```

### Limpieza Completa

```bash
# Detener servicios
pkill -f "node.*nest"

# Limpiar builds
rm -rf dist/

# Limpiar Docker
docker-compose down -v

# Reiniciar todo
docker-compose up -d
npm run build:all
npm run start:all
```

## 🚀 Buenas Prácticas

### 1. Gestión de Procesos

Usa `pm2` para producción local:

```bash
npm install -g pm2
pm2 start ecosystem.config.js
pm2 monit
```

### 2. Variables de Entorno

Nunca commits `.env`:

```bash
echo ".env" >> .gitignore
```

### 3. Hot Reload

Configura VS Code para auto-reload:

```json
{
  "files.watcherExclude": {
    "**/node_modules": true,
    "**/dist": true
  }
}
```

### 4. Performance Local

Aumenta límites de Node.js:

```bash
export NODE_OPTIONS="--max-old-space-size=4096"
```

## 📝 Checklist de Deployment Local

- [ ] Node.js 18+ instalado
- [ ] Docker corriendo
- [ ] `.env` configurado
- [ ] Infraestructura Docker healthy
- [ ] Seeds ejecutados
- [ ] Todos los servicios iniciados
- [ ] Health checks pasan
- [ ] Swagger accesible
- [ ] Test de autenticación funciona

## 🆘 Soporte

### Comandos Útiles

```bash
# Ver todos los scripts disponibles
npm run

# Test de conectividad completa
npm run test:logger

# Validar configuración
npm run validate:seeds
```

### Recursos

- [Documentación completa](../docs/INDEX.md)
- [Guía de debugging](../docs/DEBUG_README.md)
- [Guía de servicios](../docs/development/RUNNING_SERVICES.md)
