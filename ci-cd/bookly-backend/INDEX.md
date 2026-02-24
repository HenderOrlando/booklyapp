# 📑 Índice de Archivos CI/CD - Bookly Mock (Backend)

Este archivo proporciona un índice completo de todos los archivos relacionados con CI/CD y despliegue de **bookly-mock** (backend con microservicios NestJS).

## 📊 Resumen de Reorganización

**Fecha**: 6 de diciembre de 2025  
**Alcance**: Bookly Mock (Backend)

Todos los archivos de despliegue de **bookly-mock** han sido reorganizados desde la raíz del proyecto y la carpeta `bookly-mock/` hacia la carpeta `ci-cd/` para mejor organización y mantenibilidad.

## 📁 Archivos Movidos

### Scripts de Ejecución Local

| Archivo Original | Nueva Ubicación | Descripción |
|-----------------|-----------------|-------------|
| `START_ALL_LOCAL.ps1` | `ci-cd/scripts/local/start-all.ps1` | Script maestro - Inicia infraestructura |
| `bookly-mock/start-backend-local.ps1` | `ci-cd/scripts/local/start-backend.ps1` | Inicia microservicios localmente |
| `bookly-mock/start-local.ps1` | `ci-cd/scripts/local/start-services-jobs.ps1` | Versión con PowerShell Jobs |
| `bookly-mock-frontend/start-frontend-local.ps1` | `ci-cd/scripts/local/start-frontend.ps1` | Inicia frontend Next.js |

### Scripts Docker

| Archivo Original | Nueva Ubicación | Descripción |
|-----------------|-----------------|-------------|
| `bookly-mock/docker-deploy.ps1` | `ci-cd/scripts/docker/deploy.ps1` | Despliega todo en Docker |
| `bookly-mock/docker-verify.ps1` | `ci-cd/scripts/docker/verify.ps1` | Verifica servicios Docker |

### Dockerfiles

| Archivo Original | Nueva Ubicación | Descripción |
|-----------------|-----------------|-------------|
| `bookly-mock/Dockerfile.gateway` | `ci-cd/dockerfiles/Dockerfile.gateway` | API Gateway |
| `bookly-mock/Dockerfile.auth` | `ci-cd/dockerfiles/Dockerfile.auth` | Auth Service |
| `bookly-mock/Dockerfile.resources` | `ci-cd/dockerfiles/Dockerfile.resources` | Resources Service |
| `bookly-mock/Dockerfile.availability` | `ci-cd/dockerfiles/Dockerfile.availability` | Availability Service |
| `bookly-mock/Dockerfile.stockpile` | `ci-cd/dockerfiles/Dockerfile.stockpile` | Stockpile Service |
| `bookly-mock/Dockerfile.reports` | `ci-cd/dockerfiles/Dockerfile.reports` | Reports Service |
| `bookly-mock/Dockerfile.base` | `ci-cd/dockerfiles/Dockerfile.base` | Dockerfile base compartido |
| `bookly-mock/Dockerfile.simple-gateway` | `ci-cd/dockerfiles/Dockerfile.simple-gateway` | Versión simplificada del gateway |

### Documentación

| Archivo Original | Nueva Ubicación | Descripción |
|-----------------|-----------------|-------------|
| `INICIO_RAPIDO.md` | `ci-cd/docs/INICIO_RAPIDO.md` | Guía de inicio rápido |
| `ESTADO_DESPLIEGUE.md` | `ci-cd/docs/ESTADO_DESPLIEGUE.md` | Estado actual del despliegue |
| `bookly-mock/DOCKER_DEPLOYMENT.md` | `ci-cd/docs/DOCKER_DEPLOYMENT.md` | Guía completa de Docker |
| `bookly-mock/README_QUICK_START.md` | `ci-cd/docs/QUICK_START.md` | Quick start original |
| `DEPLOYMENT_SUMMARY.md` | `ci-cd/docs/DEPLOYMENT_SUMMARY.md` | Resumen técnico del despliegue |

## 📝 Archivos Nuevos Creados

| Archivo | Ubicación | Descripción |
|---------|-----------|-------------|
| `README.md` | `ci-cd/README.md` | Documentación principal de CI/CD |
| `INDEX.md` | `ci-cd/INDEX.md` | Este archivo - Índice completo |

