# RF-34: Sistema de Feedback - Guía de Pruebas

## 📋 Resumen

Esta guía describe cómo probar el sistema completo de feedback de usuarios sobre reservas, incluyendo creación, consultas, respuestas del staff y estadísticas.

---

## 🎯 Funcionalidades a Probar

1. **Crear Feedback** - Usuario registra feedback sobre una reserva
2. **Consultar Feedback** - Ver feedback por ID, usuario o recurso
3. **Responder Feedback** - Staff responde a feedback de usuarios
4. **Estadísticas** - Análisis de feedback por recurso y general
5. **Gestión de Estados** - Actualizar estado (PENDING, RESPONDED, CLOSED)

---

## 🔧 Configuración Previa

### Variables de Entorno

```bash
JWT_SECRET=bookly-secret-key
MONGODB_URI=mongodb://localhost:27017/reports-service
RABBITMQ_URL=amqp://localhost:5672
```

### Permisos Requeridos

- **Usuario**: `reports:feedback:create`, `reports:feedback:read`
- **Staff**: `reports:feedback:respond`, `reports:feedback:read:all`, `reports:feedback:update`, `reports:feedback:statistics`

---

## 🧪 Casos de Prueba

### 1. Crear Feedback de Usuario

**Endpoint**: `POST /api/v1/feedback`

**Headers**:

