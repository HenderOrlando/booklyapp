# 🚀 CI/CD y Scripts de Despliegue - Bookly Mock (Backend)

Esta carpeta contiene todos los scripts, configuraciones y documentación relacionada con el despliegue de **Bookly Mock** (backend con microservicios NestJS).

## 📁 Estructura

```
ci-cd/                      # CI/CD específico para bookly-backend (backend)
├── scripts/
│   ├── local/              # Scripts para ejecución local de bookly-backend
│   │   ├── start-all.ps1              # Inicia infraestructura Docker para bookly-backend
│   │   ├── start-backend.ps1          # Inicia microservicios de bookly-backend
│   │   ├── start-frontend.ps1         # Inicia bookly-frontend
│   │   └── start-services-jobs.ps1    # Versión alternativa con PowerShell Jobs
│   │
│   └── docker/             # Scripts para despliegue Docker de bookly-backend
│       ├── deploy.ps1                 # Despliega bookly-backend en Docker
│       └── verify.ps1                 # Verifica servicios de bookly-backend
│
├── dockerfiles/            # Dockerfiles de microservicios de bookly-backend
│   ├── Dockerfile.gateway             # API Gateway (bookly-backend)
│   ├── Dockerfile.auth                # Auth Service (bookly-backend)
│   ├── Dockerfile.resources           # Resources Service (bookly-backend)
│   ├── Dockerfile.availability        # Availability Service (bookly-backend)
│   ├── Dockerfile.stockpile           # Stockpile Service (bookly-backend)
│   ├── Dockerfile.reports             # Reports Service (bookly-backend)
│   └── Dockerfile.base                # Dockerfile base compartido
│
├── docs/                   # Documentación de despliegue de bookly-backend
│   ├── INICIO_RAPIDO.md              # Guía rápida de bookly-backend
│   ├── ESTADO_DESPLIEGUE.md          # Estado del despliegue de bookly-backend
│   ├── DOCKER_DEPLOYMENT.md          # Guía Docker de bookly-backend
│   ├── QUICK_START.md                # Quick start de bookly-backend
│   └── DEPLOYMENT_SUMMARY.md         # Resumen técnico de bookly-backend
│
└── README.md              # Este archivo
```

> **Nota**: Este directorio CI/CD contiene configuraciones específicas para **bookly-backend** (backend NestJS con microservicios). Para otros componentes del proyecto Bookly, consultar sus respectivos directorios.

## 🚀 Inicio Rápido (Bookly Mock)

### Modo Híbrido (Recomendado para Desarrollo)

**Infraestructura en Docker + Microservicios de bookly-backend Locales**

```powershell
# 1. Desde la raíz del proyecto
.\ci-cd\scripts\local\start-all.ps1

# 2. En una nueva terminal - Backend
cd bookly-backend
npm run start:all

# 3. En otra terminal - Frontend
cd bookly-frontend
npm run dev
```

### Modo Docker Completo (Bookly Mock)

**Todo bookly-backend en Docker (para producción o testing)**

```powershell
# Desde bookly-backend/
cd bookly-backend

# Opción 1: Usar script automatizado
..\ci-cd\scripts\docker\deploy.ps1

# Opción 2: Manual con docker-compose de bookly-backend
docker-compose up -d

# Verificar estado de bookly-backend
..\ci-cd\scripts\docker\verify.ps1
```

## 📚 Scripts Disponibles

### Scripts Locales (`scripts/local/`)

#### `start-all.ps1`
Script maestro que:
- ✅ Verifica Docker Desktop
- ✅ Levanta infraestructura en Docker (MongoDB, Redis, Kafka)
- ✅ Espera que los servicios estén listos
- ℹ️ Muestra instrucciones para iniciar backend y frontend

**Uso**:
```powershell
.\ci-cd\scripts\local\start-all.ps1
```

#### `start-backend.ps1`
Inicia todos los microservicios localmente usando `npm run start:all`

**Requisitos**:
- Infraestructura Docker corriendo
- Ejecutar desde `bookly-backend/`

**Uso**:
```powershell
cd bookly-backend
..\ci-cd\scripts\local\start-backend.ps1
```

#### `start-frontend.ps1`
Inicia el frontend Next.js en modo desarrollo

