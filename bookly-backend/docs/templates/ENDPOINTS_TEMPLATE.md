# 🔌 [Service Name] - Endpoints

**Fecha**: [Fecha]  
**Versión**: 1.0  
**Base URL**: `http://localhost:[PORT]/api`

---

## 📋 Índice

- [Autenticación](#autenticación)
- [Health Check](#health-check)
- [Recurso 1](#recurso-1)
- [Recurso 2](#recurso-2)
- [Webhooks](#webhooks)

---

## 🔐 Autenticación

Todos los endpoints (excepto health) requieren token JWT:

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

## 📦 [Recurso 1]

### Listar [Recursos]

```http
GET /api/[resource]?page=1&limit=20&filter=value
```

**Query Parameters**:

- `page` (number): Número de página (default: 1)
- `limit` (number): Elementos por página (default: 20, max: 100)
- `filter` (string): Filtro opcional

**Response 200**:

```json
{
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "field1": "value1",
      "field2": 123,
      "createdAt": "2025-11-06T20:00:00.000Z"
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

**Permisos requeridos**: `[resource]:read`

---

### Obtener [Recurso] por ID

```http
GET /api/[resource]/:id
```

**Response 200**:

```json
{
  "id": "507f1f77bcf86cd799439011",
  "field1": "value1",
  "field2": 123,
  "related": {
    "id": "507f1f77bcf86cd799439012",
    "name": "Related Item"
  },
  "createdAt": "2025-11-06T20:00:00.000Z",
  "updatedAt": "2025-11-06T20:00:00.000Z"
}
```

**Errores**:

- `404` - Recurso no encontrado

**Permisos requeridos**: `[resource]:read`

---

### Crear [Recurso]

```http
POST /api/[resource]
Content-Type: application/json
```

**Body**:

```json
{
  "field1": "value1",
  "field2": 123,
  "field3": true
}
```

**Response 201**:

```json
{
  "id": "507f1f77bcf86cd799439011",
  "field1": "value1",
  "field2": 123,
  "field3": true,
  "createdAt": "2025-11-06T20:00:00.000Z"
}
```

**Errores**:

- `400` - Datos inválidos
- `422` - Validación fallida

**Permisos requeridos**: `[resource]:create`

---

### Actualizar [Recurso]

```http
PATCH /api/[resource]/:id
Content-Type: application/json
```

**Body**:

```json
{
  "field1": "new value",
  "field3": false
}
```

**Response 200**:

```json
{
  "id": "507f1f77bcf86cd799439011",
  "field1": "new value",
  "field2": 123,
  "field3": false,
  "updatedAt": "2025-11-06T20:05:00.000Z"
}
```

**Errores**:

- `404` - Recurso no encontrado
- `400` - Datos inválidos

**Permisos requeridos**: `[resource]:update`

---

### Eliminar [Recurso]

```http
DELETE /api/[resource]/:id
```

**Response 200**:

```json
{
  "message": "Resource deleted successfully"
}
```

**Errores**:

- `404` - Recurso no encontrado
- `409` - Conflicto (recurso en uso)

**Permisos requeridos**: `[resource]:delete`

---

## 📦 [Recurso 2]

[Repetir estructura similar para otros recursos]

---

## 🔔 Webhooks (Opcional)

### Webhook [Nombre]

```http
POST /api/webhooks/[nombre]
```

**Headers**:

```http
X-Signature: sha256=...
Content-Type: application/json
```

**Body**:

```json
{
  "event": "event_name",
  "data": {
    "field1": "value1"
  },
  "timestamp": "2025-11-06T20:00:00.000Z"
}
```

**Response 200**:

```json
{
  "received": true
}
```

---

## 📝 Códigos de Estado HTTP

| Código | Descripción           |
| ------ | --------------------- |
| 200    | OK                    |
| 201    | Created               |
| 400    | Bad Request           |
| 401    | Unauthorized          |
| 403    | Forbidden             |
| 404    | Not Found             |
| 409    | Conflict              |
| 422    | Unprocessable Entity  |
| 429    | Too Many Requests     |
| 500    | Internal Server Error |
| 503    | Service Unavailable   |

---

## 🔒 Formato de Errores

```json
{
  "code": "[SERVICE]-[CODE]",
  "message": "Error description",
  "type": "error",
  "http_code": 400,
  "timestamp": "2025-11-06T20:00:00.000Z"
}
```

---

## 📚 Referencias

- [Arquitectura](ARCHITECTURE.md)
- [Base de Datos](DATABASE.md)
- [Event Bus](EVENT_BUS.md)
- [Swagger Documentation](http://localhost:[PORT]/api/docs)

---

**Mantenedores**: Bookly Development Team  
**Última actualización**: [Fecha]
