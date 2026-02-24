# 🔌 API Gateway - Endpoints

**Fecha**: Noviembre 6, 2025  
**Versión**: 1.0  
**Base URL**: `http://localhost:3000/api`

---

## 📋 Índice

- [Autenticación](#autenticación)
- [Health Checks](#health-checks)
- [Routing a Microservicios](#routing-a-microservicios)
- [Configuración de Proxy](#configuración-de-proxy)
- [Códigos de Estado HTTP](#códigos-de-estado-http)
- [Formato de Errores](#formato-de-errores)

---

## 🔐 Autenticación

Todos los endpoints que pasan por el API Gateway (excepto health checks y login) requieren token JWT:

```bash
Authorization: Bearer <access_token>
```

### Flujo de Autenticación

1. **Login**: Usuario se autentica en `/api/auth/login`
2. **Token JWT**: Recibe access_token y refresh_token
3. **Headers**: Incluye `Authorization: Bearer <token>` en cada request
4. **Validación**: Gateway valida token antes de proxy a microservicio
5. **Refresh**: Si token expira, usar `/api/auth/refresh`

### Tokens

**Access Token**:

- Duración: 15 minutos
- Payload: userId, roles, permissions
- Validado en cada request

**Refresh Token**:

- Duración: 7 días
- Almacenado en httpOnly cookie
- Usado para renovar access token

---

## 🏥 Health Checks

### Health Check del Gateway

**GET** `/health`

**Response 200**:

```json
{
  "status": "ok",
  "timestamp": "2025-11-06T22:00:00.000Z"
}
```

---

### Health Check Agregado

**GET** `/api/v1/health/aggregated`

**Response 200**:

```json
{
  "status": "healthy",
  "services": {
    "auth": {
      "status": "up",
      "responseTime": 45,
      "lastCheck": "2025-11-06T22:00:00.000Z"
    },
    "resources": {
      "status": "up",
      "responseTime": 32
    },
    "availability": {
      "status": "up",
      "responseTime": 28
    },
    "stockpile": {
      "status": "up",
      "responseTime": 51
    },
    "reports": {
      "status": "up",
      "responseTime": 62
    }
  },
  "timestamp": "2025-11-06T22:00:00.000Z"
}
```

**Response 503** (si algún servicio está caído):

```json
{
  "status": "degraded",
  "services": {
    "auth": {
      "status": "up"
    },
    "resources": {
      "status": "down",
      "error": "Connection refused"
    }
  }
}
```

---

## 🔐 Autenticación

### Login

**POST** `/api/auth/login`

Proxied to: Auth Service (3001)

---

### Refresh Token

**POST** `/api/auth/refresh`

Proxied to: Auth Service (3001)

---

## 🌐 Routing a Microservicios

### Auth Service

**Base Path**: `/api/auth/*`  
**Target**: `http://localhost:3001`

Endpoints:

- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/logout`
- `POST /api/auth/refresh`
- `GET /api/auth/profile`
- `GET /api/roles`
- `POST /api/roles`
- `GET /api/permissions`

---

### Resources Service

**Base Path**: `/api/resources/*`  
**Target**: `http://localhost:3002`

Endpoints:

- `GET /api/resources`
- `POST /api/resources`
- `GET /api/resources/:id`
- `PATCH /api/resources/:id`
- `DELETE /api/resources/:id`
- `GET /api/resource-categories`
- `POST /api/maintenance`

---

### Availability Service

**Base Path**: `/api/availability/*`, `/api/reservations/*`, `/api/calendar/*`, `/api/search/*`  
**Target**: `http://localhost:3003`

Endpoints:

- `POST /api/reservations`
- `GET /api/reservations`
- `GET /api/reservations/:id`
- `PATCH /api/reservations/:id`
- `DELETE /api/reservations/:id`
- `GET /api/availability/:resourceId/rules`
- `POST /api/search/resources`
- `GET /api/calendar/month`

---

### Stockpile Service

**Base Path**: `/api/approvals/*`, `/api/notifications/*`, `/api/documents/*`, `/api/checkin/*`, `/api/checkout/*`  
**Target**: `http://localhost:3004`

Endpoints:

- `POST /api/approvals/request`
- `POST /api/approvals/:id/approve`
- `POST /api/approvals/:id/reject`
- `POST /api/notifications/send`
- `POST /api/documents/generate`
- `POST /api/checkin`
- `POST /api/checkout`

---

### Reports Service

**Base Path**: `/api/reports/*`, `/api/dashboard/*`, `/api/feedback/*`, `/api/exports/*`  
**Target**: `http://localhost:3005`

Endpoints:

- `POST /api/reports/usage/resource`
- `POST /api/reports/usage/user`
- `GET /api/dashboard/metrics`
- `POST /api/feedback`
- `POST /api/exports`
- `GET /api/exports/:id`

---

## 🔧 Configuración de Proxy

### Headers Inyectados

El API Gateway inyecta los siguientes headers en cada request:

```
X-Forwarded-For: <client-ip>
X-Forwarded-Proto: <http|https>
X-Request-ID: <uuid>
X-Gateway-Version: 1.0
```

### Timeouts

- **Connect Timeout**: 5 segundos
- **Request Timeout**: 30 segundos
- **Keep-Alive**: 60 segundos

---

## 📝 Códigos de Estado HTTP

| Código | Descripción           | Uso en Gateway                               |
| ------ | --------------------- | -------------------------------------------- |
| 200    | OK                    | Request exitoso                              |
| 201    | Created               | Recurso creado exitosamente                  |
| 400    | Bad Request           | Datos inválidos en el request                |
| 401    | Unauthorized          | Token JWT inválido o ausente                 |
| 403    | Forbidden             | Usuario no tiene permisos                    |
| 404    | Not Found             | Endpoint o recurso no encontrado             |
| 409    | Conflict              | Conflicto al crear/actualizar recurso        |
| 422    | Unprocessable Entity  | Validación fallida                           |
| 429    | Too Many Requests     | Rate limit excedido                          |
| 500    | Internal Server Error | Error en microservicio backend               |
| 502    | Bad Gateway           | Microservicio no responde                    |
| 503    | Service Unavailable   | Microservicio temporalmente no disponible    |
| 504    | Gateway Timeout       | Timeout esperando respuesta de microservicio |

---

## 🔒 Formato de Errores

Todos los errores devueltos por el API Gateway siguen un formato estándar:

```json
{
  "code": "GATEWAY-001",
  "message": "Service temporarily unavailable",
  "type": "error",
  "http_code": 503,
  "timestamp": "2025-11-06T22:00:00.000Z",
  "requestId": "req-123456-789",
  "service": "auth-service"
}
```

### Códigos de Error del Gateway

| Código      | Descripción              |
| ----------- | ------------------------ |
| GATEWAY-001 | Servicio no disponible   |
| GATEWAY-002 | Timeout en microservicio |
| GATEWAY-003 | Rate limit excedido      |
| GATEWAY-004 | Token JWT inválido       |
| GATEWAY-005 | Path traversal detectado |
| GATEWAY-006 | Circuit breaker activado |
| GATEWAY-007 | Error de proxy           |

---

## 📚 Documentación Relacionada

- [Arquitectura](ARCHITECTURE.md)
- [Advanced Patterns](ADVANCED_PATTERNS.md)
- [Swagger Documentation](http://localhost:3000/api/docs) (cuando el gateway esté corriendo)

---

**Mantenedor**: Bookly Development Team  
**Última Actualización**: Noviembre 6, 2025