**Uso**:
```powershell
cd bookly-frontend
..\ci-cd\scripts\local\start-frontend.ps1
```

#### `start-services-jobs.ps1`
Versión alternativa que usa PowerShell Jobs para ejecutar servicios en paralelo

### Scripts Docker (`scripts/docker/`)

#### `deploy.ps1`
Script automatizado que:
- ✅ Verifica requisitos
- ✅ Levanta infraestructura
- ✅ Construye imágenes Docker
- ✅ Inicia todos los servicios
- ✅ Muestra URLs de acceso

**Uso**:
```powershell
cd bookly-backend
..\ci-cd\scripts\docker\deploy.ps1
```

#### `verify.ps1`
Verifica el estado de todos los servicios Docker:
- Health checks
- Puertos
- Logs recientes
- Uso de recursos

**Uso**:
```powershell
cd bookly-backend
..\ci-cd\scripts\docker\verify.ps1
```

## 🐳 Dockerfiles

Todos los Dockerfiles están en `dockerfiles/` y deben ser referenciados desde `bookly-backend/docker-compose.yml`

**Características**:
- ✅ Single-stage builds (optimizados para Windows)
- ✅ Node.js 20 Alpine
- ✅ Health checks configurados
- ✅ Variables de entorno
- ✅ Optimizados para desarrollo

## 📖 Documentación

### [INICIO_RAPIDO.md](docs/INICIO_RAPIDO.md)
Guía paso a paso para poner en marcha Bookly rápidamente.

### [ESTADO_DESPLIEGUE.md](docs/ESTADO_DESPLIEGUE.md)
Estado actual de todos los componentes del despliegue.

### [DOCKER_DEPLOYMENT.md](docs/DOCKER_DEPLOYMENT.md)
Documentación completa del despliegue Docker:
- Arquitectura
- Configuración
- Troubleshooting
- Best practices

### [DEPLOYMENT_SUMMARY.md](docs/DEPLOYMENT_SUMMARY.md)
Resumen técnico de la configuración de despliegue.

## 🎯 URLs de Acceso

### Modo Local
- **Frontend**: http://localhost:4200
- **API Gateway**: http://localhost:3000
- **Swagger**: http://localhost:3000/api/docs
- **Auth Service**: http://localhost:3001
- **Resources Service**: http://localhost:3002
- **Availability Service**: http://localhost:3003
- **Stockpile Service**: http://localhost:3004
- **Reports Service**: http://localhost:3005

### Infraestructura (Ambos Modos)
- **MongoDB Auth**: localhost:27017
- **MongoDB Resources**: localhost:27018
- **MongoDB Availability**: localhost:27019
- **MongoDB Stockpile**: localhost:27020
- **MongoDB Reports**: localhost:27021
- **MongoDB Gateway**: localhost:27022
- **Redis**: localhost:6379
- **Kafka**: localhost:9092
- **Zookeeper**: localhost:2181

## 🛠️ Comandos Útiles

### Docker
```powershell
# Ver contenedores activos
docker ps --filter "name=bookly-backend"

# Ver logs
cd bookly-backend
docker-compose logs -f

# Detener todo
docker-compose down

# Limpiar todo (incluye volúmenes)
docker-compose down -v
```

### NPM (Modo Local)
```powershell
cd bookly-backend

# Todos los servicios
npm run start:all

# Servicios individuales
npm run start:gateway
npm run start:auth
npm run start:resources
npm run start:availability
npm run start:stockpile
npm run start:reports
```

## 🔧 Troubleshooting

Ver documentación completa en:
- [DOCKER_DEPLOYMENT.md](docs/DOCKER_DEPLOYMENT.md) - Sección Troubleshooting
- [ESTADO_DESPLIEGUE.md](docs/ESTADO_DESPLIEGUE.md) - Sección Troubleshooting

## 📝 Notas

- Los scripts están optimizados para **Windows + PowerShell**
- Se requiere **Docker Desktop** para la infraestructura
- Modo híbrido es **recomendado para desarrollo** (más rápido, hot-reload)
- Modo Docker completo es **recomendado para testing/producción**

---

**Última actualización**: Diciembre 6, 2025
