# 🔌 Stockpile Service - Endpoints Completos

**Fecha**: Noviembre 12, 2025  
**Versión**: 2.0  
**Base Path**: `/api/v1`  
**Puerto**: `3004`  
**Swagger UI**: `http://localhost:3004/api/docs`

---

## 📋 Resumen de Endpoints

| Categoría                    | Total Endpoints |
| ---------------------------- | --------------- |
| Solicitudes de Aprobación    | 8               |
| Flujos de Aprobación         | 7               |
| Check-In/Check-Out           | 7               |
| Analíticas de Ubicación      | 4               |
| Notificaciones de Proximidad | 5               |
| Métricas de Notificaciones   | 6               |
| Configuración de Tenant      | 4               |
| Métricas de Sistema          | 2               |
| Health Check                 | 1               |
| **TOTAL**                    | **44**          |

---

## 📝 1. Solicitudes de Aprobación

**Base Path**: `/api/v1/approval-requests`

### 1.1. Crear Solicitud

```http
POST /api/v1/approval-requests
```

**Body**:

```json
{
  "reservationId": "507f1f77bcf86cd799439020",
  "purpose": "Evento académico institucional",
  "additionalInfo": "Conferencia de Ingeniería"
}
```

**Response 201**:

```json
{
  "id": "507f1f77bcf86cd799439030",
  "reservationId": "507f1f77bcf86cd799439020",
  "flowId": "507f1f77bcf86cd799439040",
  "status": "PENDING",
  "currentStep": 1,
  "createdAt": "2025-11-12T10:00:00Z"
}
```

---

### 1.2. Listar Solicitudes

```http
GET /api/v1/approval-requests
```

**Query Parameters**:

- `status` (optional): PENDING, APPROVED, REJECTED, CANCELLED
- `userId` (optional): ID del usuario
- `page` (optional): Número de página (default: 1)
- `limit` (optional): Elementos por página (default: 10)

**Response 200**:

