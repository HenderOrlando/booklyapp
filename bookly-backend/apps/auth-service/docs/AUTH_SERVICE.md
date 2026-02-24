# 🔐 Auth Service - Documentación Técnica

## Descripción General

El Auth Service es el microservicio de autenticación y gestión de usuarios del sistema Bookly. Implementa Clean Architecture con CQRS, JWT authentication, y control de acceso basado en roles y permisos.

## 🏗️ Arquitectura

### Capas Implementadas

```
apps/auth-service/src/
├── domain/                    # Lógica de negocio pura
│   ├── entities/
│   │   ├── user.entity.ts
│   │   ├── role.entity.ts
│   │   └── permission.entity.ts
│   └── repositories/
│       ├── user.repository.interface.ts
│       └── role.repository.interface.ts
├── application/               # Casos de uso y servicios
│   ├── commands/
│   │   ├── register-user.command.ts
│   │   ├── login-user.command.ts
│   │   └── change-password.command.ts
│   ├── queries/
│   │   ├── get-user-by-id.query.ts
│   │   └── get-users.query.ts
│   ├── handlers/              # Command & Query handlers
│   │   ├── register-user.handler.ts
│   │   ├── login-user.handler.ts
│   │   ├── change-password.handler.ts
│   │   ├── get-user-by-id.handler.ts
│   │   └── get-users.handler.ts
│   └── services/
│       ├── auth.service.ts
│       └── user.service.ts
├── infrastructure/            # Implementaciones técnicas
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   └── users.controller.ts
│   ├── dto/
│   │   ├── register.dto.ts
│   │   ├── login.dto.ts
│   │   ├── change-password.dto.ts
│   │   └── update-user.dto.ts
│   ├── schemas/
│   │   ├── user.schema.ts
│   │   ├── role.schema.ts
│   │   └── permission.schema.ts
│   ├── repositories/
│   │   ├── user.repository.ts
│   │   └── role.repository.ts
│   └── strategies/
│       └── jwt.strategy.ts
├── auth.module.ts
└── main.ts
```

## 📋 Funcionalidades Implementadas

### 🔑 Autenticación

#### POST /api/v1/auth/register

Registra un nuevo usuario en el sistema.

**Request:**

```json
{
  "email": "user@ufps.edu.co",
  "password": "SecurePassword123!",
  "firstName": "Juan",
  "lastName": "Pérez",
  "roles": ["STUDENT"],
  "permissions": []
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@ufps.edu.co",
    "firstName": "Juan",
    "lastName": "Pérez",
    "roles": ["STUDENT"],
    "isActive": true,
    "isEmailVerified": false
  },
  "message": "Usuario registrado exitosamente"
}
```

#### POST /api/v1/auth/login

Inicia sesión y retorna tokens JWT.

**Request:**

```json
{
  "email": "user@ufps.edu.co",
  "password": "SecurePassword123!"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@ufps.edu.co",
      "firstName": "Juan",
      "lastName": "Pérez",
      "roles": ["STUDENT"]
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  },
  "message": "Inicio de sesión exitoso"
}
```

#### POST /api/v1/auth/change-password

Cambia la contraseña del usuario autenticado.

**Headers:**

```
Authorization: Bearer <token>
```

**Request:**

```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewSecurePassword123!"
}
```

### 👥 Gestión de Usuarios

#### GET /api/v1/users/me

Obtiene el perfil del usuario autenticado.

**Headers:**

```
Authorization: Bearer <token>
```

#### GET /api/v1/users

Lista todos los usuarios (solo administradores).

**Query Parameters:**

- `page` (number, default: 1)
- `limit` (number, default: 10)
- `sortBy` (string, default: "createdAt")
- `sortOrder` ("asc" | "desc", default: "desc")
- `role` (UserRole, optional)

**Roles permitidos:** `GENERAL_ADMIN`, `PROGRAM_ADMIN`

#### GET /api/v1/users/:id

Obtiene un usuario por ID (solo administradores).

**Roles permitidos:** `GENERAL_ADMIN`, `PROGRAM_ADMIN`

