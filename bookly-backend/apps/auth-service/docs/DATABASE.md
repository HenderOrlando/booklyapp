# 🗄️ Auth Service - Base de Datos

**Fecha**: Noviembre 6, 2025  
**Versión**: 1.0

---

## 📋 Índice

- [Esquema de Datos](#esquema-de-datos)
- [Entidades Principales](#entidades-principales)
- [Relaciones](#relaciones)
- [Índices](#índices)
- [Migraciones](#migraciones)
- [Seeds](#seeds)
- [Optimizaciones](#optimizaciones)

---

## 📊 Esquema de Datos

### Vista General

El Auth Service gestiona 5 colecciones principales en MongoDB:

1. **users** - Usuarios del sistema
2. **roles** - Roles disponibles
3. **permissions** - Permisos granulares
4. **auditlogs** - Registros de auditoría
5. **sessions** - Sesiones activas (opcional)

---

## 🔷 Entidades Principales

### 1. User (Usuario)

```prisma
model User {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  email         String   @unique
  password      String   // Hash bcrypt
  firstName     String
  lastName      String
  isActive      Boolean  @default(true)

  // 2FA
  twoFactorEnabled Boolean @default(false)
  twoFactorSecret  String?

  // SSO
  ssoProvider   String?  // 'google', 'microsoft', etc.
  ssoId         String?

  // Relaciones
  roleIds       String[] @db.ObjectId
  roles         Role[]   @relation(fields: [roleIds], references: [id])

  // Metadatos
  lastLogin     DateTime?
  loginAttempts Int      @default(0)
  lockedUntil   DateTime?

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@map("users")
  @@index([email])
  @@index([isActive])
  @@index([createdAt])
}
```

**Descripción**: Representa un usuario del sistema.

**Campos principales**:

- `email`: Email único del usuario (usado para login)
- `password`: Hash bcrypt de la contraseña
- `firstName`, `lastName`: Nombres del usuario
- `isActive`: Indica si el usuario puede autenticarse
- `twoFactorEnabled`: Si tiene 2FA activo
- `twoFactorSecret`: Secret TOTP para 2FA
- `ssoProvider`, `ssoId`: Para autenticación SSO
- `roleIds`: IDs de roles asignados
- `lastLogin`: Última vez que se autenticó
- `loginAttempts`: Intentos fallidos de login
- `lockedUntil`: Si la cuenta está bloqueada temporalmente

---

### 2. Role (Rol)

```prisma
model Role {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  name          String   @unique
  description   String?
  isActive      Boolean  @default(true)
  isSystem      Boolean  @default(false) // Roles del sistema no se pueden eliminar

  // Relaciones
  permissionIds String[] @db.ObjectId
  permissions   Permission[] @relation(fields: [permissionIds], references: [id])

  userIds       String[] @db.ObjectId
  users         User[]   @relation(fields: [userIds], references: [id])

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@map("roles")
  @@index([name])
  @@index([isActive])
}
```

**Descripción**: Representa un rol en el sistema (ej: admin, student, teacher).

**Campos principales**:

- `name`: Nombre único del rol
- `description`: Descripción del propósito del rol
- `isActive`: Si el rol está activo
- `isSystem`: Si es un rol del sistema (no se puede eliminar)
- `permissionIds`: IDs de permisos asociados

---

### 3. Permission (Permiso)

```prisma
model Permission {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  name        String   @unique
  resource    String   // Ej: 'reservations', 'users', 'resources'
  action      String   // Ej: 'create', 'read', 'update', 'delete'
  description String?

  // Relaciones
  roleIds     String[] @db.ObjectId
  roles       Role[]   @relation(fields: [roleIds], references: [id])

  createdAt   DateTime @default(now())

  @@map("permissions")
  @@index([resource])
  @@index([action])
  @@index([resource, action])
}
```

**Descripción**: Representa un permiso granular.

**Campos principales**:

- `name`: Nombre descriptivo (ej: "Crear Reservas")
- `resource`: Recurso al que aplica
- `action`: Acción permitida
- `description`: Descripción del permiso

**Ejemplos de permisos**:

```json
{
  "name": "Crear Reservas",
  "resource": "reservations",
  "action": "create"
}
{
  "name": "Ver Todos los Usuarios",
  "resource": "users",
  "action": "read:all"
}
```

---

### 4. AuditLog (Registro de Auditoría)

```prisma
model AuditLog {
  id         String   @id @default(auto()) @map("_id") @db.ObjectId
  userId     String?  @db.ObjectId
  action     String   // Ej: 'login', 'logout', 'role_assigned'
  resource   String?  // Recurso afectado
  resourceId String?  // ID del recurso

  // Contexto
  ip         String?
  userAgent  String?
  metadata   Json?    // Datos adicionales

  // Resultado
  success    Boolean  @default(true)
  errorCode  String?
  errorMsg   String?

  timestamp  DateTime @default(now())

  @@map("auditlogs")
  @@index([userId])
  @@index([action])
  @@index([timestamp])
  @@index([userId, timestamp])
}
```

**Descripción**: Registra todas las acciones importantes del sistema.

**Campos principales**:

- `userId`: Usuario que realizó la acción (puede ser null en intentos fallidos)
- `action`: Tipo de acción realizada
- `resource`, `resourceId`: Recurso afectado
- `ip`, `userAgent`: Contexto de la petición
- `metadata`: Datos adicionales en JSON
- `success`: Si la acción fue exitosa
- `timestamp`: Cuándo ocurrió

---

### 5. Session (Sesión) - Opcional

```prisma
model Session {
  id           String   @id @default(auto()) @map("_id") @db.ObjectId
  userId       String   @db.ObjectId
  user         User     @relation(fields: [userId], references: [id])

  // Token
  accessToken  String   @unique
  refreshToken String   @unique

  // Contexto
  ip           String
  userAgent    String

  // Tiempos
  expiresAt    DateTime
  createdAt    DateTime @default(now())
  lastActivity DateTime @default(now())

  @@map("sessions")
  @@index([userId])
  @@index([accessToken])
  @@index([expiresAt])
}
```

**Descripción**: Sesiones activas (alternativa a Redis).

---

## 🔗 Relaciones

### Diagrama de Relaciones

```
┌──────────┐       ┌──────────┐       ┌──────────────┐
│   User   │ *───* │   Role   │ *───* │  Permission  │
└──────────┘       └──────────┘       └──────────────┘
     │
     │ 1
     │
     │ *
┌──────────┐
│AuditLog  │
└──────────┘
```

### Relación Many-to-Many: User ↔ Role

Un usuario puede tener múltiples roles, y un rol puede ser asignado a múltiples usuarios.

```typescript
// Asignar rol a usuario
await prisma.user.update({
  where: { id: userId },
  data: {
    roleIds: { push: roleId },
  },
});

// Obtener usuario con sus roles
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: { roles: true },
});
```

### Relación Many-to-Many: Role ↔ Permission

Un rol puede tener múltiples permisos, y un permiso puede estar en múltiples roles.

```typescript
// Asignar permiso a rol
await prisma.role.update({
  where: { id: roleId },
  data: {
    permissionIds: { push: permissionId },
  },
});

// Obtener rol con sus permisos
const role = await prisma.role.findUnique({
  where: { id: roleId },
  include: { permissions: true },
});
```

---

## 🔍 Índices

### Índices Implementados

| Colección   | Índice               | Tipo     | Uso                             |
| ----------- | -------------------- | -------- | ------------------------------- |
| users       | email_1              | Unique   | Login por email                 |
| users       | isActive_1           | Single   | Filtrar usuarios activos        |
| users       | createdAt_1          | Single   | Ordenar por fecha de creación   |
| roles       | name_1               | Unique   | Buscar rol por nombre           |
| roles       | isActive_1           | Single   | Filtrar roles activos           |
| permissions | resource_1           | Single   | Buscar por recurso              |
| permissions | action_1             | Single   | Buscar por acción               |
| permissions | resource_1_action_1  | Compound | Buscar permiso específico       |
| auditlogs   | userId_1             | Single   | Auditorías de un usuario        |
| auditlogs   | action_1             | Single   | Filtrar por tipo de acción      |
| auditlogs   | timestamp_1          | Single   | Ordenar por fecha               |
| auditlogs   | userId_1_timestamp_1 | Compound | Auditorías de usuario ordenadas |
| sessions    | userId_1             | Single   | Sesiones de un usuario          |
| sessions    | accessToken_1        | Unique   | Validar token                   |
| sessions    | expiresAt_1          | Single   | Limpiar sesiones expiradas      |

### Creación Manual de Índices

Si necesitas crear índices adicionales:

```javascript
// En MongoDB shell
use bookly-auth;

// Índice de texto completo para búsqueda
db.users.createIndex({
  firstName: "text",
  lastName: "text",
  email: "text"
});

// Índice TTL para auto-eliminar sesiones expiradas
db.sessions.createIndex(
  { "expiresAt": 1 },
  { expireAfterSeconds: 0 }
);
```

---

## 🔄 Migraciones

### Ejecutar Migraciones

```bash
# Generar migración
npx prisma migrate dev --name add_2fa_fields

# Aplicar migraciones en producción
npx prisma migrate deploy

# Verificar estado
npx prisma migrate status
```

### Historial de Migraciones

| Fecha      | Migración            | Descripción                 |
| ---------- | -------------------- | --------------------------- |
| 2025-10-01 | init                 | Esquema inicial             |
| 2025-10-15 | add_2fa              | Campos para 2FA             |
| 2025-10-20 | add_sso              | Campos para SSO             |
| 2025-10-25 | add_audit_metadata   | Campo metadata en auditoría |
| 2025-11-01 | add_role_system_flag | Flag isSystem en roles      |

---

## 🌱 Seeds

### Ejecutar Seeds

```bash
npm run seed
```

### Datos Iniciales

#### 1. Permisos Base

```typescript
const permissions = [
  // Reservas
  { name: "Crear Reservas", resource: "reservations", action: "create" },
  { name: "Ver Reservas", resource: "reservations", action: "read" },
  { name: "Modificar Reservas", resource: "reservations", action: "update" },
  { name: "Cancelar Reservas", resource: "reservations", action: "delete" },

  // Usuarios
  { name: "Ver Usuarios", resource: "users", action: "read" },
  { name: "Gestionar Usuarios", resource: "users", action: "manage" },

  // Recursos
  { name: "Ver Recursos", resource: "resources", action: "read" },
  { name: "Gestionar Recursos", resource: "resources", action: "manage" },
];
```

#### 2. Roles Base

```typescript
const roles = [
  {
    name: "admin",
    description: "Administrador del sistema",
    isSystem: true,
    // Todos los permisos
  },
  {
    name: "coordinator",
    description: "Coordinador de programa",
    isSystem: true,
    // Permisos de gestión limitados
  },
  {
    name: "teacher",
    description: "Docente",
    isSystem: true,
    // Crear y ver reservas, ver recursos
  },
  {
    name: "student",
    description: "Estudiante",
    isSystem: true,
    // Solo crear y ver sus propias reservas
  },
];
```

#### 3. Usuario Administrador

```typescript
const adminUser = {
  email: "admin@ufps.edu.co",
  password: await bcrypt.hash("admin123", 10),
  firstName: "Admin",
  lastName: "Sistema",
  isActive: true,
  roleIds: [adminRoleId],
};
```

---

## ⚡ Optimizaciones

### 1. Query Optimization

**Problema**: Obtener usuario con roles y permisos es lento

**Solución**: Usar projection para solo traer campos necesarios

```typescript
// ❌ Trae todo
const user = await prisma.user.findUnique({
  where: { id },
  include: {
    roles: {
      include: { permissions: true },
    },
  },
});

// ✅ Solo campos necesarios
const user = await prisma.user.findUnique({
  where: { id },
  select: {
    id: true,
    email: true,
    firstName: true,
    roles: {
      select: {
        name: true,
        permissions: {
          select: {
            resource: true,
            action: true,
          },
        },
      },
    },
  },
});
```

---

### 2. Connection Pooling

Configuración de Prisma para pool de conexiones:

```typescript
// prisma/schema.prisma
datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")

  // Pool configuration
  connection_limit = 10
}
```

---

### 3. Bulk Operations

Para crear múltiples permisos o roles:

```typescript
// ❌ Lento - crea uno por uno
for (const permission of permissions) {
  await prisma.permission.create({ data: permission });
}

// ✅ Rápido - bulk insert
await prisma.permission.createMany({
  data: permissions,
  skipDuplicates: true,
});
```

---

### 4. Agregaciones Eficientes

Contar usuarios por rol usando agregación de MongoDB:

```typescript
const usersByRole = await prisma.$runCommandRaw({
  aggregate: "users",
  pipeline: [
    { $unwind: "$roleIds" },
    { $group: { _id: "$roleIds", count: { $sum: 1 } } },
  ],
  cursor: {},
});
```

---

### 5. Índices Compuestos

Para consultas frecuentes combinadas:

```typescript
// Consulta: usuarios activos ordenados por fecha
// Índice: { isActive: 1, createdAt: -1 }
const users = await prisma.user.findMany({
  where: { isActive: true },
  orderBy: { createdAt: "desc" },
});
```

---

## 📈 Estadísticas

### Tamaño Estimado por Colección

| Colección   | Docs      | Tamaño Promedio | Total Estimado |
| ----------- | --------- | --------------- | -------------- |
| users       | 10,000    | 500 bytes       | 5 MB           |
| roles       | 10        | 300 bytes       | 3 KB           |
| permissions | 50        | 200 bytes       | 10 KB          |
| auditlogs   | 1,000,000 | 400 bytes       | 400 MB         |
| sessions    | 500       | 300 bytes       | 150 KB         |

---

## 🔒 Seguridad

### 1. Nunca Exponer Contraseñas

```typescript
// ✅ Excluir password en queries
const user = await prisma.user.findUnique({
  where: { id },
  select: {
    id: true,
    email: true,
    firstName: true,
    lastName: true,
    // NO incluir password
  },
});
```

### 2. Sanitizar Inputs

Prisma previene SQL injection, pero siempre validar inputs:

```typescript
import { IsEmail, IsString, MinLength } from "class-validator";

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}
```

---

## 📚 Referencias

- [Arquitectura](ARCHITECTURE.md)
- [Endpoints API](ENDPOINTS.md)
- [Prisma Documentation](https://www.prisma.io/docs)

---

**Mantenedores**: Bookly Development Team  
**Última actualización**: Noviembre 6, 2025
