# 🔐 Auth Service

Sistema de autenticación, autorización y control de accesos para Bookly.

## 📋 Índice

- [Descripción](#descripción)
- [Características](#características)
- [Arquitectura](#arquitectura)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [API Documentation](#api-documentation)
- [Testing](#testing)

---

## 📖 Descripción

El **Auth Service** es un microservicio que gestiona:

- **Autenticación**: Login, registro, recuperación de contraseña
- **Autorización**: Roles y permisos basados en perfil de usuario
- **SSO (Single Sign-On)**: Integración con proveedores externos
- **2FA (Two-Factor Authentication)**: Verificación en dos pasos
- **Auditoría**: Registro de accesos y acciones de usuarios
- **Restricciones**: Control de modificación de reservas según configuración

---

## ✨ Características

### RF-41: Gestión de Roles y Permisos

- ✅ Roles predefinidos: ADMIN, COORDINATOR, PROFESSOR, STUDENT, GUARD
- ✅ Permisos granulares por recurso y acción
- ✅ Asignación dinámica de roles por usuario
- ✅ CQRS para gestión de roles y permisos
- ✅ Seeds con roles y permisos iniciales

**Documentación**: [`docs/fase1-sprint1-rf41-roles-permisos/`](docs/fase1-sprint1-rf41-roles-permisos/)

---

### RF-42: Restricción de Modificación

- ✅ Validación de permisos antes de modificar reservas
- ✅ Configuración por tipo de recurso y rol
- ✅ Restricciones de tiempo (ej: no modificar 24h antes)
- ✅ Auditoría de intentos de modificación

**Documentación**: [`docs/fase1-sprint1-rf42-restricciones/`](docs/fase1-sprint1-rf42-restricciones/)

---

### RF-43: Autenticación y SSO

- ✅ JWT tokens con refresh token
- ✅ Login con email/password
- ✅ **SSO con Google Workspace** (OAuth 2.0)
- ✅ Asignación automática de roles por dominio
- ✅ Registro de usuarios
- ✅ Recuperación de contraseña

**Documentación**: [`docs/SSO_GOOGLE_WORKSPACE.md`](docs/SSO_GOOGLE_WORKSPACE.md)

**Características SSO**:
- Autenticación OAuth 2.0 con Google
- Validación de dominios institucionales (@ufps.edu.co, @cloud.ufps.edu.co)
- Asignación automática de roles según dominio
- Sincronización de datos de perfil (nombre, email, foto)
- Actualización automática de información en cada login

---

### RF-44: Auditoría de Accesos

- ✅ Registro de login/logout
- ✅ Registro de acciones críticas
- ✅ Logs estructurados con Winston
- ✅ Trazabilidad completa de usuarios
- ✅ Consulta de historial por usuario

**Documentación**: [`docs/fase1-sprint1-rf44-auditoria/`](docs/fase1-sprint1-rf44-auditoria/)

---

### RF-45: Verificación por 2FA

- ✅ **2FA con TOTP** (Time-based One-Time Password)
- ✅ **QR Code** para configuración con apps autenticadoras
- ✅ **10 códigos de backup** de emergencia
- ✅ Login con código temporal
- ✅ Regeneración de códigos de backup
- ✅ Eventos de seguridad (habilitación, deshabilitación, fallos)

**Documentación**: [`docs/TWO_FACTOR_AUTH.md`](docs/TWO_FACTOR_AUTH.md)

**Características 2FA**:
- TOTP estándar (RFC 6238) con período de 30 segundos
- Compatible con Google Authenticator, Authy, Microsoft Authenticator
- Ventana de tolerancia de ±60 segundos
- Token temporal de 5 minutos para completar login
- Códigos de backup de 8 caracteres hexadecimales

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────┐
│                 Auth Service                        │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────────────────────────────────┐       │
│  │       Infrastructure Layer               │       │
│  │  ┌────────────┐  ┌──────────────┐        │       │
│  │  │Controllers │  │   Guards     │        │       │
│  │  │  (REST)    │  │ (JWT, Roles) │        │       │
│  │  └────────────┘  └──────────────┘        │       │
│  └──────────────────────────────────────────┘       │
│                                                     │
│  ┌──────────────────────────────────────────┐       │
│  │        Application Layer                 │       │
│  │  ┌────────────┐  ┌──────────────┐        │       │
│  │  │  Commands  │  │   Queries    │        │       │
│  │  │ (CQRS)     │  │   (CQRS)     │        │       │
│  │  └────────────┘  └──────────────┘        │       │
│  │                                          │       │
│  │  ┌────────────┐  ┌──────────────┐        │       │
│  │  │  Services  │  │   Handlers   │        │       │
│  │  └────────────┘  └──────────────┘        │       │
│  └──────────────────────────────────────────┘       │
│                                                     │
│  ┌──────────────────────────────────────────┐       │
│  │           Domain Layer                   │       │
│  │  ┌─────────────┐  ┌──────────────┐       │       │
│  │  │ Entities    │  │ Repositories │       │       │
│  │  │ (User,      │  │ (Interfaces) │       │       │
│  │  │  Role,      │  │              │       │       │
│  │  │  Permission)│  │              │       │       │
│  │  └─────────────┘  └──────────────┘       │       │
│  └──────────────────────────────────────────┘       │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🛠️ Stack Tecnológico

### Backend

- **NestJS**: Framework modular
- **Prisma**: ORM sobre MongoDB
- **MongoDB**: Base de datos NoSQL
- **JWT**: Autenticación basada en tokens
- **Passport**: Estrategias de autenticación (JWT, Google OAuth)
- **bcrypt**: Hashing de contraseñas
- **speakeasy**: Generación de códigos TOTP para 2FA
- **qrcode**: Generación de códigos QR para configuración 2FA

### Observabilidad

- **Winston**: Logging estructurado
- **OpenTelemetry**: Trazabilidad
- **Sentry**: Notificación de errores

---

## 📋 Requisitos

- **Node.js**: v18 o superior
- **npm**: v9 o superior
- **MongoDB**: v6 o superior
- **Redis**: v7 o superior (para sesiones)

---

## 🚀 Instalación

```bash
# Instalar dependencias
npm install

# Generar Prisma Client
npm run prisma:generate

# Ejecutar migraciones
npm run prisma:migrate
```

---

## ⚙️ Configuración

### Variables de Entorno

Crear archivo `.env`:

```bash
# MongoDB
DATABASE_URL="mongodb://localhost:27017/bookly-auth"

# JWT
JWT_SECRET="your-super-secret-key-change-in-production"
JWT_EXPIRATION="15m"
JWT_REFRESH_SECRET="your-refresh-secret-key"
JWT_REFRESH_EXPIRATION="7d"

# Redis (para sesiones)
REDIS_HOST="localhost"
REDIS_PORT=6379
REDIS_PASSWORD=""

# Event Bus
RABBITMQ_URL="amqp://localhost:5672"
RABBITMQ_EXCHANGE="bookly-events"

# SSO (Opcional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
MICROSOFT_CLIENT_ID=""
MICROSOFT_CLIENT_SECRET=""

# CORS
CORS_ORIGIN="http://localhost:3000"

# Port
PORT=3001
```

### Seeds Iniciales

Ejecutar seeds para crear roles y permisos iniciales:

```bash
npm run seed
```

Roles creados:

- **ADMIN**: Acceso completo al sistema
- **COORDINATOR**: Gestión de recursos y aprobaciones
- **PROFESSOR**: Solicitud y uso de recursos
- **STUDENT**: Uso limitado de recursos
- **GUARD**: Control de acceso físico

---

## 📚 API Documentation

### Swagger

Acceder a la documentación interactiva:

```
http://localhost:3001/api/docs
```

### Endpoints Principales

#### Autenticación

- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión
- `POST /api/auth/refresh` - Refrescar access token
- `POST /api/auth/forgot-password` - Solicitar recuperación de contraseña
- `POST /api/auth/reset-password` - Restablecer contraseña

#### Usuarios

- `GET /api/users/:id` - Obtener usuario por ID
- `PATCH /api/users/:id` - Actualizar perfil de usuario
- `DELETE /api/users/:id` - Eliminar usuario

#### Roles

- `GET /api/roles` - Listar todos los roles
- `POST /api/roles` - Crear nuevo rol
- `GET /api/roles/:id` - Obtener rol por ID
- `PATCH /api/roles/:id` - Actualizar rol
- `DELETE /api/roles/:id` - Eliminar rol

#### Permisos

- `GET /api/permissions` - Listar todos los permisos
- `POST /api/permissions` - Crear nuevo permiso
- `GET /api/permissions/:id` - Obtener permiso por ID
- `PATCH /api/permissions/:id` - Actualizar permiso
- `DELETE /api/permissions/:id` - Eliminar permiso

#### Auditoría

- `GET /api/audit/logs` - Consultar logs de auditoría
- `GET /api/audit/user/:userId` - Logs por usuario
- `GET /api/audit/action/:action` - Logs por acción

#### Two-Factor Authentication (2FA)

- `POST /api/auth/2fa/setup` - Generar configuración 2FA (QR code + secret)
- `POST /api/auth/2fa/enable` - Habilitar 2FA con código TOTP
- `POST /api/auth/2fa/disable` - Deshabilitar 2FA
- `POST /api/auth/login/2fa` - Completar login con código TOTP
- `POST /api/auth/login/backup-code` - Completar login con código de backup
- `POST /api/auth/2fa/regenerate-backup-codes` - Regenerar códigos de backup

#### Single Sign-On (SSO)

- `GET /api/oauth/google` - Iniciar autenticación con Google
- `GET /api/oauth/google/callback` - Callback de Google OAuth

**Documentación completa**: Ver [ENDPOINTS.md](docs/ENDPOINTS.md) para detalles de cada endpoint.

---

## 🧪 Testing

### Ejecutar Tests

```bash
# Tests unitarios
npm run test

# Tests E2E
npm run test:e2e

# Cobertura
npm run test:cov
```

### Jasmine BDD

Tests estructurados con Given-When-Then:

```bash
npm run test:bdd
```

---

## 🚀 Deployment

### Docker

```bash
# Build
docker build -t bookly-auth-service .

# Run
docker run -p 3001:3001 bookly-auth-service
```

### Kubernetes

```bash
kubectl apply -f k8s/auth-service/
```

---

## 📊 Métricas y Observabilidad

### Health Check

```bash
curl http://localhost:3001/api/health
```

### Métricas

- **Total de usuarios**: `GET /api/metrics/users/total`
- **Logins diarios**: `GET /api/metrics/logins/daily`
- **Roles activos**: `GET /api/metrics/roles/active`

---

## 🔗 Enlaces Relacionados

### Documentación Técnica

- [Documentación General del Servicio](docs/AUTH_SERVICE.md)
- [Endpoints Completos](docs/ENDPOINTS.md)
- [Arquitectura](docs/ARCHITECTURE.md)
- [Base de Datos](docs/DATABASE.md)
- [Event Bus](docs/EVENT_BUS.md)

### Características Implementadas

- [RF-41: Roles y Permisos](docs/fase1-sprint1-rf41-roles-permisos/)
- [RF-42: Restricciones](docs/fase1-sprint1-rf42-restricciones/)
- [RF-43: SSO Google Workspace](docs/SSO_GOOGLE_WORKSPACE.md)
- [RF-44: Auditoría](docs/fase1-sprint1-rf44-auditoria/)
- [RF-45: Two-Factor Auth (2FA)](docs/TWO_FACTOR_AUTH.md)

### Requerimientos

- [RF-41: Gestión de Roles y Permisos](docs/requirements/RF-41_GESTION_ROLES_PERMISOS.md)
- [RF-42: Restricción de Modificación](docs/requirements/RF-42_RESTRICCION_MODIFICACION.md)
- [RF-43: SSO y Autenticación](docs/requirements/RF-43_SSO_AUTENTICACION.md)
- [RF-44: Auditoría de Accesos](docs/requirements/RF-44_AUDITORIA_ACCESOS.md)
- [RF-45: Autenticación 2FA](docs/requirements/RF-45_AUTENTICACION_2FA.md)

---

**Mantenedores**:

- Bookly Development Team
- UFPS - Universidad Francisco de Paula Santander

**Última actualización**: Noviembre 8, 2025