```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Body**:

```json
{
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "userName": "Juan Pérez",
  "reservationId": "123e4567-e89b-12d3-a456-426614174001",
  "resourceId": "123e4567-e89b-12d3-a456-426614174002",
  "resourceName": "Sala 101",
  "rating": 5,
  "comments": "Excelente sala, muy limpia y bien equipada",
  "category": "FACILITY",
  "isAnonymous": false
}
```

**Respuesta Esperada** (201 Created):

```json
{
  "id": "feedback-uuid-123",
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "userName": "Juan Pérez",
  "reservationId": "123e4567-e89b-12d3-a456-426614174001",
  "resourceId": "123e4567-e89b-12d3-a456-426614174002",
  "resourceName": "Sala 101",
  "rating": 5,
  "status": "PENDING",
  "sentiment": "POSITIVE",
  "comments": "Excelente sala, muy limpia y bien equipada",
  "feedbackDate": "2024-01-15T10:30:00.000Z",
  "category": "FACILITY",
  "isAnonymous": false,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Comando curl**:

```bash
curl -X POST http://localhost:3005/api/v1/feedback \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "123e4567-e89b-12d3-a456-426614174000",
    "userName": "Juan Pérez",
    "reservationId": "123e4567-e89b-12d3-a456-426614174001",
    "resourceId": "123e4567-e89b-12d3-a456-426614174002",
    "resourceName": "Sala 101",
    "rating": 5,
    "comments": "Excelente sala, muy limpia y bien equipada",
    "category": "FACILITY"
  }'
```

---

### 2. Obtener Feedback por ID

**Endpoint**: `GET /api/v1/feedback/:id`

**Headers**:

```
Authorization: Bearer {JWT_TOKEN}
```

**Respuesta Esperada** (200 OK):

```json
{
  "id": "feedback-uuid-123",
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "userName": "Juan Pérez",
  "reservationId": "123e4567-e89b-12d3-a456-426614174001",
  "resourceId": "123e4567-e89b-12d3-a456-426614174002",
  "resourceName": "Sala 101",
  "rating": 5,
  "status": "PENDING",
  "sentiment": "POSITIVE",
  "comments": "Excelente sala, muy limpia y bien equipada",
  "category": "FACILITY",
  "isAnonymous": false,
  "response": null,
  "respondedBy": null,
  "respondedAt": null,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

---

### 3. Listar Feedback de Usuario

**Endpoint**: `GET /api/v1/feedback/user/:userId?page=1&limit=20`

**Headers**:

```
Authorization: Bearer {JWT_TOKEN}
```

**Respuesta Esperada** (200 OK):

```json
{
  "feedbacks": [
    {
      "id": "feedback-uuid-123",
      "resourceId": "123e4567-e89b-12d3-a456-426614174002",
      "resourceName": "Sala 101",
      "rating": 5,
      "status": "PENDING",
      "sentiment": "POSITIVE",
      "comments": "Excelente sala...",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "pages": 1
}
```

---

### 4. Listar Feedback de Recurso

**Endpoint**: `GET /api/v1/feedback/resource/:resourceId?page=1&limit=20`

**Headers**:

```
Authorization: Bearer {JWT_TOKEN}
```

**Respuesta Esperada** (200 OK):

```json
{
  "feedbacks": [
    {
      "id": "feedback-uuid-123",
      "userId": "123e4567-e89b-12d3-a456-426614174000",
      "userName": "Juan Pérez",
      "rating": 5,
      "sentiment": "POSITIVE",
      "comments": "Excelente sala...",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "pages": 1
}
```

---

### 5. Responder a Feedback (Staff)

**Endpoint**: `PATCH /api/v1/feedback/:id/respond`

**Headers**:

```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Body**:

```json
{
  "response": "Gracias por tu feedback positivo. Nos alegra que hayas disfrutado de la sala.",
  "respondedBy": "123e4567-e89b-12d3-a456-426614174003"
}
```

**Respuesta Esperada** (200 OK):

```json
{
  "id": "feedback-uuid-123",
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "userName": "Juan Pérez",
  "rating": 5,
  "status": "RESPONDED",
  "sentiment": "POSITIVE",
  "comments": "Excelente sala...",
  "response": "Gracias por tu feedback positivo. Nos alegra que hayas disfrutado de la sala.",
  "respondedBy": "123e4567-e89b-12d3-a456-426614174003",
  "respondedAt": "2024-01-15T11:00:00.000Z",
  "updatedAt": "2024-01-15T11:00:00.000Z"
}
```

**Comando curl**:

```bash
curl -X PATCH http://localhost:3005/api/v1/feedback/feedback-uuid-123/respond \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "response": "Gracias por tu feedback positivo.",
    "respondedBy": "123e4567-e89b-12d3-a456-426614174003"
  }'
```

---

### 6. Listar Feedback por Estado

**Endpoint**: `GET /api/v1/feedback/status/:status?page=1&limit=20`

**Parámetros de Estado**:

- `PENDING`: Feedback sin responder
- `RESPONDED`: Feedback respondido por staff
- `CLOSED`: Feedback cerrado

**Headers**:

```
Authorization: Bearer {JWT_TOKEN}
```

**Respuesta Esperada** (200 OK):

```json
{
  "feedbacks": [
    {
      "id": "feedback-uuid-123",
      "userId": "123e4567-e89b-12d3-a456-426614174000",
      "resourceId": "123e4567-e89b-12d3-a456-426614174002",
      "rating": 5,
      "status": "PENDING",
      "sentiment": "POSITIVE",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "pages": 1
}
```

---

### 7. Obtener Estadísticas de Recurso

**Endpoint**: `GET /api/v1/feedback/statistics/resource/:resourceId`

**Headers**:

```
Authorization: Bearer {JWT_TOKEN}
```

**Respuesta Esperada** (200 OK):

```json
{
  "totalFeedbacks": 10,
  "averageRating": 4.5,
  "ratingDistribution": {
    "1": 0,
    "2": 1,
    "3": 2,
    "4": 3,
    "5": 4
  },
  "sentimentDistribution": {
    "POSITIVE": 7,
    "NEUTRAL": 2,
    "NEGATIVE": 1
  }
}
```

**Comando curl**:

```bash
curl http://localhost:3005/api/v1/feedback/statistics/resource/123e4567-e89b-12d3-a456-426614174002 \
  -H "Authorization: Bearer $JWT_TOKEN"
```

---

### 8. Obtener Estadísticas Generales

**Endpoint**: `GET /api/v1/feedback/statistics/general`

**Headers**:

```
Authorization: Bearer {JWT_TOKEN}
```

**Respuesta Esperada** (200 OK):

```json
{
  "totalFeedbacks": 100,
  "averageRating": 4.2,
  "pendingFeedbacks": 15,
  "respondedFeedbacks": 85
}
```

---

## 📊 Categorías de Feedback

Las categorías disponibles son:

- **FACILITY**: Instalaciones físicas (limpieza, estado, confort)
- **SERVICE**: Servicio y atención del personal
- **EQUIPMENT**: Equipamiento técnico (proyector, audio, etc.)
- **CLEANLINESS**: Limpieza específica
- **AVAILABILITY**: Disponibilidad y horarios
- **OTHER**: Otros comentarios

---

## 🔄 Estados del Feedback

- **PENDING**: Recién creado, sin respuesta del staff
- **RESPONDED**: Staff ha respondido al feedback
- **CLOSED**: Feedback cerrado (no requiere más acciones)

---

## 🎭 Sentimientos Automáticos

El sistema calcula automáticamente el sentimiento basado en el rating:

- **POSITIVE**: Rating >= 4 (4 o 5 estrellas)
- **NEUTRAL**: Rating = 3 (3 estrellas)
- **NEGATIVE**: Rating <= 2 (1 o 2 estrellas)

---

## 🚨 Casos de Error

### 1. Feedback Duplicado

**Request**: Intentar crear feedback para una reserva que ya tiene feedback.

**Respuesta** (400):

```json
{
  "statusCode": 400,
  "message": "Feedback already exists for this reservation",
  "error": "Bad Request"
}
```

---

### 2. Feedback No Encontrado

**Request**: GET /api/v1/feedback/invalid-id

**Respuesta** (404):

```json
{
  "statusCode": 404,
  "message": "Feedback with ID invalid-id not found",
  "error": "Not Found"
}
```

---

### 3. Rating Inválido

**Request**: POST con rating fuera del rango 1-5

**Respuesta** (400):

```json
{
  "statusCode": 400,
  "message": [
    "rating must not be greater than 5",
    "rating must not be less than 1"
  ],
  "error": "Bad Request"
}
```

---

### 4. Sin Permisos para Responder

**Request**: Usuario regular intenta responder feedback

**Respuesta** (403):

```json
{
  "statusCode": 403,
  "message": "Insufficient permissions",
  "error": "Forbidden"
}
```

---

## ✅ Flujo Completo de Prueba

### Script de Prueba Bash

```bash
#!/bin/bash

# Variables
BASE_URL="http://localhost:3005/api/v1/feedback"
JWT_TOKEN="your-jwt-token-here"
USER_ID="123e4567-e89b-12d3-a456-426614174000"
RESOURCE_ID="123e4567-e89b-12d3-a456-426614174002"

# 1. Crear feedback positivo
echo "1. Creando feedback positivo..."
FEEDBACK_ID=$(curl -s -X POST $BASE_URL \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "'$USER_ID'",
    "userName": "Juan Pérez",
    "reservationId": "res-'$(date +%s)'",
    "resourceId": "'$RESOURCE_ID'",
    "resourceName": "Sala 101",
    "rating": 5,
    "comments": "Excelente sala",
    "category": "FACILITY"
  }' | jq -r '.id')

echo "Feedback ID: $FEEDBACK_ID"

# 2. Consultar feedback creado
echo -e "\n2. Consultando feedback..."
curl -s $BASE_URL/$FEEDBACK_ID \
  -H "Authorization: Bearer $JWT_TOKEN" | jq

# 3. Listar feedback del usuario
echo -e "\n3. Listando feedback del usuario..."
curl -s "$BASE_URL/user/$USER_ID?page=1&limit=5" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq

# 4. Listar feedback del recurso
echo -e "\n4. Listando feedback del recurso..."
curl -s "$BASE_URL/resource/$RESOURCE_ID?page=1&limit=5" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq

# 5. Responder al feedback (como staff)
echo -e "\n5. Respondiendo al feedback..."
curl -s -X PATCH "$BASE_URL/$FEEDBACK_ID/respond" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "response": "Gracias por tu feedback positivo",
    "respondedBy": "'$USER_ID'"
  }' | jq

# 6. Ver estadísticas del recurso
echo -e "\n6. Estadísticas del recurso..."
curl -s "$BASE_URL/statistics/resource/$RESOURCE_ID" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq

# 7. Ver estadísticas generales
echo -e "\n7. Estadísticas generales..."
curl -s "$BASE_URL/statistics/general" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq

echo -e "\n✅ Pruebas completadas"
```

---

## 📈 Validaciones de Negocio

### ✅ Checklist de Validaciones

- [x] Rating entre 1-5
- [x] Un feedback por reserva (no duplicados)
- [x] Sentimiento calculado automáticamente
- [x] Estado inicial siempre PENDING
- [x] Solo staff puede responder feedback
- [x] Respuesta actualiza estado a RESPONDED
- [x] Estadísticas calculadas en tiempo real
- [x] Filtrado por usuario, recurso y estado
- [x] Paginación funcional
- [x] Eventos publicados al crear y responder

---

## 🎯 Escenarios de Uso

### Escenario 1: Usuario Satisfecho

1. Usuario completa reserva
2. Sistema envía solicitud de feedback
3. Usuario califica con 5 estrellas y comenta
4. Sentimiento: POSITIVE
5. Staff ve el feedback y responde agradeciendo

### Escenario 2: Usuario Insatisfecho

1. Usuario tiene problema con recurso
2. Califica con 2 estrellas y describe el problema
3. Sentimiento: NEGATIVE
4. Staff recibe alerta de feedback negativo
5. Staff investiga y responde con solución
6. Estado cambia a RESPONDED

### Escenario 3: Análisis de Calidad

1. Administrador consulta estadísticas de Sala 101
2. Ve 4.5 de rating promedio con 50 feedbacks
3. Identifica 3 feedbacks negativos sobre aire acondicionado
4. Genera orden de mantenimiento
5. Sigue monitoreando feedbacks posteriores

---

## 🔍 Verificación Final

### ✅ Checklist de Completitud RF-34

- [x] Crear feedback con validación de datos
- [x] Consultar feedback por ID, usuario, recurso
- [x] Responder feedback por staff
- [x] Actualizar estados (PENDING, RESPONDED, CLOSED)
- [x] Estadísticas por recurso (rating, distribución)
- [x] Estadísticas generales del sistema
- [x] Filtrado por estado
- [x] Paginación en listados
- [x] Categorización de feedback
- [x] Cálculo automático de sentimiento
- [x] Eventos publicados (created, responded, statusChanged)
- [x] Logging estructurado
- [x] Seguridad con JWT y permisos
- [x] Documentación Swagger completa

---

## 📚 Referencias

- **HU-29**: Registro de feedback de usuarios
- **RF-34**: Sistema completo de feedback
- **Eventos**: `reports.feedback.created`, `reports.feedback.responded`, `reports.feedback.statusChanged`

---

**Estado**: RF-34 Sistema de Feedback - 100% IMPLEMENTADO ✅