```json
{
  "data": [
    {
      "id": "507f1f77bcf86cd799439030",
      "reservationId": "507f1f77bcf86cd799439020",
      "status": "PENDING",
      "currentStep": 1
    }
  ],
  "meta": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

---

### 1.3. Obtener Solicitud por ID

```http
GET /api/v1/approval-requests/:id
```

**Response 200**: Detalles completos de la solicitud

---

### 1.4. Aprobar Paso

```http
POST /api/v1/approval-requests/:id/approve
```

**Body**:

```json
{
  "comments": "Aprobado por cumplir requisitos",
  "notifyUser": true
}
```

**Response 200**: Solicitud actualizada

**Permisos**: `approvals:approve` + rol de aprobador del paso actual

---

### 1.5. Rechazar Paso

```http
POST /api/v1/approval-requests/:id/reject
```

**Body**:

```json
{
  "reason": "Documentación incompleta",
  "suggestions": "Por favor enviar carta de la facultad"
}
```

**Response 200**: Solicitud rechazada

---

### 1.6. Cancelar Solicitud

```http
POST /api/v1/approval-requests/:id/cancel
```

**Body**:

```json
{
  "reason": "Usuario canceló la reserva"
}
```

**Response 200**: Solicitud cancelada

---

### 1.7. Eliminar Solicitud

```http
DELETE /api/v1/approval-requests/:id
```

**Response 200**: Solicitud eliminada (solo admin)

---

### 1.8. Estadísticas de Aprobaciones

```http
GET /api/v1/approval-requests/statistics
```

**Query Parameters**:

- `startDate` (optional): Fecha inicio
- `endDate` (optional): Fecha fin

**Response 200**:

```json
{
  "total": 150,
  "approved": 120,
  "rejected": 20,
  "pending": 10,
  "approvalRate": 80.0,
  "avgProcessingTimeHours": 24.5
}
```

---

## ⚙️ 2. Flujos de Aprobación

**Base Path**: `/api/v1/approval-flows`

### 2.1. Listar Flujos

```http
GET /api/v1/approval-flows
```

**Query Parameters**:

- `resourceTypes` (optional): Filtrar por tipos de recurso
- `active` (optional): true/false
- `page`, `limit`

**Response 200**: Array de flujos

---

### 2.2. Crear Flujo

```http
POST /api/v1/approval-flows
```

**Body**:

```json
{
  "name": "Aprobación de Auditorios Gran Capacidad",
  "resourceTypes": ["AUDITORIUM"],
  "conditions": {
    "minCapacity": 200,
    "minDurationHours": 4
  },
  "steps": [
    {
      "order": 1,
      "approverRole": "COORDINATOR",
      "slaHours": 24
    },
    {
      "order": 2,
      "approverRole": "GENERAL_ADMIN",
      "slaHours": 48
    }
  ],
  "autoApproveConditions": {
    "maxDurationHours": 2,
    "userRole": "TEACHER"
  }
}
```

**Response 201**: Flujo creado

**Permisos**: `approval-flows:create`

---

### 2.3. Obtener Flujo por ID

```http
GET /api/v1/approval-flows/:id
```

**Response 200**: Detalles del flujo

---

### 2.4. Actualizar Flujo

```http
PATCH /api/v1/approval-flows/:id
```

**Body**: Campos a actualizar

**Response 200**: Flujo actualizado

---

### 2.5. Activar Flujo

```http
POST /api/v1/approval-flows/:id/activate
```

**Response 200**: Flujo activado

---

### 2.6. Desactivar Flujo

```http
POST /api/v1/approval-flows/:id/deactivate
```

**Response 200**: Flujo desactivado

---

### 2.7. Eliminar Flujo

```http
DELETE /api/v1/approval-flows/:id
```

**Response 200**: Flujo eliminado

---

## 📍 3. Check-In/Check-Out

**Base Path**: `/api/v1/check-in-out`

### 3.1. Realizar Check-In

```http
POST /api/v1/check-in-out/check-in
```

**Body**:

```json
{
  "reservationId": "507f1f77bcf86cd799439020",
  "type": "MANUAL",
  "notes": "Todo en orden",
  "qrToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "coordinates": {
    "latitude": 7.8938,
    "longitude": -72.5078
  },
  "metadata": {
    "deviceInfo": "iPhone 13 Pro",
    "ipAddress": "192.168.1.100"
  }
}
```

**Response 201**:

```json
{
  "id": "507f1f77bcf86cd799439050",
  "reservationId": "507f1f77bcf86cd799439020",
  "status": "CHECKED_IN",
  "checkInTime": "2025-11-15T14:05:00Z",
  "checkInType": "MANUAL",
  "expectedReturnTime": "2025-11-15T18:00:00Z"
}
```

---

### 3.2. Realizar Check-Out

```http
POST /api/v1/check-in-out/check-out
```

**Body**:

```json
{
  "checkInId": "507f1f77bcf86cd799439050",
  "type": "MANUAL",
  "notes": "Recurso entregado en buen estado",
  "resourceCondition": "GOOD",
  "damageReported": false,
  "damageDescription": null,
  "digitalSignature": {
    "signatureData": "data:image/png;base64,...",
    "metadata": {
      "ipAddress": "192.168.1.100",
      "deviceInfo": "iPhone 13 Pro"
    }
  },
  "metadata": {}
}
```

**Response 200**: Check-out completado

---

### 3.3. Obtener Check-In por ID

```http
GET /api/v1/check-in-out/:id
```

**Response 200**: Detalles del check-in/out

---

### 3.4. Obtener por Reserva

```http
GET /api/v1/check-in-out/reservation/:reservationId
```

**Response 200**: Check-in/out de una reserva específica

---

### 3.5. Historial del Usuario

```http
GET /api/v1/check-in-out/user/me
```

**Response 200**: Historial de check-ins del usuario autenticado

---

### 3.6. Check-Ins Activos

```http
GET /api/v1/check-in-out/active/all
```

**Response 200**: Todos los check-ins en curso

**Permisos**: `check-ins:read-all`

---

### 3.7. Check-Ins Vencidos

```http
GET /api/v1/check-in-out/overdue/all
```

**Response 200**: Check-ins que no han hecho check-out a tiempo

**Permisos**: `check-ins:read-all`

---

## 📊 4. Analíticas de Ubicación

**Base Path**: `/api/v1/location-analytics`

### 4.1. Registrar Uso de Ubicación

```http
POST /api/v1/location-analytics/usage
```

**Body**:

```json
{
  "userId": "507f1f77bcf86cd799439013",
  "resourceId": "507f1f77bcf86cd799439012",
  "latitude": 7.8938,
  "longitude": -72.5078,
  "timestamp": "2025-11-15T14:00:00Z"
}
```

**Response 201**: Uso registrado

---

### 4.2. Mapa de Calor

```http
GET /api/v1/location-analytics/heatmap
```

**Query Parameters**:

- `startDate`, `endDate`
- `resourceType` (optional)

**Response 200**:

```json
{
  "heatmapData": [
    {
      "latitude": 7.8938,
      "longitude": -72.5078,
      "intensity": 85,
      "count": 120
    }
  ]
}
```

---

### 4.3. Estadísticas por Ubicación

```http
GET /api/v1/location-analytics/stats
```

**Query Parameters**:

- `startDate`, `endDate`
- `groupBy`: day, week, month

**Response 200**: Estadísticas agregadas

---

### 4.4. Analytics por Recurso

```http
GET /api/v1/location-analytics/resource/:id
```

**Response 200**: Analytics específicos de un recurso

---

## 🔔 5. Notificaciones de Proximidad

**Base Path**: `/api/v1/proximity-notifications`

### 5.1. Verificar Proximidad

```http
POST /api/v1/proximity-notifications/check
```

**Body**:

```json
{
  "userId": "507f1f77bcf86cd799439013",
  "reservationId": "507f1f77bcf86cd799439020",
  "latitude": 7.8938,
  "longitude": -72.5078
}
```

**Response 200**:

```json
{
  "distance": 25,
  "threshold": "NEAR",
  "notificationSent": true,
  "message": "Estás cerca del Auditorio Principal. ¿Hacer check-in?"
}
```

---

### 5.2. Estado de Proximidad

```http
GET /api/v1/proximity-notifications/user/:userId/reservation/:reservationId
```

**Response 200**:

```json
{
  "userId": "507f1f77bcf86cd799439013",
  "reservationId": "507f1f77bcf86cd799439020",
  "lastDistance": 25,
  "lastThreshold": "NEAR",
  "lastNotificationSent": "2025-11-15T13:55:00Z"
}
```

---

### 5.3. Proximidades Activas

```http
GET /api/v1/proximity-notifications/active
```

**Response 200**: Lista de usuarios cerca de sus recursos

---

### 5.4. Limpiar Estado

```http
DELETE /api/v1/proximity-notifications/user/:userId/reservation/:reservationId
```

**Response 200**: Estado de proximidad limpiado

---

### 5.5. Thresholds de Proximidad

```http
GET /api/v1/proximity-notifications/thresholds
```

**Response 200**:

```json
{
  "FAR": 500,
  "APPROACHING": 100,
  "NEAR": 20,
  "ARRIVED": 10
}
```

---

## 📈 6. Métricas de Notificaciones

**Base Path**: `/api/v1/notification-metrics`

### 6.1. Resumen General

```http
GET /api/v1/notification-metrics/summary
```

**Response 200**:

```json
{
  "totalSent": 5800,
  "totalDelivered": 5600,
  "totalFailed": 200,
  "deliveryRate": 96.55,
  "avgDeliveryTimeMs": 2500
}
```

---

### 6.2. Métricas por Canal

```http
GET /api/v1/notification-metrics/by-channel
```

**Response 200**:

```json
{
  "EMAIL": {
    "sent": 1500,
    "delivered": 1450,
    "opened": 800,
    "failed": 50,
    "deliveryRate": 96.67
  },
  "SMS": {
    "sent": 500,
    "delivered": 490,
    "failed": 10,
    "deliveryRate": 98.0
  }
}
```

---

### 6.3. Métricas por Proveedor

```http
GET /api/v1/notification-metrics/by-provider
```

**Response 200**: Métricas por proveedor (SendGrid, Twilio, etc.)

---

### 6.4. Fallos de Notificaciones

```http
GET /api/v1/notification-metrics/failures
```

**Query Parameters**:

- `channel` (optional)
- `limit` (default: 100)

**Response 200**: Lista de notificaciones fallidas

---

### 6.5. Tiempos de Entrega

```http
GET /api/v1/notification-metrics/delivery-times
```

**Response 200**:

```json
{
  "EMAIL": {
    "avg": 2500,
    "min": 1000,
    "max": 5000,
    "p50": 2200,
    "p95": 4500,
    "p99": 4900
  }
}
```

---

### 6.6. Webhooks Recibidos

```http
GET /api/v1/notification-metrics/webhooks
```

**Query Parameters**:

- `provider` (optional)
- `limit`

**Response 200**: Historial de webhooks recibidos

---

## 🏢 7. Configuración de Tenant

**Base Path**: `/api/v1/tenant-notification-config`

### 7.1. Obtener Configuración

```http
GET /api/v1/tenant-notification-config/:tenantId
```

**Response 200**:

```json
{
  "tenantId": "UFPS",
  "channels": {
    "EMAIL": {
      "enabled": true,
      "provider": "sendgrid",
      "rateLimit": {
        "maxPerSecond": 100,
        "maxPerDay": 50000
      }
    },
    "SMS": {
      "enabled": true,
      "provider": "twilio",
      "rateLimit": {
        "maxPerSecond": 10,
        "maxPerDay": 10000
      }
    }
  }
}
```

---

### 7.2. Actualizar Configuración

```http
PUT /api/v1/tenant-notification-config/:tenantId
```

**Body**: Configuración completa de tenant

**Response 200**: Configuración actualizada

---

### 7.3. Proveedores Activos

```http
GET /api/v1/tenant-notification-config/:tenantId/providers
```

**Response 200**: Lista de proveedores configurados

---

### 7.4. Configurar Proveedor

```http
PUT /api/v1/tenant-notification-config/:tenantId/providers/:channel
```

**Body**:

```json
{
  "provider": "sendgrid",
  "config": {
    "apiKey": "SG.xxx",
    "fromEmail": "noreply@ufps.edu.co"
  },
  "enabled": true
}
```

**Response 200**: Proveedor configurado

---

## 📊 8. Métricas de Sistema

**Base Path**: `/api/v1/metrics`

### 8.1. Métricas de Cache

```http
GET /api/v1/metrics/cache
```

**Response 200**:

```json
{
  "serviceName": "stockpile-service",
  "hits": 450,
  "misses": 50,
  "hitRate": 90.0,
  "totalRequests": 500,
  "lastReset": "2025-11-08T10:00:00Z"
}
```

---

### 8.2. Métricas Prometheus

```http
GET /api/v1/metrics/cache/prometheus
```

**Response 200** (Content-Type: text/plain):

```
# HELP cache_hits_total Total number of cache hits
# TYPE cache_hits_total counter
cache_hits_total{service="stockpile-service"} 450

