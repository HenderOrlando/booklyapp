# 🔌 Auth Service - Endpoints

**Fecha**: Noviembre 6, 2025  
**Versión**: 1.0  
**Base URL**: `http://localhost:3001/api`

---

## 📋 Índice

- [Health Check](#health-check)
- [Autenticación](#autenticación)
- [Gestión de Usuarios](#gestión-de-usuarios)
- [Gestión de Roles](#gestión-de-roles)
- [Gestión de Permisos](#gestión-de-permisos)
- [Auditoría](#auditoría)
- [Autenticación de Dos Factores (2FA)](#autenticación-de-dos-factores-2fa)
- [Single Sign-On (SSO)](#single-sign-on-sso-con-google-workspace)

---

## 🔐 Autenticación

Todos los endpoints (excepto login, register y health) requieren token JWT:

```bash
Authorization: Bearer <access_token>
```

---

## 🏥 Health Check

### Health Status

```http
GET /health
```

**Response 200**:

```json
{
  "status": "healthy",
  "timestamp": "2025-11-06T20:00:00.000Z",
  "services": {
    "database": "connected",
    "redis": "connected",
    "eventBus": "connected"
  }
}
```

---

## 🔓 Autenticación

### Register (Registro de Usuario)

```http
POST /auth/register
Content-Type: application/json
```

**Body**:

```json
{
  "email": "juan.perez@ufps.edu.co",
  "password": "SecurePass123!",
  "firstName": "Juan",
  "lastName": "Pérez"
}
```

**Response 201**:

```json
{
  "id": "507f1f77bcf86cd799439011",
  "email": "juan.perez@ufps.edu.co",
  "firstName": "Juan",
  "lastName": "Pérez",
  "isActive": true,
  "roles": ["student"],
  "createdAt": "2025-11-06T20:00:00.000Z"
}
```

**Errores**:

- `400` - Email ya registrado
- `400` - Contraseña no cumple requisitos
- `422` - Datos de entrada inválidos

---

### Login (Iniciar Sesión)

```http
POST /auth/login
Content-Type: application/json
```

**Body**:

```json
{
  "email": "juan.perez@ufps.edu.co",
  "password": "SecurePass123!"
}
```

**Response 200**:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 900,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "juan.perez@ufps.edu.co",
    "firstName": "Juan",
    "lastName": "Pérez",
    "roles": ["student"]
  }
}
```

**Errores**:

- `401` - Credenciales inválidas
- `403` - Usuario inactivo
- `403` - Cuenta bloqueada (demasiados intentos fallidos)
- `428` - Requiere verificación 2FA

---

### Login con 2FA

```http
POST /auth/login/2fa
Content-Type: application/json
Authorization: Bearer <temp_token>
```

**Body**:

```json
{
  "code": "123456"
}
```

**Response 200**:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 900
}
```

**Errores**:

- `401` - Código 2FA inválido
- `410` - Código 2FA expirado

---

### Refresh Token (Renovar Token)

```http
POST /auth/refresh
Content-Type: application/json
```

**Body**:

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response 200**:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 900
}
```

**Errores**:

- `401` - Refresh token inválido o expirado
- `401` - Refresh token revocado

---

### Logout (Cerrar Sesión)

```http
POST /auth/logout
Authorization: Bearer <access_token>
```

**Response 200**:

```json
{
  "message": "Logout successful"
}
```

---

### Forgot Password (Olvidé mi Contraseña)

```http
POST /auth/forgot-password
Content-Type: application/json
```

**Body**:

```json
{
  "email": "juan.perez@ufps.edu.co"
}
```

**Response 200**:

```json
{
  "message": "Password reset email sent"
}
```

**Nota**: Por seguridad, siempre retorna 200 incluso si el email no existe.

---

### Reset Password (Restablecer Contraseña)

```http
POST /auth/reset-password
Content-Type: application/json
```

**Body**:

```json
{
  "token": "reset-token-from-email",
  "newPassword": "NewSecurePass123!"
}
```

**Response 200**:

```json
{
  "message": "Password reset successful"
}
```

**Errores**:

- `400` - Token inválido o expirado
- `400` - Nueva contraseña no cumple requisitos

---

### Validate Token (Validar Token)

```http
GET /auth/validate-token
Authorization: Bearer <access_token>
```

**Response 200**:

```json
{
  "valid": true,
  "userId": "507f1f77bcf86cd799439011",
  "email": "juan.perez@ufps.edu.co",
  "roles": ["student"],
  "permissions": ["reservations:create", "reservations:read"]
}
```

**Errores**:

- `401` - Token inválido o expirado

---

## 👥 Gestión de Usuarios

### Listar Usuarios

```http
GET /users?page=1&limit=20&search=juan&role=student
Authorization: Bearer <access_token>
```

**Query Parameters**:

- `page` (number): Número de página (default: 1)
- `limit` (number): Elementos por página (default: 20, max: 100)
- `search` (string): Buscar por nombre o email
- `role` (string): Filtrar por rol
- `isActive` (boolean): Filtrar por estado

**Response 200**:

```json
{
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "email": "juan.perez@ufps.edu.co",
      "firstName": "Juan",
      "lastName": "Pérez",
      "isActive": true,
      "roles": ["student"],
      "lastLogin": "2025-11-06T19:00:00.000Z",
      "createdAt": "2025-10-01T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

**Permisos requeridos**: `users:read`

---

### Obtener Usuario por ID

```http
GET /users/:id
Authorization: Bearer <access_token>
```

**Response 200**:

```json
{
  "id": "507f1f77bcf86cd799439011",
  "email": "juan.perez@ufps.edu.co",
  "firstName": "Juan",
  "lastName": "Pérez",
  "isActive": true,
  "twoFactorEnabled": false,
  "roles": [
    {
      "id": "507f1f77bcf86cd799439012",
      "name": "student",
      "description": "Estudiante"
    }
  ],
  "lastLogin": "2025-11-06T19:00:00.000Z",
  "createdAt": "2025-10-01T10:00:00.000Z",
  "updatedAt": "2025-11-06T19:00:00.000Z"
}
```

**Errores**:

- `404` - Usuario no encontrado

**Permisos requeridos**: `users:read` o ser el propio usuario

---

### Actualizar Usuario

```http
PATCH /users/:id
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Body**:

```json
{
  "firstName": "Juan Carlos",
  "lastName": "Pérez García",
  "isActive": true
}
```

**Response 200**:

```json
{
  "id": "507f1f77bcf86cd799439011",
  "email": "juan.perez@ufps.edu.co",
  "firstName": "Juan Carlos",
  "lastName": "Pérez García",
  "isActive": true,
  "updatedAt": "2025-11-06T20:05:00.000Z"
}
```

**Permisos requeridos**: `users:update` o ser el propio usuario (campos limitados)

---

### Asignar Rol a Usuario

```http
POST /users/:id/roles
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Body**:

```json
{
  "roleId": "507f1f77bcf86cd799439013"
}
```

**Response 200**:

```json
{
  "id": "507f1f77bcf86cd799439011",
  "roles": [
    {
      "id": "507f1f77bcf86cd799439012",
      "name": "student"
    },
    {
      "id": "507f1f77bcf86cd799439013",
      "name": "teacher"
    }
  ]
}
```

**Permisos requeridos**: `users:manage`

---

### Remover Rol de Usuario

```http
DELETE /users/:id/roles/:roleId
Authorization: Bearer <access_token>
```

**Response 200**:

```json
{
  "message": "Role removed successfully"
}
```

**Permisos requeridos**: `users:manage`

---

## 🎭 Gestión de Roles

### Listar Roles

```http
GET /roles?isActive=true
Authorization: Bearer <access_token>
```

**Response 200**:

```json
{
  "data": [
    {
      "id": "507f1f77bcf86cd799439012",
      "name": "student",
      "description": "Estudiante del sistema",
      "isActive": true,
      "isSystem": true,
      "permissionsCount": 5
    },
    {
      "id": "507f1f77bcf86cd799439013",
      "name": "teacher",
      "description": "Docente",
      "isActive": true,
      "isSystem": true,
      "permissionsCount": 12
    }
  ]
}
```

**Permisos requeridos**: `roles:read`

---

### Obtener Rol por ID

```http
GET /roles/:id
Authorization: Bearer <access_token>
```

**Response 200**:

```json
{
  "id": "507f1f77bcf86cd799439012",
  "name": "student",
  "description": "Estudiante del sistema",
  "isActive": true,
  "isSystem": true,
  "permissions": [
    {
      "id": "507f1f77bcf86cd799439020",
      "name": "Crear Reservas",
      "resource": "reservations",
      "action": "create"
    },
    {
      "id": "507f1f77bcf86cd799439021",
      "name": "Ver Reservas",
      "resource": "reservations",
      "action": "read"
    }
  ],
  "createdAt": "2025-10-01T00:00:00.000Z"
}
```

**Permisos requeridos**: `roles:read`

---

### Crear Rol

```http
POST /roles
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Body**:

```json
{
  "name": "lab-assistant",
  "description": "Asistente de laboratorio",
  "permissionIds": ["507f1f77bcf86cd799439020", "507f1f77bcf86cd799439021"]
}
```

**Response 201**:

```json
{
  "id": "507f1f77bcf86cd799439030",
  "name": "lab-assistant",
  "description": "Asistente de laboratorio",
  "isActive": true,
  "isSystem": false,
  "permissions": [...]
}
```

**Permisos requeridos**: `roles:manage`

---

### Actualizar Rol

```http
PATCH /roles/:id
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Body**:

```json
{
  "description": "Asistente de laboratorio actualizado",
  "isActive": true
}
```

**Response 200**:

```json
{
  "id": "507f1f77bcf86cd799439030",
  "name": "lab-assistant",
  "description": "Asistente de laboratorio actualizado",
  "updatedAt": "2025-11-06T20:10:00.000Z"
}
```

**Nota**: No se puede modificar `name` ni `isSystem` de roles del sistema.

**Permisos requeridos**: `roles:manage`

---

### Eliminar Rol

```http
DELETE /roles/:id
Authorization: Bearer <access_token>
```

**Response 200**:

```json
{
  "message": "Role deleted successfully"
}
```

**Nota**: No se pueden eliminar roles del sistema (`isSystem: true`).

**Permisos requeridos**: `roles:manage`

---

## 🔑 Gestión de Permisos

### Listar Permisos

```http
GET /permissions?resource=reservations
Authorization: Bearer <access_token>
```

**Query Parameters**:

- `resource` (string): Filtrar por recurso
- `action` (string): Filtrar por acción

**Response 200**:

```json
{
  "data": [
    {
      "id": "507f1f77bcf86cd799439020",
      "name": "Crear Reservas",
      "resource": "reservations",
      "action": "create",
      "description": "Permite crear nuevas reservas"
    },
    {
      "id": "507f1f77bcf86cd799439021",
      "name": "Ver Reservas",
      "resource": "reservations",
      "action": "read",
      "description": "Permite ver reservas"
    }
  ]
}
```

**Permisos requeridos**: `permissions:read`

---

### Crear Permiso

```http
POST /permissions
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Body**:

```json
{
  "name": "Exportar Reportes",
  "resource": "reports",
  "action": "export",
  "description": "Permite exportar reportes a CSV/PDF"
}
```

**Response 201**:

```json
{
  "id": "507f1f77bcf86cd799439040",
  "name": "Exportar Reportes",
  "resource": "reports",
  "action": "export",
  "description": "Permite exportar reportes a CSV/PDF",
  "createdAt": "2025-11-06T20:15:00.000Z"
}
```

**Permisos requeridos**: `permissions:manage`

---

### Verificar Permiso de Usuario

```http
POST /permissions/check
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Body**:

```json
{
  "userId": "507f1f77bcf86cd799439011",
  "resource": "reservations",
  "action": "create"
}
```

**Response 200**:

```json
{
  "hasPermission": true,
  "grantedBy": "role:student"
}
```

**Permisos requeridos**: Cualquier usuario autenticado

---

## 📊 Auditoría

### Listar Logs de Auditoría

```http
GET /audit?userId=507f1f77bcf86cd799439011&page=1&limit=50
Authorization: Bearer <access_token>
```

**Query Parameters**:

- `userId` (string): Filtrar por usuario
- `action` (string): Filtrar por acción
- `success` (boolean): Filtrar por éxito/fallo
- `from` (date): Fecha inicio
- `to` (date): Fecha fin
- `page` (number): Página
- `limit` (number): Elementos por página

**Response 200**:

```json
{
  "data": [
    {
      "id": "507f1f77bcf86cd799439050",
      "userId": "507f1f77bcf86cd799439011",
      "action": "login",
      "resource": null,
      "ip": "192.168.1.100",
      "userAgent": "Mozilla/5.0...",
      "success": true,
      "timestamp": "2025-11-06T19:00:00.000Z"
    },
    {
      "id": "507f1f77bcf86cd799439051",
      "userId": "507f1f77bcf86cd799439011",
      "action": "role_assigned",
      "resource": "roles",
      "resourceId": "507f1f77bcf86cd799439013",
      "metadata": {
        "roleName": "teacher",
        "assignedBy": "admin@ufps.edu.co"
      },
      "success": true,
      "timestamp": "2025-11-06T19:05:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 250
  }
}
```

**Permisos requeridos**: `audit:read`

---

### Exportar Logs de Auditoría

```http
GET /audit/export?format=csv&from=2025-11-01&to=2025-11-06
Authorization: Bearer <access_token>
```

**Query Parameters**:

- `format` (string): `csv` o `json`
- `from` (date): Fecha inicio (requerido)
- `to` (date): Fecha fin (requerido)

**Response 200**:

```csv
id,userId,action,resource,ip,success,timestamp
507f1f77bcf86cd799439050,507f1f77bcf86cd799439011,login,null,192.168.1.100,true,2025-11-06T19:00:00.000Z
...
```

**Permisos requeridos**: `audit:export`

---

## 🔐 Autenticación de Dos Factores (2FA)

### Setup 2FA (Generar Configuración)

```http
POST /auth/2fa/setup
Authorization: Bearer <access_token>
```

**Response 200**:

```json
{
  "success": true,
  "data": {
    "secret": "JBSWY3DPEHPK3PXP",
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...",
    "backupCodes": [
      "A1B2C3D4",
      "E5F6G7H8",
      "I9J0K1L2",
      "M3N4O5P6",
      "Q7R8S9T0",
      "U1V2W3X4",
      "Y5Z6A7B8",
      "C9D0E1F2",
      "G3H4I5J6",
      "K7L8M9N0"
    ]
  },
  "message": "Escanea el código QR con tu aplicación de autenticación"
}
```

**Nota**: El usuario debe escanear el QR con Google Authenticator, Authy, etc.

---

### Habilitar 2FA

```http
POST /auth/2fa/enable
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Body**:

```json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "token": "123456"
}
```

**Response 200**:

```json
{
  "success": true,
  "data": {
    "backupCodes": [
      "A1B2C3D4",
      "E5F6G7H8",
      "I9J0K1L2",
      "M3N4O5P6",
      "Q7R8S9T0",
      "U1V2W3X4",
      "Y5Z6A7B8",
      "C9D0E1F2",
      "G3H4I5J6",
      "K7L8M9N0"
    ]
  },
  "message": "2FA habilitado exitosamente. Guarda los códigos de backup en un lugar seguro"
}
```

**Errores**:

- `401` - Código de verificación inválido

---

### Deshabilitar 2FA

```http
POST /auth/2fa/disable
Authorization: Bearer <access_token>
```

**Response 200**:

```json
{
  "success": true,
  "message": "2FA deshabilitado exitosamente"
}
```

---

### Login con 2FA

```http
POST /auth/login/2fa
Content-Type: application/json
```

**Body**:

```json
{
  "tempToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token": "123456"
}
```

**Response 200**:

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Autenticación 2FA exitosa"
}
```

**Errores**:

- `401` - Código 2FA inválido o token temporal expirado

---

### Login con Código de Backup

```http
POST /auth/login/backup-code
Content-Type: application/json
```

**Body**:

```json
{
  "tempToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "backupCode": "A1B2C3D4"
}
```

**Response 200**:

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Autenticación con código de backup exitosa"
}
```

**Errores**:

- `401` - Código de backup inválido o token temporal expirado

---

### Regenerar Códigos de Backup

```http
POST /auth/2fa/regenerate-backup-codes
Authorization: Bearer <access_token>
```

**Response 200**:

```json
{
  "success": true,
  "data": {
    "backupCodes": [
      "A1B2C3D4",
      "E5F6G7H8",
      "I9J0K1L2",
      "M3N4O5P6",
      "Q7R8S9T0",
      "U1V2W3X4",
      "Y5Z6A7B8",
      "C9D0E1F2",
      "G3H4I5J6",
      "K7L8M9N0"
    ]
  },
  "message": "Códigos de backup regenerados exitosamente"
}
```

---

## 🌐 Single Sign-On (SSO) con Google Workspace

### Iniciar Autenticación con Google

```http
GET /oauth/google
```

Redirige al usuario a Google para autenticación.

---

### Callback de Google OAuth

```http
GET /oauth/google/callback
```

Google redirige aquí después de la autenticación. El servicio redirige al frontend con los tokens:

```
http://localhost:3000/auth/callback?accessToken=<token>&refreshToken=<token>
```

**Respuesta en caso de error**:

```
http://localhost:3000/auth/callback?error=<mensaje>
```

---

## 📝 Códigos de Estado HTTP

| Código | Descripción                                  |
| ------ | -------------------------------------------- |
| 200    | OK - Petición exitosa                        |
| 201    | Created - Recurso creado                     |
| 400    | Bad Request - Datos inválidos                |
| 401    | Unauthorized - No autenticado                |
| 403    | Forbidden - Sin permisos                     |
| 404    | Not Found - Recurso no encontrado            |
| 410    | Gone - Recurso expirado                      |
| 422    | Unprocessable Entity - Validación fallida    |
| 428    | Precondition Required - Falta 2FA            |
| 429    | Too Many Requests - Rate limit excedido      |
| 500    | Internal Server Error - Error del servidor   |
| 503    | Service Unavailable - Servicio no disponible |

---

## 🔒 Formato de Errores

Todos los errores siguen el estándar:

```json
{
  "code": "AUTH-0401",
  "message": "Invalid credentials",
  "type": "error",
  "http_code": 401,
  "timestamp": "2025-11-06T20:00:00.000Z"
}
```

---

## 📚 Referencias

- [Arquitectura](ARCHITECTURE.md)
- [Base de Datos](DATABASE.md)
- [Event Bus](EVENT_BUS.md)
- [Swagger Documentation](http://localhost:3001/api/docs)

---

**Mantenedores**: Bookly Development Team  
**Última actualización**: Noviembre 6, 2025
