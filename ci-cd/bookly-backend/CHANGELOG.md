# 📝 Changelog - CI/CD Bookly Mock

Registro de cambios en la configuración de CI/CD de **bookly-mock** (backend).

---

## [1.0.0] - 2025-12-06

### 🎯 Reorganización Completa de CI/CD

#### ✨ Añadido

**Estructura de Carpetas**:
- ✅ `ci-cd/` - Carpeta principal para todo el CI/CD de bookly-mock
- ✅ `ci-cd/scripts/local/` - Scripts de ejecución local
- ✅ `ci-cd/scripts/docker/` - Scripts de Docker completo
- ✅ `ci-cd/dockerfiles/` - Dockerfiles de microservicios
- ✅ `ci-cd/docs/` - Documentación de despliegue

**Documentación Nueva**:
- ✅ `ci-cd/README.md` - Guía completa de CI/CD de bookly-mock
- ✅ `ci-cd/INDEX.md` - Índice detallado de todos los archivos
- ✅ `ci-cd/CHANGELOG.md` - Este archivo

**Scripts Reorganizados**:
- ✅ `ci-cd/scripts/local/start-all.ps1` - Inicia infraestructura Docker
- ✅ `ci-cd/scripts/local/start-backend.ps1` - Inicia microservicios de bookly-mock
- ✅ `ci-cd/scripts/local/start-frontend.ps1` - Inicia bookly-mock-frontend
- ✅ `ci-cd/scripts/local/start-services-jobs.ps1` - Versión con PowerShell Jobs
- ✅ `ci-cd/scripts/docker/deploy.ps1` - Despliegue completo en Docker
- ✅ `ci-cd/scripts/docker/verify.ps1` - Verificación de servicios

**Dockerfiles Reorganizados**:
- ✅ `ci-cd/dockerfiles/Dockerfile.gateway` - API Gateway de bookly-mock
- ✅ `ci-cd/dockerfiles/Dockerfile.auth` - Auth Service
- ✅ `ci-cd/dockerfiles/Dockerfile.resources` - Resources Service
- ✅ `ci-cd/dockerfiles/Dockerfile.availability` - Availability Service
- ✅ `ci-cd/dockerfiles/Dockerfile.stockpile` - Stockpile Service
- ✅ `ci-cd/dockerfiles/Dockerfile.reports` - Reports Service
- ✅ `ci-cd/dockerfiles/Dockerfile.base` - Dockerfile base
- ✅ `ci-cd/dockerfiles/Dockerfile.simple-gateway` - Gateway simplificado

**Documentación Reorganizada**:
- ✅ `ci-cd/docs/INICIO_RAPIDO.md` - Guía de inicio rápido
- ✅ `ci-cd/docs/ESTADO_DESPLIEGUE.md` - Estado del despliegue
- ✅ `ci-cd/docs/DOCKER_DEPLOYMENT.md` - Guía completa de Docker
- ✅ `ci-cd/docs/QUICK_START.md` - Quick start
- ✅ `ci-cd/docs/DEPLOYMENT_SUMMARY.md` - Resumen técnico

#### 🔄 Modificado

**Archivos Actualizados**:
- ✅ `bookly-mock/docker-compose.yml` - Rutas de Dockerfiles actualizadas a `../ci-cd/dockerfiles/`
- ✅ `README.md` (raíz) - Sección de CI/CD agregada con referencia a bookly-mock
- ✅ Scripts con rutas relativas corregidas usando `$PSScriptRoot`

#### 🗑️ Removido

**Archivos Movidos desde Raíz**:
- ❌ `START_ALL_LOCAL.ps1` → Movido a `ci-cd/scripts/local/start-all.ps1`
- ❌ `INICIO_RAPIDO.md` → Movido a `ci-cd/docs/INICIO_RAPIDO.md`
- ❌ `ESTADO_DESPLIEGUE.md` → Movido a `ci-cd/docs/ESTADO_DESPLIEGUE.md`
- ❌ `DEPLOYMENT_SUMMARY.md` → Movido a `ci-cd/docs/DEPLOYMENT_SUMMARY.md`

**Archivos Movidos desde bookly-mock/**:
- ❌ `bookly-mock/start-backend-local.ps1` → `ci-cd/scripts/local/start-backend.ps1`
- ❌ `bookly-mock/start-local.ps1` → `ci-cd/scripts/local/start-services-jobs.ps1`
- ❌ `bookly-mock/docker-deploy.ps1` → `ci-cd/scripts/docker/deploy.ps1`
- ❌ `bookly-mock/docker-verify.ps1` → `ci-cd/scripts/docker/verify.ps1`
- ❌ `bookly-mock/Dockerfile.*` → `ci-cd/dockerfiles/Dockerfile.*`
- ❌ `bookly-mock/DOCKER_DEPLOYMENT.md` → `ci-cd/docs/DOCKER_DEPLOYMENT.md`
- ❌ `bookly-mock/README_QUICK_START.md` → `ci-cd/docs/QUICK_START.md`

**Archivos Movidos desde bookly-mock-frontend/**:
- ❌ `bookly-mock-frontend/start-frontend-local.ps1` → `ci-cd/scripts/local/start-frontend.ps1`

#### 🎯 Alcance y Enfoque

**Clarificación Importante**:
- 📌 Todo el contenido de `ci-cd/` es **específico para bookly-mock** (backend)
- 📌 Referencias claras en toda la documentación sobre el alcance de bookly-mock
- 📌 Nota agregada indicando que otros componentes de Bookly tienen sus propios directorios

### 📊 Métricas

- **Archivos movidos**: 18
- **Archivos nuevos**: 3 (README.md, INDEX.md, CHANGELOG.md)
- **Archivos actualizados**: 3 (docker-compose.yml, README.md raíz, scripts)
- **Carpetas creadas**: 5 (ci-cd/, scripts/, local/, docker/, dockerfiles/, docs/)

### ✅ Beneficios

1. **Organización Mejorada**: Todo CI/CD de bookly-mock centralizado
2. **Claridad de Alcance**: Referencias explícitas a bookly-mock en todos los archivos
3. **Separación Clara**: Scripts separados del código fuente de bookly-mock
4. **Mantenibilidad**: Más fácil encontrar archivos relacionados con bookly-mock
5. **Escalabilidad**: Preparado para futuras configuraciones de bookly-mock

---

## Formato de Changelog

Este changelog sigue el formato de [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/).

### Tipos de Cambios
- **Añadido**: Nuevas funcionalidades
- **Modificado**: Cambios en funcionalidades existentes
- **Removido**: Funcionalidades eliminadas
- **Corregido**: Corrección de bugs
- **Seguridad**: Cambios de seguridad

---

**Mantenido por**: Equipo Bookly  
**Última actualización**: 6 de diciembre de 2025
