# 🐳 DEPLOYMENT DOCKER - Docker Local

Guía completa para desplegar Bookly-Mock usando Docker local con contenedores.

## 📋 Prerrequisitos

### Software Requerido

- **Docker** 20.10+
- **Docker Compose** 2.0+
- **Git**
- **VS Code** (recomendado para debugging)

### Verificación de Versiones

```bash
docker --version     # >= 20.10.0
docker-compose --version  # >= 2.0.0
git --version       # >= 2.0.0
```

### Configuración Docker

```bash
# Verificar Docker daemon
docker info

# Verificar recursos disponibles
docker system df
```

## 🏗️ Arquitectura Docker

### Contenedores de Microservicios

| Contenedor           | Puerto | Imagen                      | Descripción          |
| -------------------- | ------ | --------------------------- | -------------------- |
| api-gateway          | 3000   | bookly/api-gateway          | Entrada centralizada |
| auth-service         | 3001   | bookly/auth-service         | Autenticación        |
| resources-service    | 3002   | bookly/resources-service    | Gestión de recursos  |
| availability-service | 3003   | bookly/availability-service | Reservas             |
| stockpile-service    | 3004   | bookly/stockpile-service    | Aprobaciones         |
| reports-service      | 3005   | bookly/reports-service      | Reportes             |

### Contenedores de Infraestructura

| Contenedor           | Puerto | Imagen                          | Descripción                |
| -------------------- | ------ | ------------------------------- | -------------------------- |
| mongodb-auth         | 27017  | mongo:7.0                       | Base de datos auth         |
| mongodb-resources    | 27018  | mongo:7.0                       | Base de datos resources    |
| mongodb-availability | 27019  | mongo:7.0                       | Base de datos availability |
| mongodb-stockpile    | 27020  | mongo:7.0                       | Base de datos stockpile    |
| mongodb-reports      | 27021  | mongo:7.0                       | Base de datos reports      |
| mongodb-gateway      | 27022  | mongo:7.0                       | Base de datos gateway      |
| redis                | 6379   | redis:7.2-alpine                | Cache                      |
| kafka                | 9092   | confluentinc/cp-kafka:7.5.0     | Event bus                  |
| zookeeper            | 2181   | confluentinc/cp-zookeeper:7.5.0 | Coordinación Kafka         |

## 🚀 Estrategias de Deployment

### Opción 1: Docker Compose Completo (Recomendado)

Despliega toda la infraestructura y microservicios juntos.

```bash
# Clonar repositorio
git clone <repository-url>
cd bookly-monorepo/bookly-mock

# Configurar entorno
cp .env.docker.example .env.docker

# Desplegar todo
docker-compose -f docker-compose.yml -f docker-compose.microservices.yml up -d --build
```

### Opción 2: Infraestructura + Node.js Local

Ejecuta infraestructura en Docker pero microservicios en Node.js local.

```bash
# Iniciar solo infraestructura
docker-compose up -d

# En otra terminal, ejecutar microservicios localmente
npm run start:all
```

### Opción 3: Solo Microservicios en Docker

Usa infraestructura externa (cloud) y solo microservicios en Docker.

```bash
# Configurar variables para infraestructura externa
export MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/bookly_auth
export REDIS_HOST=redis-cluster.example.com
export KAFKA_BROKER=kafka-cluster.example.com:9092

# Desplegar solo microservicios
docker-compose -f docker-compose.microservices.yml up -d --build
```

## 🔧 Configuración de Entorno

### Archivo .env.docker

```bash
# Entorno
NODE_ENV=production

# Red Docker
DOCKER_NETWORK=bookly-mock-network

# Base de Datos (contenedores Docker)
MONGODB_URI=mongodb://mongodb-auth:27017/bookly_auth
MONGODB_RESOURCES_URI=mongodb://mongodb-resources:27018/bookly_resources
MONGODB_AVAILABILITY_URI=mongodb://mongodb-availability:27019/bookly_availability
MONGODB_STOCKPILE_URI=mongodb://mongodb-stockpile:27020/bookly_stockpile
MONGODB_REPORTS_URI=mongodb://mongodb-reports:27021/bookly_reports
MONGODB_GATEWAY_URI=mongodb://mongodb-gateway:27022/bookly_gateway

# Redis (contenedor Docker)
REDIS_HOST=redis
REDIS_PORT=6379

# Kafka (contenedores Docker)
KAFKA_BROKER=kafka:9092

# JWT
JWT_SECRET=your-super-secret-jwt-key-docker
JWT_REFRESH_SECRET=your-refresh-secret-key-docker

# Simulación desactivada en producción
SIMULATE_NETWORK_LATENCY=false
ERROR_SIMULATION_RATE=0

# Logging
LOG_LEVEL=info
```

