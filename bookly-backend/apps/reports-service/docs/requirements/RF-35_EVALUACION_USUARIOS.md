# RF-35: Evaluación de Usuarios por el Staff

**Estado**: ✅ Completado

**Prioridad**: Media

**Fecha de Implementación**: Noviembre 6, 2025

---

## 📋 Descripción

Permite al staff administrativo evaluar el comportamiento de usuarios basándose en su historial de reservas, cumplimiento, puntualidad y uso responsable de recursos. Las evaluaciones ayudan a identificar usuarios destacados para acceso prioritario y usuarios que requieren seguimiento.

---

## ✅ Criterios de Aceptación

- [x] El staff puede crear evaluaciones trimestrales de usuarios
- [x] Se calcula automáticamente un compliance score (0-100)
- [x] Incluye métricas objetivas (reservas, cancelaciones, no-shows)
- [x] Permite agregar fortalezas y áreas de mejora
- [x] Sistema de recomendación para acceso prioritario
- [x] Historial completo de evaluaciones
- [x] Los usuarios pueden ver sus evaluaciones

---

## 🏗️ Implementación

### Componentes Desarrollados

**Controllers**:

- `EvaluationController` - Gestión de evaluaciones

**Services**:

- `UserEvaluationService` - Lógica de evaluaciones
- `ComplianceCalculatorService` - Cálculo automático de compliance

**Repositories**:

- `UserEvaluationRepository` - Persistencia de evaluaciones

**Commands** (CQRS):

- `CreateUserEvaluationCommand` - Crear evaluación
- `UpdateUserEvaluationCommand` - Actualizar evaluación
- `CalculateComplianceScoreCommand` - Calcular compliance

**Queries** (CQRS):

- `GetUserEvaluationQuery` - Obtener evaluación
- `GetUserEvaluationHistoryQuery` - Historial de evaluaciones
- `GetPriorityUsersQuery` - Usuarios con acceso prioritario

---

### Endpoints Creados

```http
POST   /api/v1/evaluations                  # Crear evaluación
GET    /api/v1/evaluations/:userId          # Evaluaciones de usuario
GET    /api/v1/evaluations/user/me          # Mis evaluaciones
GET    /api/v1/evaluations/priority-users   # Usuarios prioritarios
PATCH  /api/v1/evaluations/:id              # Actualizar evaluación
```

**Request Body** (POST):

```json
{
  "evaluatedUserId": "string",
  "period": "Q1-2024",
  "rating": 5,
  "comments": "Usuario ejemplar...",
  "strengths": ["Puntualidad", "Responsabilidad"],
  "areasForImprovement": ["Cancelar con anticipación"],
  "recommendForPriorityAccess": true
}
```

**Permisos Requeridos**:

- `evaluations:create` - Crear evaluación (admin, staff)
- `evaluations:read-own` - Ver evaluaciones propias
- `evaluations:read-all` - Ver todas las evaluaciones (admin)

---

### Eventos Publicados

- `UserEvaluationCreatedEvent` - Evaluación creada
- `PriorityAccessGrantedEvent` - Acceso prioritario otorgado

**Routing Keys**:

- `reports.evaluation.created`
- `reports.priority.granted`

---

## 🗄️ Base de Datos

### Entidades

**UserEvaluation**:

```prisma
model UserEvaluation {
  id                          String   @id @default(auto()) @map("_id") @db.ObjectId

  evaluatedUserId             String   @db.ObjectId
  evaluatedUserName           String
  evaluatorId                 String   @db.ObjectId
  evaluatorName               String

  period                      String   // Q1-2024, Q2-2024

  totalReservations           Int
  completedReservations       Int
  cancelledReservations       Int
  noShowCount                 Int
  averageCheckInDelay         Int      // minutos

  complianceScore             Int      // 0-100
  rating                      Int      // 1-5
  comments                    String?

  strengths                   Json     // string[]
  areasForImprovement         Json     // string[]
  recommendForPriorityAccess  Boolean

  evaluatedAt                 DateTime
  createdBy                   String

  @@index([evaluatedUserId, period])
  @@index([complianceScore])
  @@index([recommendForPriorityAccess])
  @@map("user_evaluations")
}
```

### Índices

```javascript
db.user_evaluations.createIndex({ evaluatedUserId: 1, period: -1 });
db.user_evaluations.createIndex({ complianceScore: -1 });
db.user_evaluations.createIndex({ recommendForPriorityAccess: 1 });
```

---

## 🧪 Testing

### Tests Unitarios

```bash
npm run test -- user-evaluation.service.spec.ts
npm run test -- compliance-calculator.service.spec.ts
```

### Tests E2E

```bash
npm run test:e2e -- evaluation.e2e-spec.ts
```

### Cobertura

- **Líneas**: 87%
- **Funciones**: 90%
- **Ramas**: 85%

---

## 🔒 Seguridad

- Solo staff y administradores pueden crear evaluaciones
- Los usuarios pueden ver sus propias evaluaciones
- Auditoría completa de quién evalúa a quién
- Prevención de auto-evaluación

---

## ⚡ Performance

- Cálculo automático de compliance score
- Cache de lista de usuarios prioritarios (TTL: 1 hora)
- Índices para búsquedas rápidas por período
- Agregaciones pre-calculadas trimestrales

---

## 📚 Documentación Relacionada

- [Arquitectura](../ARCHITECTURE.md#evaluaciones)
- [Base de Datos](../DATABASE.md#userevaluation)
- [Endpoints](../ENDPOINTS.md#evaluaciones)
- [Seeds](../SEEDS.md#user-evaluations-seed)

---

## 🔄 Changelog

| Fecha      | Cambio                           | Autor |
| ---------- | -------------------------------- | ----- |
| 2025-11-06 | Implementación inicial RF-35     | Team  |
| 2025-11-06 | Cálculo automático de compliance | Team  |
| 2025-11-06 | Sistema de acceso prioritario    | Team  |

---

## 📝 Notas Adicionales

**Cálculo de Compliance Score**:

```
compliance = (completedReservations / totalReservations) × 100
- Penalización por no-shows: -10 puntos por cada uno
- Penalización por cancelaciones tardías: -5 puntos
- Bonus por puntualidad: +5 puntos si delay promedio < 5 min
```

**Acceso Prioritario**:

- Se otorga a usuarios con compliance ≥ 90%
- Rating ≥ 4 estrellas
- Recomendación del evaluador

---

**Mantenedor**: Bookly Development Team