## 📂 Estructura Final

```
booklyapp/
├── ci-cd/                          # Carpeta CI/CD de bookly-mock (backend)
│   ├── README.md                   # Guía principal de bookly-mock
│   ├── INDEX.md                    # Este archivo - Índice de bookly-mock
│   │
│   ├── scripts/                    # Scripts de despliegue
│   │   ├── local/                  # Ejecución local
│   │   │   ├── start-all.ps1
│   │   │   ├── start-backend.ps1
│   │   │   ├── start-frontend.ps1
│   │   │   └── start-services-jobs.ps1
│   │   │
│   │   └── docker/                 # Docker completo
│   │       ├── deploy.ps1
│   │       └── verify.ps1
│   │
│   ├── dockerfiles/                # Dockerfiles
│   │   ├── Dockerfile.gateway
│   │   ├── Dockerfile.auth
│   │   ├── Dockerfile.resources
│   │   ├── Dockerfile.availability
│   │   ├── Dockerfile.stockpile
│   │   ├── Dockerfile.reports
│   │   ├── Dockerfile.base
│   │   └── Dockerfile.simple-gateway
│   │
│   └── docs/                       # Documentación
│       ├── INICIO_RAPIDO.md
│       ├── ESTADO_DESPLIEGUE.md
│       ├── DOCKER_DEPLOYMENT.md
│       ├── QUICK_START.md
│       └── DEPLOYMENT_SUMMARY.md
│
├── bookly-mock/                    # Backend (sin scripts de despliegue)
│   ├── docker-compose.yml          # Permanece aquí
│   ├── .env.docker.example         # Permanece aquí
│   └── ...
│
├── bookly-mock-frontend/           # Frontend (sin scripts de despliegue)
│   └── ...
│
└── README.md                       # README principal (actualizado con sección CI/CD)
```

## 🔄 Actualización de Referencias

### En docker-compose.yml

Si `bookly-mock/docker-compose.yml` hace referencia a los Dockerfiles, actualizar las rutas:

```yaml
services:
  api-gateway:
    build:
      context: .
      dockerfile: ../ci-cd/dockerfiles/Dockerfile.gateway
```

### En Scripts

Los scripts en `ci-cd/scripts/local/` ya han sido actualizados con rutas relativas correctas usando `$PSScriptRoot`.

## 🚀 Uso Después de la Reorganización

### Desde la Raíz del Proyecto

```powershell
# Iniciar infraestructura
.\ci-cd\scripts\local\start-all.ps1

# Backend (en otra terminal)
cd bookly-mock
npm run start:all

# Frontend (en otra terminal)
cd bookly-mock-frontend
npm run dev
```

### Despliegue Docker Completo

```powershell
cd bookly-mock
..\ci-cd\scripts\docker\deploy.ps1
```

## 📚 Documentación Principal

- **[ci-cd/README.md](README.md)** - Guía completa de CI/CD
- **[ci-cd/docs/INICIO_RAPIDO.md](docs/INICIO_RAPIDO.md)** - Inicio rápido
- **[ci-cd/docs/DOCKER_DEPLOYMENT.md](docs/DOCKER_DEPLOYMENT.md)** - Guía Docker completa

## ✅ Beneficios de la Reorganización

1. **Mejor Organización**: Todos los archivos de CI/CD de bookly-mock en un solo lugar
2. **Separación de Responsabilidades**: Scripts de bookly-mock separados de código fuente
3. **Fácil Navegación**: Estructura clara y lógica para bookly-mock
4. **Mantenibilidad**: Más fácil encontrar y actualizar archivos de bookly-mock
5. **Escalabilidad**: Preparado para agregar más scripts y configuraciones de bookly-mock

## 🎯 Alcance

> **Importante**: Este directorio `ci-cd/` contiene **únicamente** las configuraciones de despliegue para **bookly-mock** (backend con microservicios NestJS).
>
> Para otros componentes del proyecto Bookly:
> - **bookly-mock-frontend**: Ver carpeta `bookly-mock-frontend/` (scripts específicos si existen)
> - **Otros servicios**: Consultar sus respectivos directorios

---

**Última actualización**: 6 de diciembre de 2025