## 📦 Docker Compose Files

### docker-compose.yml (Infraestructura)

```yaml
version: "3.8"

services:
  # MongoDB instances
  mongodb-auth:
    image: mongo:7.0
    container_name: bookly-mock-mongodb-auth
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: bookly
      MONGO_INITDB_ROOT_PASSWORD: bookly123
      MONGO_INITDB_DATABASE: bookly_auth
    volumes:
      - mongodb-auth-data:/data/db
    networks:
      - bookly-mock-network

  # Redis
  redis:
    image: redis:7.2-alpine
    container_name: bookly-mock-redis
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    networks:
      - bookly-mock-network

  # Kafka + Zookeeper
  zookeeper:
    image: confluentinc/cp-zookeeper:7.5.0
    container_name: bookly-mock-zookeeper
    ports:
      - "2181:2181"
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
    networks:
      - bookly-mock-network

  kafka:
    image: confluentinc/cp-kafka:7.5.0
    container_name: bookly-mock-kafka
    ports:
      - "9092:9092"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092
    depends_on:
      - zookeeper
    networks:
      - bookly-mock-network

volumes:
  mongodb-auth-data:
  mongodb-resources-data:
  redis-data:
  kafka-data:
  zookeeper-data:

networks:
  bookly-mock-network:
    driver: bridge
```

### docker-compose.microservices.yml (Microservicios)

```yaml
version: "3.8"

services:
  api-gateway:
    build:
      context: .
      dockerfile: apps/api-gateway/Dockerfile
    container_name: bookly-mock-api-gateway
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongodb-auth:27017/bookly_auth
      - REDIS_HOST=redis
      - KAFKA_BROKER=kafka:9092
    depends_on:
      - mongodb-auth
      - redis
      - kafka
    networks:
      - bookly-mock-network
    restart: unless-stopped

  auth-service:
    build:
      context: .
      dockerfile: apps/auth-service/Dockerfile
    container_name: bookly-mock-auth-service
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongodb-auth:27017/bookly_auth
      - REDIS_HOST=redis
      - KAFKA_BROKER=kafka:9092
    depends_on:
      - mongodb-auth
      - redis
      - kafka
    networks:
      - bookly-mock-network
    restart: unless-stopped

  # ... otros servicios similares

networks:
  bookly-mock-network:
    external: true
```

## 🚀 Comandos de Deployment

### 1. Build de Imágenes

```bash
# Build todas las imágenes
docker-compose -f docker-compose.microservices.yml build

# Build imagen específica
docker-compose -f docker-compose.microservices.yml build api-gateway

# Build sin cache
docker-compose -f docker-compose.microservices.yml build --no-cache
```

### 2. Despliegue Completo

```bash
# Iniciar todo (infraestructura + microservicios)
docker-compose -f docker-compose.yml -f docker-compose.microservices.yml up -d --build

# Verificar estado
docker-compose ps

# Ver logs
docker-compose logs -f
```

### 3. Gestión de Servicios

```bash
# Reiniciar servicio específico
docker-compose restart api-gateway

# Escalar servicio
docker-compose up -d --scale auth-service=3

# Actualizar servicio
docker-compose up -d --build auth-service
```

### 4. Mantenimiento

```bash
# Limpiar recursos no usados
docker system prune -f

# Ver uso de recursos
docker stats

# Backup de volúmenes
docker run --rm -v bookly-mock-mongodb-auth-data:/data -v $(pwd):/backup ubuntu tar cvf /backup/mongodb-auth-backup.tar /data
```

## 🔍 Verificación del Deployment

### Health Checks

```bash
# Verificar contenedores corriendo
docker-compose ps

# Health checks específicos
curl http://localhost:3000/health          # API Gateway
curl http://localhost:3001/api/v1/health    # Auth Service
curl http://localhost:3002/api/v1/health    # Resources Service
# ... etc
```

### Logs y Monitoreo

```bash
# Logs de todos los servicios
docker-compose logs -f

# Logs de servicio específico
docker-compose logs -f api-gateway

# Logs en tiempo real con filtrado
docker-compose logs -f | grep ERROR
```

