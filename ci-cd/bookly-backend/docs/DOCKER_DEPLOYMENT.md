# 🐳 Bookly Docker Deployment Guide

Este documento describe cómo desplegar la aplicación completa de Bookly usando Docker Compose, incluyendo toda la infraestructura, microservicios y frontend.

## 📋 Requisitos Previos

- **Docker Desktop** instalado y ejecutándose
- **Docker Compose** v2.0 o superior
- Al menos **8GB de RAM** disponible para Docker
- Al menos **20GB de espacio en disco**

## 🏗️ Arquitectura de Despliegue

El despliegue incluye los siguientes componentes:

### Infraestructura
- **Zookeeper**: Coordinación para Kafka (Puerto: 2181)
- **Kafka**: Event Bus para comunicación asíncrona (Puertos: 9092, 9093)
- **Redis**: Cache y sesiones (Puerto: 6379)
- **MongoDB Instances**: 6 instancias separadas por servicio
  - mongodb-auth (Puerto: 27017)
  - mongodb-resources (Puerto: 27018)
  - mongodb-availability (Puerto: 27019)
  - mongodb-stockpile (Puerto: 27020)
  - mongodb-reports (Puerto: 27021)
  - mongodb-gateway (Puerto: 27022)

### Microservicios
- **API Gateway** (Puerto: 3000) - Punto de entrada unificado
- **Auth Service** (Puerto: 3001) - Autenticación y autorización
- **Resources Service** (Puerto: 3002) - Gestión de recursos
- **Availability Service** (Puerto: 3003) - Disponibilidad y reservas
- **Stockpile Service** (Puerto: 3004) - Aprobaciones y validaciones
- **Reports Service** (Puerto: 3005) - Reportes y análisis

### Frontend
- **Bookly Web** (Puerto: 4200) - Aplicación Next.js

## 🚀 Despliegue Rápido

### Opción 1: Script Automático (Recomendado)

```powershell
# En Windows PowerShell
cd bookly-mock
.\docker-deploy.ps1
```

Este script:
1. ✅ Verifica que Docker esté ejecutándose
2. 🧹 Limpia contenedores existentes
3. 🏗️ Inicia la infraestructura y espera que esté lista
4. 🚀 Construye e inicia los microservicios
5. 🎨 Construye e inicia el frontend
6. 📊 Muestra el estado final y URLs de acceso

### Opción 2: Docker Compose Manual

```bash
# Levantar solo infraestructura
docker-compose up -d zookeeper kafka redis mongodb-auth mongodb-resources mongodb-availability mongodb-stockpile mongodb-reports mongodb-gateway

# Esperar 60 segundos para que la infraestructura esté lista

# Levantar microservicios
docker-compose up -d --build api-gateway auth-service resources-service availability-service stockpile-service reports-service

# Esperar 30 segundos

# Levantar frontend
docker-compose up -d --build bookly-web
```

### Opción 3: Todo de una vez (no recomendado)

```bash
docker-compose up -d --build
```

⚠️ **Nota**: Esta opción puede causar errores de conexión si los microservicios inician antes que la infraestructura.

## 🔍 Verificación del Despliegue

### Script Automático de Verificación

```powershell
.\docker-verify.ps1
```

Este script verifica:
- ✅ Estado de contenedores Docker
- ✅ Conectividad de infraestructura (Redis, MongoDB, Kafka)
- ✅ Health checks de todos los microservicios
- ✅ Accesibilidad del frontend
- 📊 Uso de recursos (CPU/Memoria)

### Verificación Manual

```bash
# Ver estado de todos los contenedores
docker-compose ps

# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f api-gateway
docker-compose logs -f auth-service
docker-compose logs -f bookly-web

# Verificar health de un servicio
curl http://localhost:3000/health  # API Gateway
curl http://localhost:3001/health  # Auth Service
curl http://localhost:3002/health  # Resources Service
curl http://localhost:3003/health  # Availability Service
curl http://localhost:3004/health  # Stockpile Service
curl http://localhost:3005/health  # Reports Service
```

## 🌐 URLs de Acceso

Una vez desplegado, puedes acceder a:

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **Frontend** | http://localhost:4200 | Aplicación web principal |
| **API Gateway** | http://localhost:3000 | API unificada |
| **Swagger Docs** | http://localhost:3000/api/docs | Documentación interactiva de API |
| **Auth Service** | http://localhost:3001 | Servicio de autenticación |
| **Resources** | http://localhost:3002 | Gestión de recursos |
| **Availability** | http://localhost:3003 | Reservas y disponibilidad |
| **Stockpile** | http://localhost:3004 | Aprobaciones |
| **Reports** | http://localhost:3005 | Reportes |

## 🔧 Configuración

### Variables de Entorno

Puedes crear un archivo `.env` en el directorio `bookly-mock` basado en `.env.docker.example`:

```bash
cp .env.docker.example .env
```

Importante configurar:
- `JWT_SECRET`: Clave secreta para JWT (¡cambiar en producción!)
- `CORS_ORIGIN`: Origen permitido para CORS
- Credenciales de MongoDB (si es necesario)

### Ajustes de Recursos

Si tienes recursos limitados, puedes editar `docker-compose.yml` para agregar límites:

```yaml
services:
  api-gateway:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
```

## 🛠️ Comandos Útiles

### Gestión de Servicios

```bash
# Detener todos los servicios
docker-compose down

# Detener y eliminar volúmenes (¡CUIDADO! Borra datos)
docker-compose down -v

# Reiniciar un servicio específico
docker-compose restart api-gateway

# Reconstruir y reiniciar un servicio
docker-compose up -d --build api-gateway

# Ver logs en tiempo real
docker-compose logs -f

# Escalar un servicio (si es stateless)
docker-compose up -d --scale reports-service=3
```

### Debugging

```bash
# Entrar a un contenedor
docker exec -it bookly-mock-api-gateway sh

# Ver estadísticas de recursos
docker stats

# Inspeccionar red
docker network inspect bookly-mock_bookly-mock-network

# Ver volúmenes
docker volume ls
```

### Limpieza

```bash
# Limpiar contenedores detenidos
docker container prune

# Limpiar imágenes sin usar
docker image prune

# Limpiar todo (¡CUIDADO!)
docker system prune -a --volumes
```

## 🐛 Troubleshooting

### Problema: Servicios no inician correctamente

**Solución**: Asegúrate de que la infraestructura esté lista antes de iniciar microservicios.

```bash
# Verificar logs
docker-compose logs mongodb-auth
docker-compose logs redis
docker-compose logs kafka

# Reiniciar infraestructura
docker-compose restart mongodb-auth redis kafka
```

### Problema: Errores de conexión a MongoDB

**Solución**: Espera a que los health checks pasen.

```bash
# Verificar health de MongoDB
docker exec bookly-mock-mongodb-auth mongosh --eval "db.adminCommand('ping')"
```

### Problema: Frontend no carga

**Solución**: Verifica que el API Gateway esté funcionando primero.

```bash
curl http://localhost:3000/health
docker-compose logs bookly-web
```

### Problema: Out of memory

**Solución**: Aumenta la memoria asignada a Docker Desktop o reduce servicios.

1. Docker Desktop → Settings → Resources → Memory (aumentar a 8GB+)
2. O iniciar solo servicios necesarios:

```bash
docker-compose up -d redis mongodb-auth api-gateway auth-service bookly-web
```

### Problema: Puerto ya en uso

**Solución**: Detén el proceso que está usando el puerto o cambia el puerto en `docker-compose.yml`.

```bash
# Ver qué proceso usa el puerto 3000
netstat -ano | findstr :3000

# Detener el proceso (Windows)
taskkill /PID <PID> /F
```

## 📊 Monitoreo

### Ver uso de recursos en tiempo real

```bash
docker stats
```

### Ver logs agregados

```bash
# Todos los servicios
docker-compose logs -f --tail=100

# Solo microservicios
docker-compose logs -f api-gateway auth-service resources-service availability-service stockpile-service reports-service
```

### Health Checks

Todos los microservicios exponen un endpoint `/health`:

```bash
# Verificar todos
for port in 3000 3001 3002 3003 3004 3005; do
  echo "Port $port: $(curl -s http://localhost:$port/health)"
done
```

## 🔒 Seguridad

### Recomendaciones para Producción

1. **Cambiar credenciales por defecto**:
   - Modificar `JWT_SECRET` en `.env`
   - Cambiar credenciales de MongoDB
   - Usar secretos de Docker o variables de entorno seguras

2. **Usar HTTPS**: Configurar un reverse proxy (Nginx/Traefik) con SSL

3. **Limitar acceso a puertos**: Solo exponer API Gateway y Frontend

4. **Network segmentation**: Separar red de infraestructura de servicios

5. **Escanear imágenes**: Usar herramientas como Trivy o Snyk

```bash
# Escanear imagen
docker scan bookly-mock-api-gateway
```

## 📝 Notas Adicionales

### Desarrollo vs Producción

Este despliegue está optimizado para **desarrollo local** y **testing**. Para producción:

1. Usar un orquestador como Kubernetes
2. Implementar service mesh (Istio/Linkerd)
3. Configurar observabilidad (Prometheus, Grafana, Jaeger)
4. Usar bases de datos gestionadas (MongoDB Atlas, Redis Cloud)
5. Implementar CI/CD apropiado

### Persistencia de Datos

Los datos se almacenan en volúmenes Docker:

```bash
# Listar volúmenes
docker volume ls | grep bookly

# Backup de un volumen
docker run --rm -v bookly-mock_mongodb-auth-data:/data -v $(pwd):/backup alpine tar czf /backup/mongodb-auth-backup.tar.gz /data
```

### Actualización de Servicios

```bash
# Reconstruir todo
docker-compose build --no-cache

# Actualizar y reiniciar
docker-compose up -d --build
```

## 🤝 Soporte

Para problemas o preguntas:
1. Verifica los logs: `docker-compose logs -f`
2. Revisa este documento
3. Consulta la documentación de cada microservicio
4. Abre un issue en el repositorio

## 📚 Referencias

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [NestJS Docker Guide](https://docs.nestjs.com/recipes/docker)
- [Next.js Docker Guide](https://nextjs.org/docs/deployment#docker-image)
- [MongoDB Docker Guide](https://hub.docker.com/_/mongo)
