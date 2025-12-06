# 📂 Organización CI/CD - Bookly Mock

Este documento describe la organización del CI/CD para **Bookly Mock** (Frontend + Backend).

## 🎯 Alcance

Esta carpeta `ci-cd/bookly-mock/` contiene **todo lo necesario** para el despliegue de:

### Backend (bookly-mock)
- ✅ API Gateway (puerto 3000)
- ✅ Auth Service (puerto 3001)
- ✅ Resources Service (puerto 3002)
- ✅ Availability Service (puerto 3003)
- ✅ Stockpile Service (puerto 3004)
- ✅ Reports Service (puerto 3005)

### Frontend (bookly-mock-frontend)
- ✅ Next.js App (puerto 4200)

### Infraestructura
- ✅ MongoDB (6 instancias) - Puertos 27017-27022
- ✅ Redis - Puerto 6379
- ✅ Kafka - Puerto 9092
- ✅ Zookeeper - Puerto 2181

## 📁 Estructura Completa

```
ci-cd/bookly-mock/
│
├── scripts/                    # Scripts de despliegue
│   ├── local/                  # Ejecución local
│   │   ├── start-all.ps1              # [1] Inicia infraestructura Docker
│   │   ├── start-backend.ps1          # [2] Inicia backend (microservicios)
│   │   ├── start-frontend.ps1         # [3] Inicia frontend (Next.js)
│   │   └── start-services-jobs.ps1    # Versión alternativa con Jobs
│   │
│   └── docker/                 # Docker completo
│       ├── deploy.ps1                 # Despliega todo en Docker
│       └── verify.ps1                 # Verifica servicios
│
├── dockerfiles/                # Dockerfiles de microservicios
│   ├── Dockerfile.gateway             # API Gateway
│   ├── Dockerfile.auth                # Auth Service
│   ├── Dockerfile.resources           # Resources Service
│   ├── Dockerfile.availability        # Availability Service
│   ├── Dockerfile.stockpile           # Stockpile Service
│   ├── Dockerfile.reports             # Reports Service
│   ├── Dockerfile.base                # Dockerfile base compartido
│   └── Dockerfile.simple-gateway      # Gateway simplificado
│
├── docs/                       # Documentación
│   ├── INICIO_RAPIDO.md              # Guía de inicio rápido
│   ├── ESTADO_DESPLIEGUE.md          # Estado del despliegue
│   ├── DOCKER_DEPLOYMENT.md          # Guía completa Docker
│   ├── QUICK_START.md                # Quick start
│   └── DEPLOYMENT_SUMMARY.md         # Resumen técnico
│
├── README.md                   # Guía completa de CI/CD
├── INDEX.md                    # Índice de archivos
├── CHANGELOG.md                # Registro de cambios
└── ORGANIZACION.md            # Este archivo
```

## 🚀 Flujo de Despliegue

### Modo Híbrido (Desarrollo) - Recomendado

```
[1] Infraestructura Docker
    ↓
    .\ci-cd\bookly-mock\scripts\local\start-all.ps1
    ↓
    ├─ MongoDB (6 instancias)
    ├─ Redis
    ├─ Kafka
    └─ Zookeeper

[2] Backend Local (bookly-mock/)
    ↓
    npm run start:all
    ↓
    ├─ API Gateway :3000
    ├─ Auth Service :3001
    ├─ Resources Service :3002
    ├─ Availability Service :3003
    ├─ Stockpile Service :3004
    └─ Reports Service :3005

[3] Frontend Local (bookly-mock-frontend/)
    ↓
    npm run dev
    ↓
    └─ Next.js App :4200
```

### Modo Docker Completo (Producción)

```
[1] Deploy Todo
    ↓
    .\ci-cd\bookly-mock\scripts\docker\deploy.ps1
    ↓
    ├─ Infraestructura (Docker)
    ├─ Backend (Docker)
    └─ Frontend (Docker)

[2] Verificar
    ↓
    .\ci-cd\bookly-mock\scripts\docker\verify.ps1
```

## 📍 Referencias de Rutas

### Desde la Raíz del Proyecto

```powershell
# Scripts
.\ci-cd\bookly-mock\scripts\local\start-all.ps1
.\ci-cd\bookly-mock\scripts\docker\deploy.ps1

# Documentación
.\ci-cd\bookly-mock\README.md
.\ci-cd\bookly-mock\docs\INICIO_RAPIDO.md
```

### Desde bookly-mock/

```powershell
# Scripts
..\ci-cd\bookly-mock\scripts\docker\deploy.ps1
..\ci-cd\bookly-mock\scripts\docker\verify.ps1

# Dockerfiles (en docker-compose.yml)
dockerfile: ../ci-cd/bookly-mock/dockerfiles/Dockerfile.gateway
dockerfile: ../ci-cd/bookly-mock/dockerfiles/Dockerfile.auth
# ... etc
```

### Desde bookly-mock-frontend/

```powershell
# Scripts
..\ci-cd\bookly-mock\scripts\local\start-frontend.ps1
```

## 🎨 Ventajas de esta Organización

### 1. **Claridad Total**
- ✅ Queda claro que `ci-cd/bookly-mock/` contiene TODO de bookly-mock
- ✅ Frontend y backend juntos en el mismo lugar
- ✅ Fácil de encontrar archivos relacionados

### 2. **Escalabilidad**
```
ci-cd/
├── bookly-mock/           # ✅ Implementado
├── bookly-production/     # 📋 Futuro
├── bookly-analytics/      # 📋 Futuro
└── ...
```

### 3. **Separación de Responsabilidades**
- ✅ CI/CD separado del código fuente
- ✅ Scripts no contaminan carpetas de aplicación
- ✅ Documentación centralizada

### 4. **Consistencia**
- ✅ Estructura repetible para otros componentes
- ✅ Convenciones claras
- ✅ Fácil onboarding para nuevos desarrolladores

## 📝 Guías Rápidas

### Para Desarrolladores
1. **[README.md](README.md)** - Guía completa
2. **[docs/INICIO_RAPIDO.md](docs/INICIO_RAPIDO.md)** - Inicio en 3 pasos

### Para DevOps
1. **[docs/DOCKER_DEPLOYMENT.md](docs/DOCKER_DEPLOYMENT.md)** - Despliegue Docker
2. **[INDEX.md](INDEX.md)** - Índice completo de archivos

### Para Troubleshooting
1. **[docs/ESTADO_DESPLIEGUE.md](docs/ESTADO_DESPLIEGUE.md)** - Estado actual
2. **[CHANGELOG.md](CHANGELOG.md)** - Historial de cambios

---

**Última actualización**: 6 de diciembre de 2025  
**Versión**: 2.0.0 (Reorganización con carpeta bookly-mock)
