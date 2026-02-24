# 🧪 Guía de Pruebas - RF-35: Sistema de Evaluación de Usuarios

**Servicio**: Reports Service  
**Funcionalidad**: Evaluación de Usuarios (RF-35)  
**Fecha**: Noviembre 17, 2025  
**Estado**: ✅ 100% Implementado

---

## 📋 Resumen del Sistema

El **Sistema de Evaluación de Usuarios (RF-35)** permite al personal administrativo evaluar el desempeño de los usuarios del sistema Bookly basándose en tres métricas principales:

### Métricas de Evaluación:

- **Cumplimiento (Compliance)**: 40% del score total
- **Puntualidad (Punctuality)**: 30% del score total
- **Cuidado de Recursos (ResourceCare)**: 30% del score total

### Funcionalidades Clave:

- ✅ Cálculo automático del `overallScore` ponderado
- ✅ Sistema de acceso prioritario automático (threshold >= 80)
- ✅ Identificación de usuarios que requieren seguimiento (score < 70 o compliance < 60)
- ✅ Estadísticas con tendencias (improving/stable/declining)

---

## ⚙️ Configuración Inicial

### Base URL y Headers

```bash
BASE_URL=http://localhost:3003/api/v1/evaluations

# Headers requeridos
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
```

### Variables de Prueba

```bash
export TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
export USER_ID="507f1f77bcf86cd799439011"
export EVALUATOR_ID="507f1f77bcf86cd799439012"
export EVALUATION_ID="507f1f77bcf86cd799439013"
```

---

## 📡 Endpoints Disponibles

| Método | Endpoint                               | Permiso                     | Descripción                 |
| ------ | -------------------------------------- | --------------------------- | --------------------------- |
| POST   | `/evaluations`                         | `reports:evaluation:create` | Crear evaluación            |
| GET    | `/evaluations/:id`                     | `reports:evaluation:read`   | Obtener por ID              |
| GET    | `/evaluations/user/:userId`            | `reports:evaluation:read`   | Lista de usuario (paginada) |
| GET    | `/evaluations/user/:userId/latest`     | `reports:evaluation:read`   | Última evaluación           |
| GET    | `/evaluations/period`                  | `reports:evaluation:read`   | Por período (paginada)      |
| GET    | `/evaluations/priority-users`          | `reports:evaluation:read`   | Usuarios prioritarios       |
| GET    | `/evaluations/follow-up`               | `reports:evaluation:read`   | Requieren seguimiento       |
| GET    | `/evaluations/user/:userId/statistics` | `reports:evaluation:read`   | Stats usuario               |
| GET    | `/evaluations/statistics`              | `reports:evaluation:read`   | Stats generales             |
| PATCH  | `/evaluations/:id`                     | `reports:evaluation:update` | Actualizar                  |
| DELETE | `/evaluations/:id`                     | `reports:evaluation:delete` | Eliminar                    |

---

## 🧪 Casos de Prueba Principales

### 1️⃣ Crear Evaluación - Usuario Excelente (Score >= 80)

```bash
curl -X POST http://localhost:3003/api/v1/evaluations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "userId": "507f1f77bcf86cd799439011",
    "userName": "Juan Pérez",
    "userEmail": "juan.perez@ufps.edu.co",
    "evaluatedBy": "507f1f77bcf86cd799439012",
    "evaluatorName": "María García",
    "evaluatorRole": "staff_admin",
    "complianceScore": 95,
    "punctualityScore": 90,
    "resourceCareScore": 85,
    "comments": "Excelente usuario",
    "recommendations": "Mantener el buen desempeño"
  }'
```

**Resultado Esperado**:

- ✅ `overallScore` calculado: 90 (95×0.4 + 90×0.3 + 85×0.3)
- ✅ Evento publicado: `reports.evaluation.created`
- ✅ Evento publicado: `reports.evaluation.priorityGranted`

---

### 2️⃣ Crear Evaluación - Usuario Regular (Score < 80)

```bash
curl -X POST http://localhost:3003/api/v1/evaluations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "userId": "507f1f77bcf86cd799439014",
    "userName": "Pedro López",
    "userEmail": "pedro.lopez@ufps.edu.co",
    "evaluatedBy": "507f1f77bcf86cd799439012",
    "evaluatorName": "María García",
    "evaluatorRole": "staff_admin",
    "complianceScore": 70,
    "punctualityScore": 75,
    "resourceCareScore": 65,
    "comments": "Usuario promedio"
  }'
```

**Resultado Esperado**:

- ✅ `overallScore` calculado: 70.5
- ✅ Evento publicado: `reports.evaluation.created`
- ❌ NO se publica `priorityGranted`

