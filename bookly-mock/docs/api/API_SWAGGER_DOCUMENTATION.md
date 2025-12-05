# Documentación API Swagger - Bookly

**Fecha**: 2025-11-04  
**Versión**: 1.0

---

## 📋 Índice

- [Acceso a Swagger UI](#acceso-a-swagger-ui)
- [Auth Service](#auth-service)
- [Reports Service](#reports-service)
- [Autenticación](#autenticación)
- [Endpoints Implementados](#endpoints-implementados)

---

## 🌐 Acceso a Swagger UI

### Auth Service

**URL**: `http://localhost:3001/api/docs`

**Descripción**: API de autenticación, gestión de usuarios, roles, permisos y auditoría para el sistema Bookly

**Tags Disponibles**:

- **Autenticación**: Endpoints para autenticación de usuarios
- **Usuarios**: Endpoints para gestión de usuarios
- **Roles**: Endpoints para gestión de roles y asignación de permisos
- **Permissions**: Endpoints para gestión de permisos granulares (resource:action)
- **Audit**: Endpoints para consulta y exportación de logs de auditoría (solo administradores)
- **Health**: Endpoints para health checks del servicio

### Reports Service

**URL**: `http://localhost:3005/api/docs`

**Descripción**: API de reportes, análisis y dashboard de auditoría para el sistema Bookly

**Tags Disponibles**:

- **Usage Reports**: Reportes de uso de recursos
- **Demand Reports**: Reportes de demanda insatisfecha
- **User Reports**: Reportes de actividad de usuarios
- **Audit Dashboard**: Dashboard en tiempo real con estadísticas, alertas y análisis de auditoría

---

## 🔐 Autenticación

Todos los endpoints (excepto login/register) requieren autenticación mediante **Bearer Token**.

### Obtener Token

```bash
# Login
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@bookly.com",
  "password": "Admin123!"
}

# Respuesta
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f191e810c19729de860ea",
      "email": "admin@bookly.com",
      "roles": ["admin"]
    }
  }
}
```

### Usar Token en Swagger

1. Clic en el botón **"Authorize"** (candado)
2. Ingresar: `Bearer YOUR_TOKEN_HERE`
3. Clic en **"Authorize"**
4. Todos los requests incluirán automáticamente el header `Authorization`

---

## 📚 Endpoints Implementados

### Auth Service - Autenticación

| Método | Endpoint                       | Descripción                          | Auth |
| ------ | ------------------------------ | ------------------------------------ | ---- |
| POST   | `/api/v1/auth/register`        | Registrar nuevo usuario              | No   |
| POST   | `/api/v1/auth/login`           | Iniciar sesión                       | No   |
| POST   | `/api/v1/auth/refresh`         | Renovar token                        | Sí   |
| POST   | `/api/v1/auth/logout`          | Cerrar sesión                        | Sí   |
| POST   | `/api/v1/auth/forgot-password` | Solicitar recuperación de contraseña | No   |
| POST   | `/api/v1/auth/reset-password`  | Restablecer contraseña               | No   |

---

### Auth Service - Usuarios

| Método | Endpoint            | Descripción                       | Permiso Requerido |
| ------ | ------------------- | --------------------------------- | ----------------- |
| GET    | `/api/v1/users/me`  | Obtener perfil del usuario actual | Autenticado       |
| GET    | `/api/v1/users`     | Listar todos los usuarios         | `user:read`       |
| GET    | `/api/v1/users/:id` | Obtener usuario por ID            | `user:read`       |
| PUT    | `/api/v1/users/:id` | Actualizar usuario                | `user:update`     |
| DELETE | `/api/v1/users/:id` | Eliminar usuario                  | `user:delete`     |

---

### Auth Service - Roles

| Método | Endpoint                        | Descripción               | Permiso Requerido         |
| ------ | ------------------------------- | ------------------------- | ------------------------- |
| POST   | `/api/v1/roles`                 | Crear nuevo rol           | `role:create`             |
| GET    | `/api/v1/roles`                 | Listar todos los roles    | `role:read`               |
| GET    | `/api/v1/roles/:id`             | Obtener rol por ID        | `role:read`               |
| GET    | `/api/v1/roles/filter/active`   | Obtener roles activos     | `role:read`               |
| GET    | `/api/v1/roles/filter/system`   | Obtener roles del sistema | `role:read`               |
| PUT    | `/api/v1/roles/:id`             | Actualizar rol            | `role:update`             |
| DELETE | `/api/v1/roles/:id`             | Eliminar rol              | `role:delete`             |
| POST   | `/api/v1/roles/:id/permissions` | Asignar permisos a rol    | `role:assign_permissions` |
| DELETE | `/api/v1/roles/:id/permissions` | Remover permisos de rol   | `role:remove_permissions` |

**Ejemplo de Respuesta**:

```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "admin",
    "displayName": "Administrador General",
    "description": "Administrador con acceso completo al sistema",
    "permissions": [
      {
        "id": "507f191e810c19729de860ea",
        "name": "role:create",
        "resource": "role",
        "action": "create"
      }
    ],
    "isActive": true,
    "isDefault": false,
    "isPredefined": true,
    "createdAt": "2025-11-04T10:00:00.000Z"
  }
}
```

---

### Auth Service - Permissions

| Método | Endpoint                               | Descripción                  | Permiso Requerido   |
| ------ | -------------------------------------- | ---------------------------- | ------------------- |
| POST   | `/api/v1/permissions`                  | Crear nuevo permiso          | `permission:create` |
| GET    | `/api/v1/permissions`                  | Listar todos los permisos    | `permission:read`   |
| GET    | `/api/v1/permissions/:id`              | Obtener permiso por ID       | `permission:read`   |
| GET    | `/api/v1/permissions/module/:resource` | Obtener permisos por recurso | `permission:read`   |
| GET    | `/api/v1/permissions/active`           | Obtener permisos activos     | `permission:read`   |
| PUT    | `/api/v1/permissions/:id`              | Actualizar permiso           | `permission:update` |
| DELETE | `/api/v1/permissions/:id`              | Eliminar permiso             | `permission:delete` |
| POST   | `/api/v1/permissions/bulk`             | Crear múltiples permisos     | `permission:create` |

**Formato de Permisos Granulares**:

Los permisos siguen el formato `resource:action`:

- `role:create` - Crear roles
- `role:read` - Leer roles
- `role:update` - Actualizar roles
- `role:delete` - Eliminar roles
- `permission:create` - Crear permisos
- `audit:read` - Leer logs de auditoría
- `audit:export` - Exportar logs
- `audit:admin` - Administrar auditoría

---

### Auth Service - Audit (Nuevo) 🆕

| Método | Endpoint                        | Descripción                | Permiso Requerido |
| ------ | ------------------------------- | -------------------------- | ----------------- |
| GET    | `/api/v1/audit/user/:userId`    | Obtener logs de un usuario | `audit:read`      |
| GET    | `/api/v1/audit/resource`        | Obtener logs de un recurso | `audit:read`      |
| GET    | `/api/v1/audit/failed-attempts` | Obtener intentos fallidos  | `audit:read`      |
| GET    | `/api/v1/audit/export/csv`      | Exportar logs en CSV       | `audit:export`    |
| GET    | `/api/v1/audit/cleanup`         | Limpiar logs antiguos      | `audit:admin`     |

#### Ejemplo: Consultar logs de usuario

**Request**:

```bash
GET /api/v1/audit/user/507f191e810c19729de860ea?status=FAILED&limit=10
Authorization: Bearer TOKEN_CON_AUDIT_READ
```

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": "6733abc123def456789",
      "userId": "507f191e810c19729de860ea",
      "action": "UNAUTHORIZED_ACCESS",
      "resource": "/roles/507f1f77bcf86cd799439011",
      "method": "POST",
      "url": "/roles/507f1f77bcf86cd799439011/permissions",
      "ip": "192.168.1.100",
      "userAgent": "Mozilla/5.0...",
      "status": "FAILED",
      "error": "Insufficient permissions",
      "timestamp": "2025-11-04T21:45:23.000Z"
    }
  ],
  "message": "1 registro(s) encontrado(s) para el usuario 507f191e810c19729de860ea"
}
```

#### Ejemplo: Exportar logs en CSV

**Request**:

```bash
GET /api/v1/audit/export/csv?userId=507f191e810c19729de860ea&startDate=2025-11-01&endDate=2025-11-04&limit=1000
Authorization: Bearer TOKEN_CON_AUDIT_EXPORT
```

**Response**: Archivo CSV descargable

```csv
ID,Usuario,Acción,Recurso,Método,URL,Estado,IP,User Agent,Tiempo de Ejecución (ms),Error,Fecha y Hora
"6733...","507f191...","CREATE","/roles","POST","/roles","SUCCESS","192.168.1.1","Mozilla/5.0...","45","","2025-11-04T21:30:00.000Z"
```

#### Parámetros de Consulta

| Parámetro | Tipo     | Descripción                 | Ejemplo                              |
| --------- | -------- | --------------------------- | ------------------------------------ |
| userId    | string   | Filtrar por usuario         | `507f191e810c19729de860ea`           |
| resource  | string   | Filtrar por recurso         | `/roles/123`                         |
| status    | enum     | SUCCESS o FAILED            | `FAILED`                             |
| action    | enum     | Tipo de acción              | `CREATE`, `UPDATE`, `DELETE`, `VIEW` |
| hours     | number   | Últimas N horas             | `24`                                 |
| startDate | ISO 8601 | Fecha inicial               | `2025-11-01T00:00:00.000Z`           |
| endDate   | ISO 8601 | Fecha final                 | `2025-11-04T23:59:59.000Z`           |
| limit     | number   | Máximo de registros         | `100`                                |
| days      | number   | Días de retención (cleanup) | `90`                                 |

---

### Reports Service - Audit Dashboard (Nuevo) 🆕

| Método | Endpoint                                        | Descripción                     | Permiso Requerido |
| ------ | ----------------------------------------------- | ------------------------------- | ----------------- |
| GET    | `/api/v1/audit-dashboard/statistics`            | Estadísticas generales          | `audit:read`      |
| GET    | `/api/v1/audit-dashboard/time-series`           | Datos para gráficos temporales  | `audit:read`      |
| GET    | `/api/v1/audit-dashboard/unauthorized-attempts` | Intentos no autorizados         | `audit:read`      |
| GET    | `/api/v1/audit-dashboard/user-activity`         | Actividad de un usuario         | `audit:read`      |
| GET    | `/api/v1/audit-dashboard/suspicious-patterns`   | Patrones sospechosos detectados | `audit:read`      |
| GET    | `/api/v1/audit-dashboard/alerts`                | Historial de alertas            | `audit:read`      |
| GET    | `/api/v1/audit-dashboard/alerts/statistics`     | Métricas de alertas             | `audit:read`      |
| GET    | `/api/v1/audit-dashboard/monitor`               | Ejecutar monitoreo manual       | `audit:admin`     |

#### Ejemplo: Estadísticas generales

**Request**:

```bash
GET /api/v1/audit-dashboard/statistics?hours=24
Authorization: Bearer TOKEN
```

**Response**:

```json
{
  "success": true,
  "data": {
    "totalEvents": 15234,
    "successfulEvents": 14890,
    "failedEvents": 344,
    "successRate": 97.74,
    "topUsers": [
      {
        "userId": "507f191e810c19729de860ea",
        "count": 523,
        "successRate": 98.5
      }
    ],
    "topResources": [
      { "resource": "/roles", "count": 1234 },
      { "resource": "/permissions", "count": 987 }
    ],
    "topActions": [
      { "action": "VIEW", "count": 8523 },
      { "action": "CREATE", "count": 2341 }
    ]
  }
}
```

#### Ejemplo: Patrones sospechosos

**Request**:

```bash
GET /api/v1/audit-dashboard/suspicious-patterns?hours=24
Authorization: Bearer TOKEN
```

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "userId": "507f191e810c19729de860ea",
      "failedAttempts": 5,
      "timeWindow": "1 hour",
      "severity": "CRITICAL",
      "latestAttempt": "2025-11-04T22:15:00.000Z",
      "affectedResources": ["/roles/123", "/permissions/456"]
    }
  ],
  "message": "1 patrón(es) sospechoso(s) detectado(s)"
}
```

---

## 📊 Modelos de Datos Swagger

### AuditLogResponseDto

```typescript
{
  id: string;              // ID del log
  userId: string;          // ID del usuario
  action: AuditAction;     // CREATE, UPDATE, DELETE, VIEW, UNAUTHORIZED_ACCESS
  resource: string;        // Recurso afectado
  method: string;          // GET, POST, PUT, DELETE
  url: string;             // URL completa
  ip: string;              // IP del cliente
  userAgent?: string;      // User agent
  status: AuditStatus;     // SUCCESS o FAILED
  executionTime?: number;  // Tiempo en ms
  changes?: object;        // Datos del body
  error?: string;          // Mensaje de error
  timestamp: Date;         // Fecha y hora
}
```

### RoleResponseDto

```typescript
{
  id: string;
  name: string;            // Nombre interno del rol
  displayName: string;     // Nombre visible
  description?: string;
  permissions: Permission[];
  isActive: boolean;
  isDefault: boolean;
  isPredefined: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### PermissionResponseDto

```typescript
{
  id: string;
  name: string;            // Formato: resource:action
  resource: string;        // role, permission, user, etc.
  action: string;          // create, read, update, delete
  description?: string;
  isActive: boolean;
  createdAt: Date;
}
```

---

## 🔍 Filtros y Búsqueda

### Filtros Comunes

Todos los endpoints de listado soportan:

```bash
# Paginación
?page=1&limit=20

# Ordenamiento
?sortBy=createdAt&sortOrder=DESC

# Búsqueda
?search=admin

# Filtros específicos
?isActive=true&isPredefined=false
```

### Filtros de Auditoría

```bash
# Por usuario
?userId=507f191e810c19729de860ea

# Por recurso
?resource=/roles/123

# Por estado
?status=FAILED

# Por rango de tiempo
?startDate=2025-11-01T00:00:00Z&endDate=2025-11-04T23:59:59Z

# Por acción
?action=CREATE

# Últimas N horas
?hours=24
```

---

## 🎨 Códigos de Estado HTTP

| Código | Significado           | Uso                             |
| ------ | --------------------- | ------------------------------- |
| 200    | OK                    | Operación exitosa               |
| 201    | Created               | Recurso creado exitosamente     |
| 400    | Bad Request           | Datos inválidos o faltantes     |
| 401    | Unauthorized          | Token inválido o expirado       |
| 403    | Forbidden             | Sin permisos suficientes        |
| 404    | Not Found             | Recurso no encontrado           |
| 409    | Conflict              | Conflicto (ej: email duplicado) |
| 500    | Internal Server Error | Error del servidor              |

---

## 🚀 Ejemplos de Uso Completos

### 1. Crear un Rol con Permisos

```bash
# 1. Login
POST /api/v1/auth/login
{
  "email": "admin@bookly.com",
  "password": "Admin123!"
}

# 2. Crear Rol
POST /api/v1/roles
Authorization: Bearer TOKEN
{
  "name": "program_coordinator",
  "displayName": "Coordinador de Programa",
  "description": "Coordinador con permisos de gestión de programa",
  "permissionIds": [
    "507f191e810c19729de860ea",
    "507f1f77bcf86cd799439011"
  ],
  "isActive": true
}

# 3. Verificar Auditoría
GET /api/v1/audit/resource?resource=/roles&action=CREATE&limit=1
Authorization: Bearer TOKEN
```

### 2. Consultar y Exportar Logs de Auditoría

```bash
# 1. Ver intentos fallidos
GET /api/v1/audit/failed-attempts?hours=24&limit=50
Authorization: Bearer TOKEN_CON_AUDIT_READ

# 2. Ver actividad de usuario específico
GET /api/v1/audit/user/507f191e810c19729de860ea?limit=100
Authorization: Bearer TOKEN_CON_AUDIT_READ

# 3. Exportar a CSV
GET /api/v1/audit/export/csv?startDate=2025-11-01&endDate=2025-11-04
Authorization: Bearer TOKEN_CON_AUDIT_EXPORT

# 4. Ver dashboard
GET /api/v1/audit-dashboard/statistics?hours=24
Authorization: Bearer TOKEN
```

### 3. Gestionar Permisos de un Rol

```bash
# 1. Obtener rol
GET /api/v1/roles/507f1f77bcf86cd799439011
Authorization: Bearer TOKEN

# 2. Asignar nuevos permisos
POST /api/v1/roles/507f1f77bcf86cd799439011/permissions
Authorization: Bearer TOKEN
{
  "permissionIds": [
    "507f191e810c19729de860ea",
    "507f1f77bcf86cd799439012"
  ]
}

# 3. Remover permisos
DELETE /api/v1/roles/507f1f77bcf86cd799439011/permissions
Authorization: Bearer TOKEN
{
  "permissionIds": ["507f191e810c19729de860ea"]
}
```

---

## 📖 Documentación Adicional

- **RF-41**: `docs/implementaciones/fase1-sprint1-rf41-roles-permisos/`
- **RF-42**: `docs/implementaciones/fase1-sprint1-rf42-restricciones/`
- **RF-44**: `docs/implementaciones/fase1-sprint1-rf44-auditoria/RF44_SISTEMA_AUDITORIA_COMPLETO.md`
- **Plan Auth Service**: `docs/plans/PLAN_02_AUTH_SERVICE.md`

---

## 🔗 URLs Útiles

### Desarrollo Local

- Auth Service Swagger: <http://localhost:3001/api/docs>
- Auth Service Health: <http://localhost:3001/api/v1/health>
- Reports Service Swagger: <http://localhost:3005/api/docs>
- Reports Service Health: <http://localhost:3005/api/v1/health>

### Producción (bookly.com)

- Auth Service Swagger: <https://bookly.com/api/docs>
- Auth Service API: <https://bookly.com/api/v1/auth/>\*
- Reports Service API: <https://bookly.com/api/v1/audit-dashboard/>\*

---

**Última actualización**: 2025-11-04  
**Versión**: 1.0  
**Mantenido por**: Equipo Bookly