## 🔐 Seguridad

### JWT Authentication

- **Access Token:** Expira en 1 día
- **Refresh Token:** Expira en 7 días
- **Secret:** Configurable vía `JWT_SECRET` en .env

### Roles del Sistema

```typescript
enum UserRole {
  STUDENT = "STUDENT",
  TEACHER = "TEACHER",
  GENERAL_ADMIN = "GENERAL_ADMIN",
  PROGRAM_ADMIN = "PROGRAM_ADMIN",
  SECURITY = "SECURITY",
  ADMINISTRATIVE_STAFF = "ADMINISTRATIVE_STAFF",
}
```

### Guards Implementados

- **JwtAuthGuard:** Valida token JWT
- **RolesGuard:** Verifica roles del usuario
- **PermissionsGuard:** Verifica permisos específicos

### Decoradores

- **@CurrentUser():** Extrae usuario del request
- **@Roles(...roles):** Define roles permitidos
- **@Permissions(...perms):** Define permisos requeridos
- **@Public():** Marca ruta como pública

## 🗄️ Modelo de Datos

### User Schema

```typescript
{
  email: string (unique, lowercase)
  password: string (hashed with bcrypt)
  firstName: string
  lastName: string
  roles: UserRole[]
  permissions: string[]
  isActive: boolean
  isEmailVerified: boolean
  lastLogin?: Date
  passwordChangedAt?: Date
  audit: {
    createdBy: string
    updatedBy?: string
    deletedBy?: string
  }
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

### Role Schema

```typescript
{
  name: UserRole (unique)
  displayName: string
  description: string
  permissions: string[]
  isActive: boolean
  isDefault: boolean
  audit: AuditInfo
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

### Permission Schema

```typescript
{
  code: string(unique, uppercase);
  name: string;
  description: string;
  resource: string;
  action: string;
  isActive: boolean;
  audit: AuditInfo;
  createdAt: Date(auto);
  updatedAt: Date(auto);
}
```

## 🧪 Testing

### Comandos de Prueba

```bash
# Ejecutar tests unitarios
npm test auth-service

# Ejecutar con cobertura
npm run test:cov auth-service

# Ejecutar en modo watch
npm run test:watch auth-service
```

## 🚀 Despliegue

### Variables de Entorno

```env
# Server
PORT=3001
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/bookly-auth

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRATION=1d
JWT_REFRESH_EXPIRATION=7d

# CORS
CORS_ORIGIN=*
```

### Iniciar el servicio

```bash
# Development
npm run start:dev auth-service

# Production
npm run build auth-service
npm run start:prod auth-service

# Con Docker
docker-compose up -d auth-service
```

## 📚 Swagger Documentation

Una vez iniciado el servicio, la documentación interactiva está disponible en:

```
http://localhost:3001/api/docs
```

## 🔄 Flujo CQRS

### Command Flow

```
Controller → CommandBus → CommandHandler → Service → Repository → Database
```

**Ejemplo - Register User:**

1. `AuthController.register()` recibe `RegisterDto`
2. Crea `RegisterUserCommand`
3. `CommandBus.execute()` delega a `RegisterUserHandler`
4. Handler llama a `AuthService.register()`
5. Service valida, hashea password, crea usuario
6. Repository persiste en MongoDB
7. Retorna `UserEntity` al controller

### Query Flow

```
Controller → QueryBus → QueryHandler → Service → Repository → Database
```

**Ejemplo - Get User:**

1. `UsersController.getUserById()` recibe ID
2. Crea `GetUserByIdQuery`
3. `QueryBus.execute()` delega a `GetUserByIdHandler`
4. Handler llama a `UserService.getUserById()`
5. Service consulta repository
6. Retorna `UserEntity` al controller

## 📊 Patrones Implementados

- ✅ **Clean Architecture:** Separación de capas (Domain, Application, Infrastructure)
- ✅ **CQRS:** Commands para mutaciones, Queries para consultas
- ✅ **Repository Pattern:** Abstracción de acceso a datos
- ✅ **Dependency Injection:** Vía NestJS
- ✅ **DTOs:** Validación de entrada con class-validator
- ✅ **Strategy Pattern:** Passport JWT Strategy
- ✅ **Guard Pattern:** Control de acceso con Guards

## 🌐 Single Sign-On (SSO) con Google Workspace

El servicio soporta autenticación mediante Google Workspace usando OAuth 2.0.

### Configuración

Ver guía completa en [SSO_GOOGLE_WORKSPACE.md](SSO_GOOGLE_WORKSPACE.md).

### Flujo SSO

```
1. Usuario hace clic en "Login with Google"
   ↓
2. GET /oauth/google → Redirige a Google
   ↓
3. Usuario autoriza en Google
   ↓
4. Google redirige a /oauth/google/callback
   ↓
5. Backend valida token con Google
   ↓
6. Crea/Actualiza usuario en BD
   ↓
7. Asigna roles según dominio de email
   ↓
8. Genera JWT tokens
   ↓
9. Redirige al frontend con tokens
```

### Asignación Automática de Roles

| Dominio Email        | Rol Asignado |
| -------------------- | ------------ |
| `@ufps.edu.co`       | `STUDENT`    |
| `@ufpso.edu.co`      | `STUDENT`    |
| `@cloud.ufps.edu.co` | `PROFESSOR`  |

**Nota**: Usuarios sin dominio institucional son rechazados.

---

## 🔐 Two-Factor Authentication (2FA)

El servicio soporta autenticación de dos factores usando TOTP (Time-based One-Time Password).

### Configuración

Ver guía completa en [TWO_FACTOR_AUTH.md](TWO_FACTOR_AUTH.md).

### Flujo 2FA

```
1. Usuario habilita 2FA:
   POST /auth/2fa/setup → {secret, qrCode, backupCodes}
   ↓
2. Usuario escanea QR con Google Authenticator
   ↓
3. POST /auth/2fa/enable + código TOTP → Habilita 2FA
   ↓
4. Login con 2FA:
   POST /auth/login → {requiresTwoFactor: true, tempToken}
   ↓
5. POST /auth/login/2fa + código TOTP → {accessToken, refreshToken}
```

### Características 2FA

- ✅ TOTP estándar (RFC 6238)
- ✅ QR Code para configuración
- ✅ 10 códigos de backup de emergencia
- ✅ Ventana de tolerancia de ±60 segundos
- ✅ Token temporal de 5 minutos para completar login
- ✅ Eventos publicados (habilitación, deshabilitación, fallas)

---

## ✅ Funcionalidades Implementadas

- ✅ **Autenticación JWT:** Access y Refresh tokens
- ✅ **RBAC:** Roles y Permisos granulares
- ✅ **Auditoría:** Registro completo de acciones
- ✅ **SSO Google Workspace:** OAuth 2.0 integrado
- ✅ **2FA con TOTP:** Autenticación de dos factores
- ✅ **Event Bus:** Publicación de eventos de dominio
- ✅ **Redis:** Cache de sesiones y tokens
- ✅ **Rate Limiting:** Protección contra ataques
- ✅ **Password Hashing:** bcrypt con salt
- ✅ **Email Verification:** Workflow de verificación

## 🔧 Próximas Mejoras

- [ ] Implementar refresh token rotation
- [ ] Agregar WebAuthn/FIDO2 para autenticación sin contraseña
- [ ] Implementar biometría para 2FA
- [ ] Email verification workflow mejorado
- [ ] Tests unitarios y E2E completos
- [ ] Mejoras de seguridad con rate limiting por IP
- [ ] Integración con sistemas de identidad LDAP

## 📞 Soporte

Para dudas o problemas con el Auth Service, revisar:

- Logs del servicio: `/logs/auth-service.log`
- Swagger docs: `http://localhost:3001/api/docs`
- [Endpoints](ENDPOINTS.md)
- [SSO Google Workspace](SSO_GOOGLE_WORKSPACE.md)
- [Two-Factor Auth](TWO_FACTOR_AUTH.md)
- [Arquitectura](ARCHITECTURE.md)