---

### 3️⃣ Obtener Usuarios Prioritarios

```bash
curl -X GET "http://localhost:3003/api/v1/evaluations/priority-users?threshold=80" \
  -H "Authorization: Bearer $TOKEN"
```

**Resultado Esperado**: Lista de usuarios con última evaluación >= 80

---

### 4️⃣ Obtener Usuarios que Requieren Seguimiento

```bash
curl -X GET "http://localhost:3003/api/v1/evaluations/follow-up" \
  -H "Authorization: Bearer $TOKEN"
```

**Resultado Esperado**: Usuarios con score < 70 o compliance < 60

---

### 5️⃣ Estadísticas de Usuario

```bash
curl -X GET "http://localhost:3003/api/v1/evaluations/user/$USER_ID/statistics" \
  -H "Authorization: Bearer $TOKEN"
```

**Respuesta Esperada**:

```json
{
  "success": true,
  "data": {
    "totalEvaluations": 12,
    "averageOverallScore": 87.5,
    "latestScore": 90,
    "trend": "improving"
  }
}
```

**Tendencias**:

- `improving`: Score actual > promedio
- `stable`: Score actual == promedio
- `declining`: Score actual < promedio

---

### 6️⃣ Actualizar Evaluación

```bash
curl -X PATCH "http://localhost:3003/api/v1/evaluations/$EVALUATION_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "complianceScore": 85,
    "punctualityScore": 80,
    "resourceCareScore": 82,
    "comments": "Mejora notable"
  }'
```

**Eventos Publicados**:

- ✅ `reports.evaluation.updated`
- ✅ `priorityGranted` o `priorityRevoked` (según cambio de score)

---

## 🔄 Flujo Completo: Usuario con Mejora

```bash
# 1. Primera evaluación (bajo)
curl -X POST http://localhost:3003/api/v1/evaluations -H "..." -d '{
  "userId": "...", "complianceScore": 60, "punctualityScore": 65, "resourceCareScore": 70
}'
# → Score: 64.5, sin acceso prioritario

# 2. Verificar en seguimiento
curl -X GET "http://localhost:3003/api/v1/evaluations/follow-up" -H "..."
# → Usuario debe aparecer

# 3. Segunda evaluación (mejora)
curl -X POST http://localhost:3003/api/v1/evaluations -H "..." -d '{
  "userId": "...", "complianceScore": 85, "punctualityScore": 82, "resourceCareScore": 80
}'
# → Score: 82.9, acceso prioritario otorgado

# 4. Verificar en prioritarios
curl -X GET "http://localhost:3003/api/v1/evaluations/priority-users" -H "..."
# → Usuario debe aparecer

# 5. Ver tendencia
curl -X GET "http://localhost:3003/api/v1/evaluations/user/.../statistics" -H "..."
# → trend: "improving"
```

---

## ❌ Validaciones y Errores

### Error 400 - Scores Inválidos

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "complianceScore", "message": "must not be greater than 100" },
    { "field": "punctualityScore", "message": "must not be less than 0" }
  ]
}
```

### Error 401 - No Autorizado

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### Error 403 - Permisos Insuficientes

```json
{
  "statusCode": 403,
  "message": "Insufficient permissions"
}
```

### Error 404 - No Encontrado

```json
{
  "success": false,
  "message": "Evaluation not found"
}
```

---

## 📤 Eventos Publicados

### 1. `reports.evaluation.created`

Publicado al crear una evaluación.

### 2. `reports.evaluation.updated`

Publicado al actualizar una evaluación.

### 3. `reports.evaluation.priorityGranted`

Publicado cuando un usuario alcanza score >= 80.

### 4. `reports.evaluation.priorityRevoked`

Publicado cuando un usuario baja de score < 80.

---

## ✅ Checklist de Pruebas

- [ ] Crear evaluación con score alto (>= 80)
- [ ] Crear evaluación con score bajo (< 80)
- [ ] Validar cálculo automático de `overallScore`
- [ ] Verificar otorgamiento automático de acceso prioritario
- [ ] Verificar revocación automática de acceso prioritario
- [ ] Listar usuarios prioritarios
- [ ] Listar usuarios que requieren seguimiento
- [ ] Obtener estadísticas de usuario con tendencias
- [ ] Obtener estadísticas generales del sistema
- [ ] Actualizar evaluación y verificar eventos
- [ ] Validar paginación en endpoints de lista
- [ ] Verificar permisos en todos los endpoints
- [ ] Validar errores con datos inválidos

---

**Última actualización**: Noviembre 17, 2025  
**Autor**: Bookly Development Team
