# 🏗️ Auth Service - Arquitectura

**Fecha**: Noviembre 6, 2025  
**Versión**: 1.0

---

## 📋 Índice

- [Visión General](#visión-general)
- [Capas de la Arquitectura](#capas-de-la-arquitectura)
- [Patrones Implementados](#patrones-implementados)
- [Event-Driven Architecture](#event-driven-architecture)
- [Comunicación con Otros Servicios](#comunicación-con-otros-servicios)
- [Seguridad](#seguridad)
- [Cache y Performance](#cache-y-performance)

---

## 🎯 Visión General

El **Auth Service** es el guardián de seguridad del sistema Bookly, responsable de:

- Autenticación de usuarios
- Autorización basada en roles y permisos
- Gestión de sesiones y tokens JWT
- Auditoría de accesos
- Autenticación de dos factores (2FA)
- Single Sign-On (SSO)

### Diagrama de Arquitectura de Alto Nivel

```
┌─────────────────────────────────────────────────────────┐
│                    Auth Service                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌───────────────────────────────────────────────┐      │
│  │        Infrastructure Layer                   │      │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐     │      │
│  │  │  Auth    │  │  Roles   │  │  Audit   │     │      │
│  │  │Controller│  │Controller│  │Controller│     │      │
│  │  └──────────┘  └──────────┘  └──────────┘     │      │
│  └───────────────────────────────────────────────┘      │
│                                                         │
│  ┌───────────────────────────────────────────────┐      │
│  │        Application Layer (CQRS)               │      │
│  │  ┌────────────┐  ┌────────────┐               │      │
│  │  │  Commands  │  │  Queries   │               │      │
│  │  ├────────────┤  ├────────────┤               │      │
│  │  │ Register   │  │ GetUser    │               │      │
│  │  │ Login      │  │ GetRoles   │               │      │
│  │  │ Logout     │  │ GetPerms   │               │      │
│  │  │ AssignRole │  │ CheckPerm  │               │      │
│  │  └────────────┘  └────────────┘               │      │
│  │                                               │      │
│  │  ┌────────────────────────────────────┐       │      │
│  │  │         Services                   │       │      │
│  │  │  • AuthService                     │       │      │
│  │  │  • RoleService                     │       │      │
│  │  │  • PermissionService               │       │      │
│  │  │  • AuditService                    │       │      │
│  │  │  • TokenService                    │       │      │
│  │  │  • TwoFactorService                │       │      │
│  │  └────────────────────────────────────┘       │      │
│  └───────────────────────────────────────────────┘      │
│                                                         │
│  ┌───────────────────────────────────────────────┐      │
│  │        Domain Layer                           │      │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐     │      │
│  │  │   User   │  │   Role   │  │Permission│     │      │
│  │  │ Entity   │  │ Entity   │  │  Entity  │     │      │
│  │  └──────────┘  └──────────┘  └──────────┘     │      │
│  │                                               │      │
│  │  ┌──────────────────────────────────────┐     │      │
│  │  │        Repositories                  │     │      │
│  │  │  • UserRepository                    │     │      │
│  │  │  • RoleRepository                    │     │      │
│  │  │  • PermissionRepository              │     │      │
│  │  │  • AuditLogRepository                │     │      │
│  │  └──────────────────────────────────────┘     │      │
│  └───────────────────────────────────────────────┘      │
│                                                         │
└─────────────────────────────────────────────────────────┘
          │                          │
          │                          │
    ┌─────▼──────┐            ┌──────▼─────┐
    │  MongoDB   │            │  Event Bus │
    │  Database  │            │  RabbitMQ  │
    └────────────┘            └────────────┘
```

---

## 📦 Capas de la Arquitectura

### Domain Layer (Capa de Dominio)

**Responsabilidad**: Encapsula la lógica de negocio central y las reglas de dominio.

**Componentes**:

#### Entidades

- **`User`**: Usuario del sistema
  - Atributos: id, email, password (hash), firstName, lastName, isActive, createdAt
  - Relaciones: roles[], sessions[]

- **`Role`**: Rol en el sistema
  - Atributos: id, name, description, isActive
  - Relaciones: permissions[], users[]

- **`Permission`**: Permiso específico
  - Atributos: id, name, resource, action, description
  - Ejemplo: `{ resource: "reservations", action: "create" }`

- **`AuditLog`**: Registro de auditoría
  - Atributos: id, userId, action, resource, metadata, ip, timestamp

#### Repositorios (Interfaces)

```typescript
interface IUserRepository {
  findById(id: string): Promise<User>;
  findByEmail(email: string): Promise<User>;
  create(data: CreateUserDto): Promise<User>;
  update(id: string, data: UpdateUserDto): Promise<User>;
  assignRole(userId: string, roleId: string): Promise<void>;
}

interface IRoleRepository {
  findById(id: string): Promise<Role>;
  findByName(name: string): Promise<Role>;
  findAll(): Promise<Role[]>;
  assignPermission(roleId: string, permissionId: string): Promise<void>;
}
```

---

### Application Layer (Capa de Aplicación)

**Responsabilidad**: Orquesta el flujo de datos y ejecuta casos de uso.

#### Commands (Escritura)

```typescript
// Autenticación
RegisterUserCommand;
LoginCommand;
LogoutCommand;
RefreshTokenCommand;
ForgotPasswordCommand;
ResetPasswordCommand;

// Roles
CreateRoleCommand;
AssignRoleToUserCommand;
RemoveRoleFromUserCommand;
UpdateRoleCommand;

// Permisos
CreatePermissionCommand;
AssignPermissionToRoleCommand;
RemovePermissionFromRoleCommand;

// 2FA
Enable2FACommand;
Verify2FACommand;
Disable2FACommand;
```

#### Queries (Lectura)

```typescript
// Usuarios
GetUserByIdQuery;
GetUserByEmailQuery;
GetUsersQuery;

// Roles
GetRoleByIdQuery;
GetRolesQuery;
GetUserRolesQuery;

// Permisos
GetPermissionsQuery;
GetRolePermissionsQuery;
CheckUserPermissionQuery;

// Auditoría
GetAuditLogsQuery;
GetUserAuditLogsQuery;
```

#### Services

- **`AuthService`**: Lógica de autenticación
- **`RoleService`**: Gestión de roles
- **`PermissionService`**: Gestión de permisos
- **`TokenService`**: Generación y validación de JWT
- **`AuditService`**: Registro de auditoría
- **`TwoFactorService`**: Autenticación de dos factores
- **`PasswordService`**: Hash y validación de contraseñas

---

### Infrastructure Layer (Capa de Infraestructura)

**Responsabilidad**: Maneja detalles técnicos de comunicación externa.

#### Controllers

```typescript
@Controller('auth')
export class AuthController {
  @Post('register')
  @Post('login')
  @Post('logout')
  @Post('refresh')
  @Post('forgot-password')
  @Post('reset-password')
}

@Controller('roles')
export class RolesController {
  @Get()
  @Post()
  @Get(':id')
  @Patch(':id')
  @Delete(':id')
  @Post(':id/permissions')
}

@Controller('audit')
export class AuditController {
  @Get()
  @Get('user/:userId')
  @Get('export')
}
```

#### Adaptadores

- **`PrismaUserRepository`**: Implementación de `IUserRepository`
- **`PrismaRoleRepository`**: Implementación de `IRoleRepository`
- **`EventBusAdapter`**: Publicación de eventos
- **`CacheAdapter`**: Redis para tokens blacklist

---

## 🎨 Patrones Implementados

### 1. CQRS (Command Query Responsibility Segregation)

**Separación de comandos y consultas**:

```typescript
// Command - Modifica estado
@CommandHandler(RegisterUserCommand)
export class RegisterUserHandler {
  async execute(command: RegisterUserCommand): Promise<UserDto> {
    // 1. Validar datos
    // 2. Hash password
    // 3. Crear usuario
    // 4. Publicar UserRegisteredEvent
    // 5. Retornar DTO
  }
}

// Query - Solo lectura
@QueryHandler(GetUserByIdQuery)
export class GetUserByIdHandler {
  async execute(query: GetUserByIdQuery): Promise<UserDto> {
    // 1. Buscar en DB
    // 2. Mapear a DTO
    // 3. Retornar
  }
}
```

---

### 2. Repository Pattern

**Abstracción de acceso a datos**:

```typescript
// Domain Layer - Interface
export interface IUserRepository {
  findById(id: string): Promise<User>;
}

// Infrastructure Layer - Implementación
@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return this.toDomain(user);
  }
}
```

---

### 3. Strategy Pattern

**Múltiples estrategias de autenticación**:

```typescript
interface IAuthStrategy {
  authenticate(credentials: any): Promise<User>;
}

class LocalAuthStrategy implements IAuthStrategy {
  async authenticate({ email, password }): Promise<User> {
    // Autenticación con email/password
  }
}

class SSOAuthStrategy implements IAuthStrategy {
  async authenticate({ token }): Promise<User> {
    // Autenticación con SSO
  }
}

class TwoFactorAuthStrategy implements IAuthStrategy {
  async authenticate({ userId, code }): Promise<User> {
    // Verificación 2FA
  }
}
```

---

### 4. Decorator Pattern

**Guards para protección de endpoints**:

```typescript
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles('admin', 'coordinator')
@Permissions('users:delete')
@Delete('users/:id')
async deleteUser(@Param('id') id: string) {
  // Solo ejecuta si pasa todos los guards
}
```

---

## 🔄 Event-Driven Architecture

### Eventos Publicados

El Auth Service publica eventos para notificar cambios a otros servicios:

```typescript
// Usuario registrado
UserRegisteredEvent {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  timestamp: Date;
}

// Usuario autenticado
UserLoggedInEvent {
  userId: string;
  ip: string;
  userAgent: string;
  timestamp: Date;
}

// Rol asignado
RoleAssignedEvent {
  userId: string;
  roleId: string;
  roleName: string;
  assignedBy: string;
  timestamp: Date;
}

// Intento de acceso no autorizado
UnauthorizedAccessAttemptEvent {
  userId?: string;
  resource: string;
  action: string;
  ip: string;
  reason: string;
  timestamp: Date;
}
```

### Eventos Consumidos

El Auth Service NO consume eventos de otros servicios. Es autónomo.

### Publicación de Eventos

```typescript
@Injectable()
export class AuthService {
  constructor(private eventBus: EventBusService) {}

  async register(dto: RegisterUserDto): Promise<User> {
    const user = await this.userRepository.create(dto);

    // Publicar evento
    await this.eventBus.publish(
      "auth.user.registered",
      new UserRegisteredEvent(user)
    );

    return user;
  }
}
```

---

## 🔗 Comunicación con Otros Servicios

### Servicios que Consumen Auth Service

Todos los servicios del sistema consultan Auth Service para:

1. **Validación de JWT**: Verificar tokens en cada request
2. **Verificación de Permisos**: Antes de ejecutar acciones
3. **Información de Usuario**: Obtener datos del usuario actual

```typescript
// Otros servicios hacen requests HTTP
GET /auth/validate-token
POST /auth/check-permission
GET /auth/user/:id
```

### Auth Service NO consume otros servicios

Es completamente autónomo y no depende de otros microservicios.

---

## 🔐 Seguridad

### 1. Hashing de Contraseñas

```typescript
import * as bcrypt from 'bcrypt';

async hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async validatePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

---

### 2. JWT (JSON Web Tokens)

**Estructura del Token**:

```json
{
  "sub": "user-id",
  "email": "user@example.com",
  "roles": ["student"],
  "permissions": ["reservations:create", "reservations:read"],
  "iat": 1699286400,
  "exp": 1699372800
}
```

**Tokens con expiración**:

- **Access Token**: 15 minutos
- **Refresh Token**: 7 días

---

### 3. Blacklist de Tokens

Tokens revocados se almacenan en Redis:

```typescript
async revokeToken(token: string): Promise<void> {
  const decoded = this.jwtService.decode(token);
  const ttl = decoded.exp - Math.floor(Date.now() / 1000);

  await this.redis.set(
    `blacklist:${token}`,
    '1',
    'EX',
    ttl
  );
}
```

---

### 4. Rate Limiting

Protección contra ataques de fuerza bruta:

```typescript
@UseGuards(ThrottlerGuard)
@Throttle(5, 60) // 5 intentos por minuto
@Post('login')
async login() {
  // ...
}
```

---

### 5. Autenticación de Dos Factores (2FA)

Usando TOTP (Time-based One-Time Password):

```typescript
import * as speakeasy from 'speakeasy';

async generate2FASecret(userId: string) {
  const secret = speakeasy.generateSecret();
  await this.userRepository.update(userId, {
    twoFactorSecret: secret.base32
  });
  return secret;
}

async verify2FACode(userId: string, code: string): Promise<boolean> {
  const user = await this.userRepository.findById(userId);
  return speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'base32',
    token: code
  });
}
```

---

## ⚡ Cache y Performance

### Estrategia de Cache

**Redis para**:

1. **Tokens blacklist**: TTL = tiempo hasta expiración del token
2. **Sesiones activas**: TTL = 15 minutos
3. **Permisos de usuario**: TTL = 5 minutos

```typescript
async getUserPermissions(userId: string): Promise<string[]> {
  // Intentar cache
  const cached = await this.redis.get(`permissions:${userId}`);
  if (cached) return JSON.parse(cached);

  // Si no está en cache, buscar en DB
  const permissions = await this.permissionRepository.findByUserId(userId);

  // Guardar en cache
  await this.redis.set(
    `permissions:${userId}`,
    JSON.stringify(permissions),
    'EX',
    300 // 5 minutos
  );

  return permissions;
}
```

### Invalidación de Cache

Al cambiar roles o permisos:

```typescript
async assignRole(userId: string, roleId: string): Promise<void> {
  await this.userRepository.assignRole(userId, roleId);

  // Invalidar cache de permisos
  await this.redis.del(`permissions:${userId}`);
}
```

---

## 📊 Métricas y Observabilidad

### Logs Estructurados

```typescript
this.logger.log({
  event: "user.login.success",
  userId: user.id,
  email: user.email,
  ip: req.ip,
  timestamp: new Date(),
});
```

### Trazabilidad

OpenTelemetry traces para:

- Tiempo de autenticación
- Tiempo de validación de permisos
- Consultas a base de datos

---

## 🔄 Flujo de Autenticación Completo

```
1. Usuario envía credenciales
   ↓
2. AuthController recibe request
   ↓
3. LoginCommand se ejecuta
   ↓
4. LoginHandler valida credenciales
   ↓
5. PasswordService verifica hash
   ↓
6. Si tiene 2FA: solicitar código
   ↓
7. TokenService genera JWT
   ↓
8. AuditService registra login
   ↓
9. EventBus publica UserLoggedInEvent
   ↓
10. Retorna tokens al cliente
```

---

## 📚 Referencias

- [Esquema de Base de Datos](DATABASE.md)
- [Endpoints API](ENDPOINTS.md)
- [Event Bus](EVENT_BUS.md)
- [Requerimientos RF-41 a RF-45](requirements/)

---

**Mantenedores**: Bookly Development Team  
**Última actualización**: Noviembre 6, 2025
