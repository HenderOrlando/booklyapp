# RF-12: Documentación de Endpoints REST - Reservas Recurrentes

**Fecha**: 2025-01-04  
**Servicio**: `availability-service`  
**Controller**: `ReservationsController`  
**Base URL**: `/api/v1/reservations`

---

## 📋 Tabla de Contenidos

1. [Crear Serie Recurrente](#crear-serie-recurrente)
2. [Listar Series del Usuario](#listar-series-del-usuario)
3. [Obtener Serie Específica](#obtener-serie-específica)
4. [Actualizar Serie Completa](#actualizar-serie-completa)
5. [Cancelar Serie Completa](#cancelar-serie-completa)
6. [Cancelar Instancia Individual](#cancelar-instancia-individual)
7. [Modificar Instancia Individual](#modificar-instancia-individual)

---

## 🔐 Autenticación

Todos los endpoints requieren autenticación mediante JWT Bearer Token:

```http
Authorization: Bearer <your_jwt_token>
```

---

## 📝 Endpoints

### 1. Crear Serie Recurrente

Crea una nueva serie de reservas recurrentes con múltiples instancias.

**Endpoint**: `POST /reservations/recurring`

**Request Body**:

```json
{
  "resourceId": "507f1f77bcf86cd799439011",
  "startDate": "2025-01-06T08:00:00Z",
  "endDate": "2025-01-06T10:00:00Z",
  "purpose": "Clase de Programación Avanzada",
  "recurrencePattern": {
    "frequency": "weekly",
    "interval": 1,
    "daysOfWeek": [1, 3, 5],
    "occurrences": 12
  },
  "participants": [
    {
      "userId": "507f1f77bcf86cd799439012",
      "name": "Juan Pérez",
      "email": "juan.perez@ufps.edu.co"
    }
  ],
  "notes": "Traer laptop personal",
  "createAllOrNone": true
}
```

**Response 201 - Created**:

```json
{
  "seriesId": "series-abc123",
  "masterReservationId": "507f1f77bcf86cd799439014",
  "instances": [
    {
      "id": "507f1f77bcf86cd799439015",
      "instanceNumber": 1,
      "startDate": "2025-01-06T08:00:00Z",
      "endDate": "2025-01-06T10:00:00Z",
      "status": "pending",
      "isException": false
    },
    {
      "id": "507f1f77bcf86cd799439016",
      "instanceNumber": 2,
      "startDate": "2025-01-08T08:00:00Z",
      "endDate": "2025-01-08T10:00:00Z",
      "status": "pending",
      "isException": false
    }
  ],
  "totalInstances": 12,
  "successfulInstances": 12,
  "failedInstances": [],
  "pattern": {
    "frequency": "weekly",
    "interval": 1,
    "daysOfWeek": [1, 3, 5],
    "occurrences": 12
  },
  "executionTimeMs": 1250
}
```

**Response 400 - Conflictos Detectados**:

```json
{
  "seriesId": "series-abc123",
  "totalInstances": 12,
  "successfulInstances": 10,
  "failedInstances": [
    {
      "date": "2025-01-13T08:00:00Z",
      "reason": "Conflicto con reserva existente",
      "conflictingReservationId": "507f1f77bcf86cd799439099"
    }
  ],
  "pattern": {
    "frequency": "weekly",
    "interval": 1,
    "daysOfWeek": [1, 3, 5]
  }
}
```

---

### 2. Listar Series del Usuario

Obtiene todas las series recurrentes del usuario autenticado con filtros.

**Endpoint**: `GET /reservations/recurring`

**Query Parameters**:

| Parámetro          | Tipo     | Requerido | Descripción                              |
| ------------------ | -------- | --------- | ---------------------------------------- |
| `resourceId`       | string   | No        | Filtrar por recurso                      |
| `startDate`        | ISO 8601 | No        | Fecha inicio del rango                   |
| `endDate`          | ISO 8601 | No        | Fecha fin del rango                      |
| `status`           | string   | No        | Estado de las instancias                 |
| `includeInstances` | boolean  | No        | Incluir instancias (default: true)       |
| `page`             | number   | No        | Número de página (default: 1)            |
| `limit`            | number   | No        | Tamaño de página (default: 20, max: 100) |

**Example Request**:

```http
GET /reservations/recurring?startDate=2025-01-01T00:00:00Z&endDate=2025-06-30T23:59:59Z&includeInstances=true&page=1&limit=10
```

**Response 200 - OK**:

```json
{
  "data": [
    {
      "id": "507f1f77bcf86cd799439014",
      "seriesId": "series-abc123",
      "resourceId": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439012",
      "purpose": "Clase de Programación Avanzada",
      "isRecurring": true,
      "recurringPattern": {
        "frequency": "weekly",
        "interval": 1,
        "daysOfWeek": [1, 3, 5],
        "occurrences": 12
      },
      "instances": [
        {
          "id": "507f1f77bcf86cd799439015",
          "instanceNumber": 1,
          "startDate": "2025-01-06T08:00:00Z",
          "endDate": "2025-01-06T10:00:00Z",
          "status": "pending"
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1
  }
}
```

---

### 3. Obtener Serie Específica

Obtiene una serie recurrente específica con todas sus instancias.

**Endpoint**: `GET /reservations/series/:seriesId`

**Path Parameters**:

| Parámetro  | Tipo   | Descripción    |
| ---------- | ------ | -------------- |
| `seriesId` | string | ID de la serie |

**Query Parameters**:

| Parámetro          | Tipo    | Descripción                        |
| ------------------ | ------- | ---------------------------------- |
| `includeInstances` | boolean | Incluir instancias (default: true) |

**Example Request**:

```http
GET /reservations/series/series-abc123?includeInstances=true
```

**Response 200 - OK**:

```json
{
  "seriesId": "series-abc123",
  "masterReservation": {
    "id": "507f1f77bcf86cd799439014",
    "resourceId": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "startDate": "2025-01-06T08:00:00Z",
    "endDate": "2025-01-06T10:00:00Z",
    "purpose": "Clase de Programación Avanzada",
    "status": "pending",
    "isRecurring": true,
    "seriesId": "series-abc123",
    "recurringPattern": {
      "frequency": "weekly",
      "interval": 1,
      "daysOfWeek": [1, 3, 5],
      "occurrences": 12
    }
  },
  "totalInstances": 12,
  "pattern": {
    "frequency": "weekly",
    "interval": 1,
    "daysOfWeek": [1, 3, 5],
    "occurrences": 12
  },
  "instances": [
    {
      "id": "507f1f77bcf86cd799439015",
      "instanceNumber": 1,
      "startDate": "2025-01-06T08:00:00Z",
      "endDate": "2025-01-06T10:00:00Z",
      "status": "pending",
      "isException": false
    }
  ]
}
```

**Response 404 - Not Found**:

```json
{
  "statusCode": 404,
  "message": "Series series-abc123 not found",
  "error": "Not Found"
}
```

---

### 4. Actualizar Serie Completa

Actualiza todas las instancias futuras de una serie recurrente.

**Endpoint**: `PATCH /reservations/series/:seriesId`

**Path Parameters**:

| Parámetro  | Tipo   | Descripción    |
| ---------- | ------ | -------------- |
| `seriesId` | string | ID de la serie |

**Request Body**:

```json
{
  "startDate": "2025-01-06T09:00:00Z",
  "endDate": "2025-01-06T11:00:00Z",
  "purpose": "Clase de Programación Avanzada - Actualizada",
  "notes": "Cambio de horario aprobado",
  "updatePastInstances": false
}
```

**Response 200 - OK**:

```json
{
  "seriesId": "series-abc123",
  "updatedInstances": 10,
  "totalInstances": 12
}
```

---

### 5. Cancelar Serie Completa

Cancela todas las instancias futuras de una serie recurrente.

**Endpoint**: `DELETE /reservations/series/:seriesId`

**Path Parameters**:

| Parámetro  | Tipo   | Descripción    |
| ---------- | ------ | -------------- |
| `seriesId` | string | ID de la serie |

**Request Body**:

```json
{
  "reason": "Cambio de plan de estudios",
  "cancelPastInstances": false
}
```

**Response 200 - OK**:

```json
{
  "seriesId": "series-abc123",
  "cancelledInstances": 10,
  "totalInstances": 12
}
```

---

### 6. Cancelar Instancia Individual

Cancela una instancia individual sin afectar el resto de la serie.

**Endpoint**: `POST /reservations/series/instances/:instanceId/cancel`

**Path Parameters**:

| Parámetro    | Tipo   | Descripción        |
| ------------ | ------ | ------------------ |
| `instanceId` | string | ID de la instancia |

**Request Body**:

```json
{
  "reason": "Feriado nacional"
}
```

**Response 200 - OK**:

```json
{
  "instanceId": "507f1f77bcf86cd799439015",
  "seriesId": "series-abc123"
}
```

---

### 7. Modificar Instancia Individual

Modifica una instancia individual sin afectar el resto de la serie.

**Endpoint**: `PATCH /reservations/series/instances/:instanceId`

**Path Parameters**:

| Parámetro    | Tipo   | Descripción        |
| ------------ | ------ | ------------------ |
| `instanceId` | string | ID de la instancia |

**Request Body**:

```json
{
  "newStartDate": "2025-01-13T09:00:00Z",
  "newEndDate": "2025-01-13T11:00:00Z",
  "purpose": "Clase especial",
  "reason": "Ajuste de horario por evento especial"
}
```

**Response 200 - OK**:

```json
{
  "instanceId": "507f1f77bcf86cd799439015",
  "seriesId": "series-abc123"
}
```

---

## 🔍 Códigos de Estado HTTP

| Código  | Descripción                                  |
| ------- | -------------------------------------------- |
| **200** | OK - Operación exitosa                       |
| **201** | Created - Serie creada exitosamente          |
| **400** | Bad Request - Datos inválidos o conflictos   |
| **401** | Unauthorized - Token inválido o expirado     |
| **403** | Forbidden - Sin permisos para esta operación |
| **404** | Not Found - Serie o instancia no encontrada  |
| **500** | Internal Server Error - Error del servidor   |

---

## 🧪 Ejemplos con cURL

### Crear Serie Semanal

```bash
curl -X POST http://localhost:3001/api/v1/reservations/recurring \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "resourceId": "507f1f77bcf86cd799439011",
    "startDate": "2025-01-06T08:00:00Z",
    "endDate": "2025-01-06T10:00:00Z",
    "purpose": "Clase de Programación",
    "recurrencePattern": {
      "frequency": "weekly",
      "interval": 1,
      "daysOfWeek": [1, 3, 5],
      "occurrences": 12
    }
  }'
```

### Listar Series del Usuario

```bash
curl -X GET "http://localhost:3001/api/v1/reservations/recurring?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Cancelar Serie Completa

```bash
curl -X DELETE http://localhost:3001/api/v1/reservations/series/series-abc123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Cambio de plan de estudios",
    "cancelPastInstances": false
  }'
```

---

## 📚 Notas Adicionales

### Patrones de Recurrencia Soportados

1. **Daily**: Cada N días

   ```json
   {
     "frequency": "daily",
     "interval": 1,
     "occurrences": 30
   }
   ```

2. **Weekly**: Cada N semanas en días específicos

   ```json
   {
     "frequency": "weekly",
     "interval": 1,
     "daysOfWeek": [1, 3, 5],
     "occurrences": 12
   }
   ```

3. **Monthly**: Cada N meses en día específico

   ```json
   {
     "frequency": "monthly",
     "interval": 1,
     "monthDay": 15,
     "occurrences": 6
   }
   ```

### Días de la Semana (daysOfWeek)

- `0` = Domingo
- `1` = Lunes
- `2` = Martes
- `3` = Miércoles
- `4` = Jueves
- `5` = Viernes
- `6` = Sábado

### Límites del Sistema

- **Max instancias por serie**: 365
- **Max duración de serie**: 1 año
- **Max interval**: 12 (para monthly)
- **Timeout validación**: 30 segundos

---

**Última Actualización**: 2025-01-04  
**Versión API**: v1  
**Documentación Swagger**: `http://localhost:3001/api/docs`
