# 🌱 Reports Service - Seeds

**Fecha**: Noviembre 23, 2025  
**Versión**: 2.0 (Refactorizado para idempotencia)

---

## 📋 Índice

- [Descripción](#descripción)
- [Ejecución de Seeds](#ejecución-de-seeds)
- [Seeds Disponibles](#seeds-disponibles)
- [Cobertura de Requerimientos Funcionales](#cobertura-de-requerimientos-funcionales)

---

## 📖 Descripción

Los seeds del Reports Service permiten poblar la base de datos con datos iniciales necesarios para análisis y reportes, cubriendo los siguientes Requerimientos Funcionales:

- **UserFeedback**: Feedback de usuarios sobre recursos (RF-34)
- **UserEvaluation**: Evaluaciones administrativas de comportamiento (RF-35)
- **UsageStatistic**: Estadísticas de uso por recurso, usuario y programa (RF-31, RF-32)
- **UnsatisfiedDemand**: Demanda no satisfecha para análisis (RF-37)

---

## 🚀 Ejecución de Seeds

### Comando Principal

```bash
# Ejecutar seeds (idempotente por defecto)
npm run seed:reports

# Limpiar DB antes de seed (destructivo)
npm run seed:reports -- --clean

# Desde cualquier ubicación del monorepo
cd bookly-backend
npm run seed:reports
```

### ⚠️ Importante: Idempotencia

Los seeds son **100% idempotentes**:
- Ejecutar múltiples veces **NO genera duplicados**
- Usa `findOneAndUpdate` con `upsert: true`
- Solo el flag `--clean` limpia la base de datos
- Seguro para desarrollo y producción

---

## 🌾 Seeds Disponibles

### 1. User Feedback (RF-34)

**Descripción**: Feedback de usuarios sobre sus experiencias con recursos reservados.

**Datos Creados**: 2 feedbacks

| Usuario | Recurso | Rating | Estado | Categoría |
|---------|---------|--------|---------|-----------|
| Juan Docente | Auditorio Principal | 5/5 | RESPONDED | FACILITY |
| María Estudiante | Laboratorio Sistemas 1 | 4/5 | PENDING | EQUIPMENT |

**Estructura v2.0**:
```typescript
{
  userId: Types.ObjectId,               // ObjectId fijo
  userName: string,
  reservationId: Types.ObjectId,        // ObjectId fijo
  resourceId: Types.ObjectId,           // ObjectId fijo
  resourceName: string,
  rating: number,                       // 1-5
  status: FeedbackStatus,               // Enum: PENDING, RESPONDED, CLOSED
  comments?: string,
  feedbackDate: Date,
  category?: FeedbackCategory,          // Enum: FACILITY, SERVICE, EQUIPMENT
  isAnonymous: boolean,
  response?: string,
  respondedBy?: Types.ObjectId,
  respondedAt?: Date
}
```

**Cambios Clave v2.0**:
- ✅ Usa `Types.ObjectId` para todos los IDs
- ✅ Enums `FeedbackStatus`, `FeedbackCategory`
- ✅ Filtro idempotente por `reservationId`

---

### 2. User Evaluation (RF-35)

**Descripción**: Evaluaciones administrativas del comportamiento de usuarios.

**Datos Creados**: 2 evaluaciones

| Usuario | Evaluador | Overall Score | Compliance | Punctuality | Resource Care |
|---------|-----------|---------------|------------|-------------|---------------|
| Juan Docente | Admin Sistema | 95 | 95 | 100 | 90 |
| María Estudiante | Admin Sistema | 85 | 85 | 80 | 90 |

**Estructura v2.0**:
```typescript
{
  userId: Types.ObjectId,
  userName: string,
  userEmail: string,
  evaluatedBy: Types.ObjectId,
  evaluatorName: string,
  evaluatorRole: string,
  evaluationDate: Date,
  complianceScore: number,              // 0-100
  punctualityScore: number,             // 0-100
  resourceCareScore: number,            // 0-100
  overallScore: number,                 // 0-100
  comments?: string,
  recommendations?: string,
  period?: {
    startDate: Date,
    endDate: Date
  }
}
```

**Cambios Clave v2.0**:
- ✅ ObjectIds para `userId` y `evaluatedBy`
- ✅ Scores numéricos (0-100)
- ✅ Filtro idempotente por `userId + evaluationDate`

---

### 3. Usage Statistic (RF-31, RF-32)

**Descripción**: Estadísticas agregadas de uso de recursos.

**Datos Creados**: 3 estadísticas

| Tipo | Referencia | Total Reservas | Confirmadas | Completadas | Rating Promedio |
|------|-----------|----------------|-------------|-------------|-----------------|
| RESOURCE | Auditorio Principal | 45 | 42 | 40 | 4.7 |
| USER | Juan Docente | 12 | 12 | 12 | 5.0 |
| PROGRAM | Ing. Sistemas | 78 | 72 | 70 | 4.5 |

**Estructura v2.0**:
```typescript
{
  statisticType: UsageStatisticType,    // Enum: RESOURCE, USER, PROGRAM
  referenceId: Types.ObjectId,
  referenceName: string,
  periodStart: Date,
  periodEnd: Date,
  totalReservations: number,
  confirmedReservations: number,
  cancelledReservations: number,
  completedReservations: number,
  totalHoursReserved: number,
  totalHoursUsed: number,
  averageRating?: number,
  uniqueUsers?: number,
  peakUsageTimes: string[],             // ["09:00-11:00", "14:00-16:00"]
  mostUsedResources: [{
    resourceId: Types.ObjectId,
    resourceName: string,
    count: number
  }]
}
```

**Cambios Clave v2.0**:
- ✅ Enum `UsageStatisticType`
- ✅ Estructura `MostUsedResource` con ObjectIds
- ✅ Filtro idempotente por `statisticType + referenceId + periodStart`

---

### 4. Unsatisfied Demand (RF-37)

**Descripción**: Registro de demanda no satisfecha para análisis y mejora.

**Datos Creados**: 2 demandas

| Recurso | Solicitante | Razón | Prioridad | Estado | Alternativas |
|---------|-------------|-------|-----------|--------|--------------|
| Auditorio | Juan Docente | UNAVAILABLE | HIGH | RESOLVED | Sala Conferencias A |
| Laboratorio | María Estudiante | MAINTENANCE | NORMAL | PENDING | - |

**Estructura v2.0**:
```typescript
{
  resourceId: Types.ObjectId,
  resourceName: string,
  resourceType: string,
  requestedBy: Types.ObjectId,
  requesterName: string,
  requesterEmail: string,
  requestedDate: Date,
  requestedStartTime: Date,
  requestedEndTime: Date,
  duration: number,
  reason: UnsatisfiedDemandReason,      // Enum: CONFLICT, UNAVAILABLE, CAPACITY, MAINTENANCE, OTHER
  priority: UnsatisfiedDemandPriority,  // Enum: LOW, NORMAL, HIGH
  status: UnsatisfiedDemandStatus,      // Enum: PENDING, RESOLVED, CANCELLED
  reasonDetails?: string,
  program?: string,
  alternatives: [{
    resourceId: Types.ObjectId,
    resourceName: string,
    availableDate: Date
  }],
  resolvedAt?: Date,
  resolvedBy?: Types.ObjectId,
  resolutionNotes?: string
}
```

**Cambios Clave v2.0**:
- ✅ Enums para `reason`, `priority` y `status`
- ✅ Estructura `AlternativeResource` con ObjectIds
- ✅ Filtro idempotente por `resourceId + requestedBy + requestedStartTime`

---

## 🎯 Cobertura de Requerimientos Funcionales

### RF-31: Reporte de uso por recurso/programa/período ✅
- **Cubierto por**: `UsageStatistic` con `statisticType: RESOURCE` y `PROGRAM`
- **Datos seed**: Auditorio Principal (45 reservas), Ing. Sistemas (78 reservas)
- **Métricas incluidas**: Total, confirmadas, canceladas, completadas, horas, ratings

### RF-32: Reporte por usuario/profesor ✅
- **Cubierto por**: `UsageStatistic` con `statisticType: USER`
- **Datos seed**: Juan Docente (12 reservas, rating 5.0)
- **Métricas incluidas**: Total reservas, recursos más usados, horarios pico

### RF-34: Registro de feedback de usuarios ✅
- **Cubierto por**: `UserFeedback`
- **Datos seed**: 2 feedbacks (rating 5 y 4)
- **Categorías**: FACILITY, EQUIPMENT
- **Estados**: PENDING, RESPONDED

### RF-35: Evaluación de usuarios por el staff ✅
- **Cubierto por**: `UserEvaluation`
- **Datos seed**: 2 evaluaciones (scores 95 y 85)
- **Criterios**: Compliance, Punctuality, Resource Care, Overall

### RF-37: Reporte de demanda insatisfecha ✅
- **Cubierto por**: `UnsatisfiedDemand`
- **Datos seed**: 2 demandas (1 resuelta, 1 pendiente)
- **Razones**: UNAVAILABLE, MAINTENANCE
- **Prioridades**: HIGH, NORMAL

---

## 🔑 ObjectIds Fijos para Consistencia

```typescript
// Sistema
const systemUserId = "507f1f77bcf86cd799439000"

// Usuarios
const userDocenteId = "507f1f77bcf86cd799439021"
const userEstudianteId = "507f1f77bcf86cd799439023"
const userAdminId = "507f1f77bcf86cd799439022"

// Recursos
const auditorioId = "507f1f77bcf86cd799439011"
const laboratorioId = "507f1f77bcf86cd799439012"
const salaId = "507f1f77bcf86cd799439013"

// Reservas
const reservation1Id = "507f1f77bcf86cd799439031"
const reservation2Id = "507f1f77bcf86cd799439032"

// Programa
const programaSistemasId = "507f1f77bcf86cd799439041"
```

---

## 📊 Resumen

- **Total de colecciones**: 4
- **Total de documentos**: 9 (2 feedbacks + 2 evaluations + 3 statistics + 2 demands)
- **RF cubiertos**: RF-31, RF-32, RF-34, RF-35, RF-37
- **Idempotencia**: 100% (verificado con 2 ejecuciones)
- **ObjectIds fijos**: Sí (para consistencia cross-service)

---

**Última actualización**: Noviembre 23, 2025  
**Estado**: ✅ 100% Completado - Idempotente y Documentado