### Conectividad a Contenedores

```bash
# Acceder a un contenedor
docker-compose exec api-gateway bash

# Verificar conexión a base de datos
docker-compose exec mongodb-auth mongosh

# Verificar Redis
docker-compose exec redis redis-cli ping
```

## 📊 Optimización Docker

### Multi-stage Builds

Usar Dockerfiles optimizados para producción:

```dockerfile
# apps/api-gateway/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine AS production

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["node", "dist/apps/api-gateway/main.js"]
```

### Resource Limits

```yaml
# En docker-compose.yml
services:
  api-gateway:
    deploy:
      resources:
        limits:
          cpus: "0.5"
          memory: 512M
        reservations:
          cpus: "0.25"
          memory: 256M
```

### Health Checks

```yaml
services:
  api-gateway:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

## 🔧 Troubleshooting Docker

### Problemas Comunes

#### Contenedor No Inicia

```bash
# Ver logs del contenedor
docker-compose logs api-gateway

# Verificar imagen
docker images | grep bookly

# Rebuild si es necesario
docker-compose up -d --build api-gateway
```

#### Puerto en Uso

```bash
# Identificar proceso usando el puerto
lsof -ti:3000

# Matar proceso
kill -9 $(lsof -ti:3000)

# O cambiar puerto en docker-compose.yml
ports:
  - "3001:3000"  # Mapear 3001 local a 3000 contenedor
```

#### Conexión a Base de Datos

```bash
# Verificar contenedor MongoDB
docker-compose ps mongodb-auth

# Test conexión
docker-compose exec mongodb-auth mongosh --eval "db.adminCommand('ismaster')"

# Reiniciar si es necesario
docker-compose restart mongodb-auth
```

#### Espacio en Disco

```bash
# Ver uso de disco Docker
docker system df

# Limpiar imágenes no usadas
docker image prune -f

# Limpiar volúmenes no usados
docker volume prune -f
```

### Debug en Contenedores

```bash
# Ejecutar comando en contenedor
docker-compose exec api-gateway npm run test

# Ver variables de entorno
docker-compose exec api-gateway env | grep MONGO

# Instalar herramientas de debug
docker-compose exec api-gateway apk add curl
```

## 🚀 Buenas Prácticas Docker

### 1. Imágenes Ligeras

- Usar `node:18-alpine` en lugar de `node:18`
- Multi-stage builds
- `.dockerignore` optimizado

### 2. Seguridad

```bash
# Ejecutar como non-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs
```

### 3. Networking

- Usar redes Docker aisladas
- Exponer solo puertos necesarios
- Usar internal networks para servicios internos

### 4. Volumenes y Persistencia

- Usar named volumes para datos persistentes
- Bind mounts para desarrollo
- Backup regular de volúmenes

## 📝 Checklist de Deployment Docker

- [ ] Docker y Docker Compose instalados
- [ ] Archivos `.env.docker` configurados
- [ ] Dockerfiles optimizados
- [ ] Redes Docker configuradas
- [ ] Volúmenes persistentes definidos
- [ ] Health checks configurados
- [ ] Resource limits establecidos
- [ ] Todos los contenedores healthy
- [ ] Logs sin errores críticos
- [ ] API endpoints respondiendo

## 🆘 Comandos de Emergencia

### Reset Completo

```bash
# Detener todo
docker-compose down -v

# Limpiar todo
docker system prune -af

# Reconstruir desde cero
docker-compose build --no-cache
docker-compose up -d
```

### Backup y Restore

```bash
# Backup todos los volúmenes
docker run --rm -v bookly-mock-mongodb-auth-data:/data -v $(pwd):/backup ubuntu tar cvf /backup/mongodb-auth-$(date +%Y%m%d).tar /data

# Restore
docker run --rm -v bookly-mock-mongodb-auth-data:/data -v $(pwd):/backup ubuntu tar xvf /backup/mongodb-auth-20240101.tar -C /
```

### Escalado Rápido

```bash
# Escalar todos los servicios
docker-compose up -d --scale api-gateway=3 --scale auth-service=3

# Verificar escalado
docker-compose ps
```

## 📚 Recursos Adicionales

- [Docker Compose Reference](https://docs.docker.com/compose/reference/)
- [Dockerfile Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Docker Networking](https://docs.docker.com/network/)
- [Docker Volumes](https://docs.docker.com/storage/volumes/)
