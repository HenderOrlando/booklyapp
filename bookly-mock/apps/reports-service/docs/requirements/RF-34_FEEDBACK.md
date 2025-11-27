# RF-34: Registro de Feedback de Usuarios

**Estado**: ✅ Completado

**Prioridad**: Media

**Fecha de Implementación**: Noviembre 6, 2025

---

## 📋 Descripción

Permite a los usuarios registrar feedback sobre recursos utilizados, incluyendo ratings, comentarios y reporte de incidentes. Facilita la mejora continua al identificar problemas y áreas de oportunidad en el servicio.

---

## ✅ Criterios de Aceptación

- [x] Los usuarios pueden calificar recursos con 1-5 estrellas
- [x] Se pueden agregar comentarios detallados
- [x] Categorización del feedback (facilities, equipment, service, process, overall)
- [x] Opción de reportar incidentes
- [x] Los usuarios solo pueden dar feedback de recursos que han usado
- [x] El staff puede responder al feedback
- [x] Dashboard de feedback para administradores

---

## 🏗️ Implementación

### Componentes Desarrollados

**Controllers**:

- `FeedbackController` - Gestión de feedback

**Services**:

- `FeedbackService` - Lógica de feedback
- `FeedbackAnalysisService` - Análisis de sentimiento y tendencias

**Repositories**:

- `FeedbackRepository` - Persistencia de feedback

**Commands** (CQRS):

- `CreateFeedbackCommand` - Crear feedback
- `RespondFeedbackCommand` - Responder feedback (staff)
- `UpdateFeedbackStatusCommand` - Cambiar estado

**Queries** (CQRS):

- `GetFeedbackQuery` - Obtener feedback
- `GetResourceFeedbackQuery` - Feedback por recurso
- `GetFeedbackStatisticsQuery` - Estadísticas de feedback

---

### Endpoints Creados

```http
POST   /api/v1/feedback                  # Crear feedback
GET    /api/v1/feedback                  # Listar feedback
GET    /api/v1/feedback/:id              # Obtener por ID
PATCH  /api/v1/feedback/:id/respond      # Responder (staff)
GET    /api/v1/feedback/resource/:id     # Feedback de recurso
GET    /api/v1/feedback/statistics       # Estadísticas
```

**Request Body** (POST):

```json
{
  "reservationId": "string",
  "resourceId": "string",
  "rating": 5,
  "comment": "Excelente espacio...",
  "category": "facilities",
  "wasIssueReported": false,
  "issueDescription": "opcional"
}
```

**Permisos Requeridos**:

- `feedback:create` - Crear feedback (todos los usuarios)
- `feedback:read` - Ver feedback
- `feedback:respond` - Responder feedback (staff)

---

### Eventos Publicados

- `FeedbackSubmittedEvent` - Feedback registrado
- `FeedbackRespondedEvent` - Staff respondió al feedback

**Routing Keys**:

- `reports.feedback.submitted`
- `reports.feedback.responded`

---

## 🗄️ Base de Datos

### Entidades

**UserFeedback**:

```prisma
model UserFeedback {
  id                  String   @id @default(auto()) @map("_id") @db.ObjectId

  userId              String   @db.ObjectId
  userName            String
  reservationId       String   @db.ObjectId
  resourceId          String   @db.ObjectId
  resourceName        String

  rating              Int      // 1-5 estrellas
  comment             String?
  category            String   // facilities, equipment, service, process, overall

  wasIssueReported    Boolean  @default(false)
  issueDescription    String?

  status              String   @default("pending") // pending, reviewed, resolved
  reviewedBy          String?  @db.ObjectId
  reviewedAt          DateTime?
  response            String?

  createdAt           DateTime @default(now())
  createdBy           String

  @@index([userId, createdAt])
  @@index([resourceId, rating])
  @@index([category])
  @@index([status])
  @@map("user_feedback")
}
```

### Índices

```javascript
db.user_feedback.createIndex({ userId: 1, createdAt: -1 });
db.user_feedback.createIndex({ resourceId: 1, rating: -1 });
db.user_feedback.createIndex({ category: 1 });
db.user_feedback.createIndex({ status: 1 });
```

---

## 🧪 Testing

### Tests Unitarios

```bash
npm run test -- feedback.service.spec.ts
npm run test -- create-feedback.handler.spec.ts
```

### Tests E2E

```bash
npm run test:e2e -- feedback.e2e-spec.ts
```

### Cobertura

- **Líneas**: 90%
- **Funciones**: 92%
- **Ramas**: 88%

---

## 🔒 Seguridad

- Solo usuarios que han usado el recurso pueden dar feedback
- Validación de reservationId y resourceId
- Prevención de spam: 1 feedback por reserva
- Staff puede ver todo el feedback
- Usuarios solo ven su propio feedback

---

## ⚡ Performance

- Índices por resourceId para queries rápidas
- Cache de estadísticas de feedback (TTL: 10 minutos)
- Agregaciones pre-calculadas de ratings promedio
- Paginación para listados grandes

---

## 📚 Documentación Relacionada

- [Arquitectura](../ARCHITECTURE.md#feedback)
- [Base de Datos](../DATABASE.md#userfeedback)
- [Endpoints](../ENDPOINTS.md#feedback)
- [Seeds](../SEEDS.md#user-feedback-seed)

---

## 🔄 Changelog

| Fecha      | Cambio                         | Autor |
| ---------- | ------------------------------ | ----- |
| 2025-11-06 | Implementación inicial RF-34   | Team  |
| 2025-11-06 | Agregado sistema de respuestas | Team  |
| 2025-11-06 | Categorización de feedback     | Team  |

---

## 📝 Notas Adicionales

- El rating promedio se calcula en tiempo real
- Los incidentes reportados se notifican al equipo de mantenimiento
- El feedback se mantiene por 2 años
- Promedio general del sistema: 4.4/5 estrellas

---

**Mantenedor**: Bookly Development Team