# HELP cache_misses_total Total number of cache misses
# TYPE cache_misses_total counter
cache_misses_total{service="stockpile-service"} 50

# HELP cache_hit_rate Cache hit rate percentage
# TYPE cache_hit_rate gauge
cache_hit_rate{service="stockpile-service"} 90.0
```

---

## ❤️ 9. Health Check

**Base Path**: `/api/v1`

### 9.1. Health Check

```http
GET /api/v1/health
```

**Response 200**:

```json
{
  "status": "ok",
  "timestamp": "2025-11-12T10:00:00Z",
  "service": "stockpile-service",
  "version": "1.0.0"
}
```

---

## 🔐 Autenticación

Todos los endpoints (excepto `/health`) requieren autenticación con JWT:

```http
Authorization: Bearer <jwt_token>
```

**Header de ejemplo**:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🚨 Códigos de Respuesta

| Código | Descripción                                |
| ------ | ------------------------------------------ |
| `200`  | OK - Solicitud exitosa                     |
| `201`  | Created - Recurso creado                   |
| `400`  | Bad Request - Datos inválidos              |
| `401`  | Unauthorized - Token faltante o inválido   |
| `403`  | Forbidden - Sin permisos                   |
| `404`  | Not Found - Recurso no encontrado          |
| `409`  | Conflict - Conflicto de estado             |
| `500`  | Internal Server Error - Error del servidor |

---

## 📚 Referencias

- [Arquitectura](ARCHITECTURE.md)
- [Base de Datos](DATABASE.md)
- [Event Bus](EVENT_BUS.md)
- [RF-20: Validar Solicitudes](requirements/RF-20_VALIDAR_SOLICITUDES.md)
- [RF-23: Pantalla Vigilancia](requirements/RF-23_PANTALLA_VIGILANCIA.md)
- [RF-26: Check-in/Check-out](requirements/RF-26_CHECK_IN_OUT.md)

---

**Mantenedores**: Bookly Development Team  
**Última actualización**: Noviembre 12, 2025
